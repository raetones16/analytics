import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // In the future, fetch the integration config and call Meltano CLI to test
  // For now, return a stub success response
  return NextResponse.json(
    { success: true, message: "Test connection stub: always succeeds." },
    { status: 200 }
  );
}
