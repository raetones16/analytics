import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../utils/supabaseClient";
import { writeFile, unlink } from "fs/promises";
import { spawn } from "child_process";
import path from "path";

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
  // 2. Write config to a temp file
  const configPath = path.join("/tmp", `sf-config-${id}.json`);
  const configObj = {
    ...data.config,
    ...data.secrets,
  };
  try {
    await writeFile(configPath, JSON.stringify(configObj, null, 2));
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to write config file: " + err.message },
      { status: 500 }
    );
  }
  // 3. Run Meltano tap-salesforce in discovery mode
  return new Promise((resolve) => {
    const meltano = spawn("meltano", [
      "invoke",
      "tap-salesforce",
      "--discover",
      "--config",
      configPath,
    ]);
    let output = "";
    let errorOutput = "";
    meltano.stdout.on("data", (data) => {
      output += data.toString();
    });
    meltano.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
    meltano.on("close", async (code) => {
      await unlink(configPath).catch(() => {});
      if (code === 0) {
        // Try to parse the last JSON object in output as the catalog
        let catalog = null;
        try {
          // Find the last JSON object in output
          const matches = output.match(/\{[\s\S]*\}/g);
          if (matches && matches.length > 0) {
            catalog = JSON.parse(matches[matches.length - 1]);
          }
        } catch (e) {}
        resolve(
          NextResponse.json(
            { success: true, catalog, raw: output },
            { status: 200 }
          )
        );
      } else {
        resolve(
          NextResponse.json(
            {
              success: false,
              error: errorOutput || output || "Discovery failed",
            },
            { status: 500 }
          )
        );
      }
    });
    meltano.on("error", async (err) => {
      await unlink(configPath).catch(() => {});
      resolve(
        NextResponse.json(
          { success: false, error: "Failed to run Meltano: " + err.message },
          { status: 500 }
        )
      );
    });
  });
}
