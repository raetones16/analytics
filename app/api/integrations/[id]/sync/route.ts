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
  // 2. Update meltano.yml with this integration's config
  let meltanoYml;
  try {
    const ymlRaw = await readFile(MELTANO_YML_PATH, "utf8");
    meltanoYml = yaml.load(ymlRaw) as any;
    // Find tap-salesforce extractor
    const tap = meltanoYml.plugins.extractors.find(
      (e: any) => e.name === "tap-salesforce"
    );
    if (!tap) throw new Error("tap-salesforce not found in meltano.yml");
    tap.config = {
      ...data.config,
      ...data.secrets,
    };
    await writeFile(MELTANO_YML_PATH, yaml.dump(meltanoYml));
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update meltano.yml: " + err.message },
      { status: 500 }
    );
  }
  // 3. Run Meltano ELT (extract, load) using config from meltano.yml
  return new Promise((resolve) => {
    const meltano = spawn("meltano", [
      "run",
      "--force",
      "tap-salesforce",
      "target-jsonl",
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
            { success: false, error: errorOutput || output || "Sync failed" },
            { status: 500 }
          )
        );
      }
    });
    meltano.on("error", async (err) => {
      resolve(
        NextResponse.json(
          { success: false, error: "Failed to run Meltano: " + err.message },
          { status: 500 }
        )
      );
    });
  });
}
