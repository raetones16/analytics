import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { BASE_DATA_DIR, LOG_LEVEL, log, processSalesData } from "./utils";
import { processCustomerSnapshots } from "./utils/customer-snapshots-data";

// We need to export a config to tell Next.js this route is dynamic
export const dynamic = "force-dynamic";

// API route handler
export async function GET(request: Request) {
  try {
    log(LOG_LEVEL.INFO, "--- API route called ---");

    // Check if data directory exists
    try {
      await fs.access(BASE_DATA_DIR);
    } catch (error: unknown) {
      log(LOG_LEVEL.ERROR, `Data directory not found: ${BASE_DATA_DIR}`);
      return NextResponse.json(
        { error: "Data directory not found" },
        { status: 404 }
      );
    }

    // Parse request URL safely for Next.js
    const url = new URL(
      request.url,
      `http://${request.headers.get("host") || "localhost"}`
    );
    const type = url.searchParams.get("type") || "all";
    log(LOG_LEVEL.INFO, `Request type: ${type}`);

    switch (type) {
      case "sales":
        const salesData = await processSalesData();
        log(LOG_LEVEL.INFO, `Returning ${salesData.length} sales data points`);
        return NextResponse.json(salesData);

      case "customer-snapshots":
        const snapshotData = await processCustomerSnapshots();
        log(
          LOG_LEVEL.INFO,
          `Returning ${snapshotData.length} customer snapshot data points`
        );
        return NextResponse.json(snapshotData);

      case "all":
        log(LOG_LEVEL.INFO, "Processing all data types...");
        const allSalesData = await processSalesData();
        log(LOG_LEVEL.INFO, `Results - Sales: ${allSalesData.length} points`);
        return NextResponse.json({
          salesData: allSalesData,
        });

      default:
        log(LOG_LEVEL.WARN, `Invalid data type requested: ${type}`);
        return NextResponse.json(
          { error: "Invalid data type" },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    log(LOG_LEVEL.ERROR, `API Error: ${errorMessage}`);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
