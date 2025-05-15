import { promises as fs } from "fs";
import path from "path";
import { LOG_LEVEL, log } from "./logging";
import { DATA_DIRS, findColumn, readCSVFile, parseDate } from "./file-utils";

// Utility to extract date from filename (e.g., '2025-05 Customer Snapshot.csv' -> '2025-05-01')
function extractDateFromFilename(filename: string): string | null {
  const match = filename.match(/(\d{4})-(\d{2}) Customer Snapshot/);
  if (match) {
    return `${match[1]}-${match[2]}-01`;
  }
  return null;
}

// Function to count modules for a client row in the snapshot file
function getTotalModulesForSnapshot(item: any): number {
  const parseCount = (raw: any) => {
    if (typeof raw === "number") return raw;
    if (typeof raw === "string") {
      const cleaned = raw.replace(/[^0-9.]/g, "");
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };
  let count = 0;
  // edays Absence (User + Leaver)
  const userCol = findColumn(item, ["User Licenses"]);
  const leaverCol = findColumn(item, ["Leavers Licenses"]);
  const userVal =
    (userCol ? parseCount(item[userCol]) : 0) +
    (leaverCol ? parseCount(item[leaverCol]) : 0);
  if (userVal > 0) count++;
  // edays People Insights
  const piCol = findColumn(item, ["People Insights Licenses"]);
  if (piCol && parseCount(item[piCol]) > 0) count++;
  // Core HR (Directory)
  const dirCol = findColumn(item, ["Directory Licenses"]);
  if (dirCol && parseCount(item[dirCol]) > 0) count++;
  // Time Submission
  const subCol = findColumn(item, ["Time Submission Licenses"]);
  if (subCol && parseCount(item[subCol]) > 0) count++;
  // Time Tracking
  const trackCol = findColumn(item, ["Time Tracking Licenses"]);
  if (trackCol && parseCount(item[trackCol]) > 0) count++;
  // third party EAP
  const eapCol = findColumn(item, ["EAP Licenses"]);
  if (eapCol && parseCount(item[eapCol]) > 0) count++;
  // Workflow Builder
  const wfCol = findColumn(item, ["Workflow Builder Pro Licenses"]);
  if (wfCol && parseCount(item[wfCol]) > 0) count++;
  // Grosvenor
  const grosCol = findColumn(item, ["Grosvenor Licenses"]);
  if (grosCol && parseCount(item[grosCol]) > 0) count++;
  // ELMO Core HR
  const elmoCoreCol = findColumn(item, ["ELMO Core HR License"]);
  if (elmoCoreCol && parseCount(item[elmoCoreCol]) > 0) count++;
  // ELMO Onboarding
  const elmoOnboardCol = findColumn(item, ["ELMO Onboarding License"]);
  if (elmoOnboardCol && parseCount(item[elmoOnboardCol]) > 0) count++;
  return count;
}

// Main function to process all customer snapshot files
export async function processCustomerSnapshots(): Promise<
  {
    date: string;
    averageModulesPerClient: number;
    totalClients: number;
  }[]
> {
  try {
    log(LOG_LEVEL.INFO, "Processing customer snapshot files...");
    const files = await fs.readdir(DATA_DIRS.sales);
    const snapshotFiles = files.filter((f) =>
      f.match(/\d{4}-\d{2} Customer Snapshot\.csv$/)
    );
    if (snapshotFiles.length === 0) {
      log(LOG_LEVEL.WARN, "No customer snapshot files found");
      return [];
    }
    const results: {
      date: string;
      averageModulesPerClient: number;
      totalClients: number;
    }[] = [];
    for (const file of snapshotFiles) {
      const date = extractDateFromFilename(file);
      if (!date) {
        log(LOG_LEVEL.WARN, `Could not extract date from filename: ${file}`);
        continue;
      }
      const { data } = await readCSVFile(path.join(DATA_DIRS.sales, file));
      if (!data || data.length === 0) {
        log(LOG_LEVEL.WARN, `No data in snapshot file: ${file}`);
        continue;
      }
      let totalModules = 0;
      let clientCount = 0;
      for (const row of data) {
        if (!row || typeof row !== "object") continue;
        const modules = getTotalModulesForSnapshot(row);
        totalModules += modules;
        clientCount++;
      }
      const averageModulesPerClient =
        clientCount > 0
          ? Math.round((totalModules / clientCount) * 100) / 100
          : 0;
      results.push({
        date,
        averageModulesPerClient,
        totalClients: clientCount,
      });
    }
    // Sort by date ascending
    results.sort((a, b) => a.date.localeCompare(b.date));
    log(
      LOG_LEVEL.INFO,
      `Processed ${results.length} customer snapshot data points`
    );
    return results;
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    log(
      LOG_LEVEL.ERROR,
      `Customer snapshot data processing failed: ${errorMessage}`
    );
    return [];
  }
}

// Exported summary function for snapshot stats for a period
export async function getSnapshotSummaryForPeriod(
  startDate: Date,
  endDate: Date
): Promise<{
  averageModulesPerClient: number;
  totalClients: number;
  file?: string;
}> {
  const files = await fs.readdir(DATA_DIRS.sales);
  const snapshotFiles = files.filter((f) =>
    f.match(/\d{4}-\d{2} Customer Snapshot\.csv$/)
  );
  // Find the latest snapshot file within the period
  let latestSnapshot: { file: string; date: Date | null } | null = null;
  for (const file of snapshotFiles) {
    const dateStr = extractDateFromFilename(file);
    const date = dateStr ? parseDate(dateStr) : null;
    if (date && date >= startDate && date <= endDate) {
      if (
        !latestSnapshot ||
        (latestSnapshot.date && date > latestSnapshot.date)
      ) {
        latestSnapshot = { file, date };
      }
    }
  }
  if (!latestSnapshot) {
    return { averageModulesPerClient: 0, totalClients: 0, file: undefined };
  }
  const { data } = await readCSVFile(
    path.join(DATA_DIRS.sales, latestSnapshot.file)
  );
  if (!data || data.length === 0) {
    return {
      averageModulesPerClient: 0,
      totalClients: 0,
      file: latestSnapshot.file,
    };
  }
  let totalModules = 0;
  let clientCount = 0;
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const modules = getTotalModulesForSnapshot(row);
    totalModules += modules;
    clientCount++;
  }
  const averageModulesPerClient =
    clientCount > 0 ? Math.round((totalModules / clientCount) * 100) / 100 : 0;
  return {
    averageModulesPerClient,
    totalClients: clientCount,
    file: latestSnapshot.file,
  };
}
