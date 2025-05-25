import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../utils/supabaseClient";
import { spawn } from "child_process";

export async function GET(
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

  // 2. Run tap-salesforce discovery with secrets as environment variables
  return new Promise((resolve) => {
    const meltano = spawn(
      "meltano",
      ["invoke", "tap-salesforce", "--discover"],
      {
        env: {
          ...process.env,
          // Set tap-salesforce secrets as environment variables
          TAP_SALESFORCE_CLIENT_ID: data.secrets.client_id,
          TAP_SALESFORCE_CLIENT_SECRET: data.secrets.client_secret,
          TAP_SALESFORCE_REFRESH_TOKEN: data.secrets.refresh_token,
          // Also set non-sensitive config as env vars for discovery
          TAP_SALESFORCE_INSTANCE_URL: data.config.instance_url,
          TAP_SALESFORCE_START_DATE: data.config.start_date,
          TAP_SALESFORCE_API_TYPE: data.config.api_type,
          TAP_SALESFORCE_SELECT_FIELDS_BY_DEFAULT:
            data.config.select_fields_by_default.toString(),
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
        try {
          const catalog = JSON.parse(output);
          resolve(
            NextResponse.json({ success: true, catalog }, { status: 200 })
          );
        } catch (parseError) {
          resolve(
            NextResponse.json(
              { success: false, error: "Failed to parse catalog JSON", output },
              { status: 500 }
            )
          );
        }
      } else {
        resolve(
          NextResponse.json(
            { success: false, error: "Discovery failed", output: errorOutput },
            { status: 500 }
          )
        );
      }
    });
  });
}
