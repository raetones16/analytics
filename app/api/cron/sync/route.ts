import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../utils/supabaseClient";
import { spawn } from "child_process";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import yaml from "js-yaml";

const MELTANO_YML_PATH = path.join(process.cwd(), "meltano.yml");

// Helper function to calculate next sync time
function calculateNextSync(frequency: string, lastSync?: Date): Date {
  const now = new Date();
  const base = lastSync || now;

  switch (frequency) {
    case "hourly":
      return new Date(base.getTime() + 60 * 60 * 1000); // +1 hour
    case "daily":
      return new Date(base.getTime() + 24 * 60 * 60 * 1000); // +1 day
    case "weekly":
      return new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000); // +1 week
    case "monthly":
      const nextMonth = new Date(base);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return new Date(base.getTime() + 24 * 60 * 60 * 1000); // Default to daily
  }
}

// Helper function to run sync for a single integration
async function runSync(
  integration: any
): Promise<{ success: boolean; error?: string; output?: string }> {
  try {
    // Update meltano.yml with integration config
    const ymlRaw = await readFile(MELTANO_YML_PATH, "utf8");
    let meltanoYml: any;
    try {
      meltanoYml = yaml.load(ymlRaw) as any;
    } catch (yamlError) {
      return { success: false, error: "Failed to parse meltano.yml" };
    }

    // Update tap-salesforce config
    const tapSalesforce = meltanoYml.plugins.extractors.find(
      (extractor: any) => extractor.name === "tap-salesforce"
    );
    if (tapSalesforce) {
      tapSalesforce.config = {
        ...tapSalesforce.config,
        ...integration.config,
      };

      // Update field selections if specified
      if (
        integration.selected_fields &&
        Object.keys(integration.selected_fields).length > 0
      ) {
        tapSalesforce.select = [];
        for (const [objectName, fields] of Object.entries(
          integration.selected_fields
        )) {
          if (Array.isArray(fields) && fields.length > 0) {
            tapSalesforce.select.push(`${objectName}.*`);
          }
        }
      }
    }

    await writeFile(MELTANO_YML_PATH, yaml.dump(meltanoYml));

    // Run Meltano sync
    return new Promise((resolve) => {
      const meltano = spawn(
        "meltano",
        ["run", "--force", "tap-salesforce", "target-jsonl"],
        {
          env: {
            ...process.env,
            TAP_SALESFORCE_CLIENT_ID: integration.secrets.client_id,
            TAP_SALESFORCE_CLIENT_SECRET: integration.secrets.client_secret,
            TAP_SALESFORCE_REFRESH_TOKEN: integration.secrets.refresh_token,
          },
        }
      );

      let output = "";
      let errorOutput = "";

      meltano.stdout.on("data", (data) => {
        output += data.toString();
      });

      meltano.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      meltano.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          resolve({
            success: false,
            error: "Sync failed",
            output: errorOutput,
          });
        }
      });
    });
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify this is a legitimate cron request (in production, add authentication)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find integrations that are due for sync
    const { data: integrations, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("sync_enabled", true)
      .lte("next_sync_at", now.toISOString())
      .neq("sync_frequency", "manual");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({
        message: "No integrations due for sync",
        count: 0,
      });
    }

    const results = [];

    // Process each integration
    for (const integration of integrations) {
      console.log(
        `Starting sync for integration: ${integration.name} (${integration.id})`
      );

      const syncResult = await runSync(integration);

      // Update integration with sync results
      const nextSyncAt = calculateNextSync(integration.sync_frequency, now);

      await supabase
        .from("integrations")
        .update({
          last_sync_at: now.toISOString(),
          next_sync_at: nextSyncAt.toISOString(),
          status: syncResult.success ? "connected" : "error",
        })
        .eq("id", integration.id);

      results.push({
        integration_id: integration.id,
        integration_name: integration.name,
        success: syncResult.success,
        error: syncResult.error,
        next_sync_at: nextSyncAt.toISOString(),
      });

      console.log(
        `Sync completed for ${integration.name}: ${
          syncResult.success ? "SUCCESS" : "FAILED"
        }`
      );
    }

    return NextResponse.json({
      message: `Processed ${integrations.length} integrations`,
      results,
    });
  } catch (err: any) {
    console.error("Cron sync error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

// Also allow GET for testing
export async function GET(req: NextRequest) {
  // For testing purposes, allow GET requests
  return POST(req);
}
