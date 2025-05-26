import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../utils/supabaseClient";
import { spawn } from "child_process";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import yaml from "js-yaml";

const MELTANO_YML_PATH = path.join(process.cwd(), "meltano.yml");

// Update Meltano field selections
async function updateMeltanoSelections(
  integrationId: string,
  selectedFields: Record<string, string[]>
) {
  try {
    const ymlRaw = await readFile(MELTANO_YML_PATH, "utf8");
    let meltanoYml: any;
    try {
      meltanoYml = yaml.load(ymlRaw) as any;
    } catch (yamlError) {
      throw new Error("Failed to parse meltano.yml");
    }

    // Find tap-salesforce plugin
    const tapSalesforce = meltanoYml.plugins.extractors.find(
      (extractor: any) => extractor.name === "tap-salesforce"
    );

    if (tapSalesforce) {
      // Clear existing selections
      tapSalesforce.select = [];

      // Add new selections
      for (const [objectName, fields] of Object.entries(selectedFields)) {
        if (Array.isArray(fields) && fields.length > 0) {
          // Add each field individually
          for (const field of fields) {
            tapSalesforce.select.push(`${objectName}.${field}`);
          }
        }
      }

      // If no fields selected, select all for the objects that have any fields
      if (tapSalesforce.select.length === 0) {
        for (const objectName of Object.keys(selectedFields)) {
          tapSalesforce.select.push(`${objectName}.*`);
        }
      }
    }

    await writeFile(MELTANO_YML_PATH, yaml.dump(meltanoYml));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await req.json();
    const { selected_fields } = body;

    if (!selected_fields || typeof selected_fields !== "object") {
      return NextResponse.json(
        { error: "selected_fields must be an object" },
        { status: 400 }
      );
    }

    // Update the integration in Supabase
    const { data, error } = await supabase
      .from("integrations")
      .update({ selected_fields })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update Meltano selections
    const meltanoResult = await updateMeltanoSelections(id, selected_fields);
    if (!meltanoResult.success) {
      console.warn("Failed to update Meltano selections:", meltanoResult.error);
    }

    return NextResponse.json({
      integration: data,
      message: "Field selections updated successfully",
      meltano_updated: meltanoResult.success,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { data, error } = await supabase
      .from("integrations")
      .select("selected_fields")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({
      selected_fields: data.selected_fields || {},
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
