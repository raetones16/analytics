import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../utils/supabaseClient";

// Helper function to calculate next sync time
function calculateNextSync(frequency: string): Date {
  const now = new Date();

  switch (frequency) {
    case "hourly":
      return new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +1 week
    case "monthly":
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to daily
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await req.json();
    const { sync_frequency, sync_enabled } = body;

    // Validate sync_frequency
    const validFrequencies = ["manual", "hourly", "daily", "weekly", "monthly"];
    if (sync_frequency && !validFrequencies.includes(sync_frequency)) {
      return NextResponse.json(
        {
          error:
            "Invalid sync frequency. Must be one of: " +
            validFrequencies.join(", "),
        },
        { status: 400 }
      );
    }

    // Calculate next sync time if enabling automatic sync
    let next_sync_at = null;
    if (sync_enabled && sync_frequency && sync_frequency !== "manual") {
      next_sync_at = calculateNextSync(sync_frequency).toISOString();
    }

    // Update the integration
    const updateData: any = {};
    if (sync_frequency !== undefined)
      updateData.sync_frequency = sync_frequency;
    if (sync_enabled !== undefined) updateData.sync_enabled = sync_enabled;
    if (next_sync_at) updateData.next_sync_at = next_sync_at;

    const { data, error } = await supabase
      .from("integrations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      integration: data,
      message: sync_enabled
        ? `Automatic sync enabled (${sync_frequency}). Next sync: ${next_sync_at}`
        : "Automatic sync disabled",
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
      .select("sync_frequency, sync_enabled, last_sync_at, next_sync_at")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ schedule: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
