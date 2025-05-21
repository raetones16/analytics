import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // In the future, fetch the integration config and call Meltano CLI to run the sync
  // For now, return a stub response
  return NextResponse.json(
    { success: true, message: "Sync triggered (stub)." },
    { status: 200 }
  );
}
