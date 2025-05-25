import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../utils/supabaseClient";
import { writeFile, unlink, readFile } from "fs/promises";
import { spawn } from "child_process";
import path from "path";
import yaml from "js-yaml";

const MELTANO_YML_PATH = path.join(process.cwd(), "meltano.yml");

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // 1. Fetch integration config from Supabase
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) {
    return NextResponse.json(
      { success: false, error: error?.message || "Integration not found" },
      { status: 404 }
    );
  }

  try {
    // 2. Update meltano.yml with non-sensitive config only
    const ymlRaw = await readFile(MELTANO_YML_PATH, "utf8");
    let meltanoYml: any;
    try {
      meltanoYml = yaml.load(ymlRaw) as any;
    } catch (yamlError) {
      return NextResponse.json(
        { success: false, error: "Failed to parse meltano.yml" },
        { status: 500 }
      );
    }

    // Update only non-sensitive config
    const tapSalesforce = meltanoYml.plugins.extractors.find(
      (extractor: any) => extractor.name === "tap-salesforce"
    );
    if (tapSalesforce) {
      tapSalesforce.config = {
        ...tapSalesforce.config,
        ...data.config, // instance_url, start_date, api_type, select_fields_by_default
        // Do NOT include secrets here - they'll be set as env vars
      };
    }

    await writeFile(MELTANO_YML_PATH, yaml.dump(meltanoYml));

    // 3. Run Meltano with secrets as environment variables
    return new Promise((resolve) => {
      const meltano = spawn(
        "meltano",
        ["run", "--force", "tap-salesforce", "target-jsonl"],
        {
          env: {
            ...process.env,
            // Set tap-salesforce secrets as environment variables
            TAP_SALESFORCE_CLIENT_ID: data.secrets.client_id,
            TAP_SALESFORCE_CLIENT_SECRET: data.secrets.client_secret,
            TAP_SALESFORCE_REFRESH_TOKEN: data.secrets.refresh_token,
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
      meltano.on("close", async (code) => {
        if (code === 0) {
          resolve(
            NextResponse.json(
              { success: true, message: "Sync completed!", output },
              { status: 200 }
            )
          );
        } else {
          resolve(
            NextResponse.json(
              { success: false, error: "Sync failed", output: errorOutput },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to update config or run sync" },
      { status: 500 }
    );
  }
}
