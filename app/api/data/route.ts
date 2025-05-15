import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { BASE_DATA_DIR, LOG_LEVEL, log, processSalesData } from "./utils";
import {
  processCustomerSnapshots,
  getSnapshotSummaryForPeriod,
} from "./utils/customer-snapshots-data";
import { getSalesSummaryForPeriod } from "./utils/sales-data";

// We need to export a config to tell Next.js this route is dynamic
export const dynamic = "force-dynamic";

// Helper to parse date from query or default to current month
function parsePeriod(url: URL): { start: Date; end: Date } {
  const startStr = url.searchParams.get("start");
  const endStr = url.searchParams.get("end");
  if (startStr && endStr) {
    return { start: new Date(startStr), end: new Date(endStr) };
  }
  // Default: current month
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

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

      case "summary": {
        const { start, end } = parsePeriod(url);
        const salesSummary = await getSalesSummaryForPeriod(start, end);
        const snapshotSummary = await getSnapshotSummaryForPeriod(start, end);
        // Collect file names for tooltips
        const files: Record<string, string | string[]> = {
          totalSalesValue: salesSummary.file || null,
          averageOrderValue: salesSummary.file || null,
          newClients: salesSummary.file || null,
          averageModulesPerClient: snapshotSummary.file || null,
          totalClients: snapshotSummary.file || null,
        };
        return NextResponse.json({
          totalSalesValue: salesSummary.totalSalesValue,
          averageOrderValue: salesSummary.averageOrderValue,
          averageModulesPerClient: snapshotSummary.averageModulesPerClient,
          newClients: salesSummary.newClients,
          totalClients: snapshotSummary.totalClients,
          files,
        });
      }

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
