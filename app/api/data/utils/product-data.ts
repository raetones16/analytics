import { promises as fs } from "fs";
import path from "path";
import { LOG_LEVEL, log } from "./logging";
import {
  DATA_DIRS,
  formatDateISO,
  formatDateForDisplay,
  readFile,
  sumColumn,
  parseDate,
} from "./file-utils";

// Define interfaces for the data
interface ProductDataPoint {
  date: string;
  displayDate?: string;
  webLogins: number;
  mobileLogins: number;
  webAbsencesBooked: number;
  mobileAbsencesBooked: number;
  webTimesheetsSubmitted: number;
  mobileTimesheetsSubmitted: number;
  workflowsCreated: number;
  _synthetic?: {
    distribution?: boolean;
    data?: boolean;
  };
}

// Column name mappings - this allows us to handle variations in column naming
const COLUMN_MAPPINGS = {
  date: ["Date", "date", "Event Date", "event_date", "Transaction Date"],
  webLogins: [
    "Login Success (Total Events)",
    "Web Login",
    "Web Logins",
    "Login Success",
  ],
  mobileLogins: [
    "Mobile App Login Success (Total Events)",
    "Mobile Login",
    "Mobile Logins",
    "Mobile App Login Success",
  ],
  webAbsences: [
    "Created Absence (Total Events)",
    "Absence Created",
    "Web Absence",
    "Web Absences Booked",
    "Created Absence",
  ],
  mobileAbsences: [
    "Mobile App Absence Booked (Total Events)",
    "Mobile Absence",
    "Mobile Absences Booked",
  ],
  webTimesheets: [
    "Timesheet Submitted (Total Events)",
    "Web Timesheet",
    "Web Timesheets",
    "Timesheet Submitted",
  ],
  mobileTimesheets: [
    "Mobile App Timesheet Submitted (Total Events)",
    "Mobile Timesheet",
    "Mobile Timesheets",
  ],
  workflows: [
    "User impersonated (Total Events)",
    "Workflow Created",
    "Workflows Created",
    "User impersonated",
  ],
};

// Helper function to find column name in data
function findColumnName(data: any[], possibleNames: string[]): string | null {
  if (!data || data.length === 0) return null;
  const columns = Object.keys(data[0]);

  // Try exact match first
  for (const name of possibleNames) {
    if (columns.includes(name)) return name;
  }

  // Try case-insensitive match
  for (const name of possibleNames) {
    const lowercaseName = name.toLowerCase();
    const match = columns.find((col) => col.toLowerCase() === lowercaseName);
    if (match) return match;
  }

  return null;
}

// Helper to extract year and month from filename
function extractYearMonth(
  filename: string
): { year: number; month: number } | null {
  const match = filename.match(/(\d{2})-(\d{2})/);
  if (!match) return null;
  const [_, yy, mm] = match;
  const year = 2000 + parseInt(yy, 10);
  const month = parseInt(mm, 10) - 1; // JS months are 0-based
  return { year, month };
}

// Read and parse all files for a product type
async function readProductFiles(
  files: string[],
  type: "web" | "mobile" | "timesheet",
  customerDir: string,
  columnMappings: typeof COLUMN_MAPPINGS,
  parseDateFn: typeof parseDate,
  readFileFn: typeof readFile
) {
  let allRows: any[] = [];
  for (const file of files) {
    const extracted: { year?: number; month?: number } =
      extractYearMonth(file) || {};
    const { year, month } = extracted;
    const filePath = path.join(customerDir, file);
    const result = await readFileFn(filePath, {
      excel: { cellDates: true, sheetStubs: true, blankrows: false },
    });
    let assignedDate: Date | null = null;
    if (typeof year === "number" && typeof month === "number") {
      assignedDate = new Date(year, month, 1);
    }
    // Log the filename and assigned date for debugging
    log(
      LOG_LEVEL.INFO,
      `[ProductData] File: ${file} => Date: ${
        assignedDate ? assignedDate.toISOString().split("T")[0] : "INVALID"
      }`
    );
    for (const row of result.data) {
      // Always use the date from the filename for monthly files
      allRows.push({ ...row, _file: file, _type: type, _date: assignedDate });
    }
  }
  return allRows;
}

function addToMap(
  row: any,
  type: "web" | "mobile" | "timesheet",
  dataByDate: Map<string, ProductDataPoint>,
  columnMappings: typeof COLUMN_MAPPINGS,
  findColumnNameFn: typeof findColumnName,
  formatDateISOFn: typeof formatDateISO,
  formatDateForDisplayFn: typeof formatDateForDisplay
) {
  const dateObj: Date | null = row._date;
  if (!dateObj) return;
  const dateStr = formatDateISOFn(dateObj);
  if (!dataByDate.has(dateStr)) {
    dataByDate.set(dateStr, {
      date: dateStr,
      displayDate: formatDateForDisplayFn(dateObj),
      webLogins: 0,
      mobileLogins: 0,
      webAbsencesBooked: 0,
      mobileAbsencesBooked: 0,
      webTimesheetsSubmitted: 0,
      mobileTimesheetsSubmitted: 0,
      workflowsCreated: 0,
    });
  }
  const entry = dataByDate.get(dateStr)!;
  // Map columns
  if (type === "web") {
    const webLoginsCol = findColumnNameFn([row], columnMappings.webLogins);
    const webAbsencesCol = findColumnNameFn([row], columnMappings.webAbsences);
    const webTimesheetsCol = findColumnNameFn(
      [row],
      columnMappings.webTimesheets
    );
    const workflowsCol = findColumnNameFn([row], columnMappings.workflows);
    if (webLoginsCol) entry.webLogins += Number(row[webLoginsCol]) || 0;
    if (webAbsencesCol)
      entry.webAbsencesBooked += Number(row[webAbsencesCol]) || 0;
    if (webTimesheetsCol)
      entry.webTimesheetsSubmitted += Number(row[webTimesheetsCol]) || 0;
    if (workflowsCol) entry.workflowsCreated += Number(row[workflowsCol]) || 0;
  } else if (type === "mobile") {
    const mobileLoginsCol = findColumnNameFn(
      [row],
      columnMappings.mobileLogins
    );
    const mobileAbsencesCol = findColumnNameFn(
      [row],
      columnMappings.mobileAbsences
    );
    const mobileTimesheetsCol = findColumnNameFn(
      [row],
      columnMappings.mobileTimesheets
    );
    if (mobileLoginsCol)
      entry.mobileLogins += Number(row[mobileLoginsCol]) || 0;
    if (mobileAbsencesCol)
      entry.mobileAbsencesBooked += Number(row[mobileAbsencesCol]) || 0;
    if (mobileTimesheetsCol)
      entry.mobileTimesheetsSubmitted += Number(row[mobileTimesheetsCol]) || 0;
  } else if (type === "timesheet") {
    // Timesheet files may have both web and mobile timesheets
    const webTimesheetsCol = findColumnNameFn(
      [row],
      columnMappings.webTimesheets
    );
    const mobileTimesheetsCol = findColumnNameFn(
      [row],
      columnMappings.mobileTimesheets
    );
    if (webTimesheetsCol)
      entry.webTimesheetsSubmitted += Number(row[webTimesheetsCol]) || 0;
    if (mobileTimesheetsCol)
      entry.mobileTimesheetsSubmitted += Number(row[mobileTimesheetsCol]) || 0;
  }
}

// Helper to get files for a type, preferring xlsx over csv for the same month
function getMonthlyFiles(files: string[], prefix: string) {
  // Filter candidates by prefix and extension
  const candidates = files.filter((f) => {
    const lower = f.toLowerCase();
    const p = prefix.toLowerCase() + " - ";
    return (
      lower.startsWith(p) && (lower.endsWith(".xlsx") || lower.endsWith(".csv"))
    );
  });
  // Build a map of YY-MM to file, preferring .xlsx
  const fileMap = new Map<string, string>();
  for (const f of candidates) {
    const match = f.match(/(\d{2}-\d{2})/);
    if (!match) continue;
    const key = match[1];
    const isXlsx = f.toLowerCase().endsWith(".xlsx");
    if (!fileMap.has(key) || isXlsx) {
      fileMap.set(key, f);
    }
  }
  return Array.from(fileMap.values());
}

export async function processProductData(): Promise<ProductDataPoint[]> {
  try {
    log(LOG_LEVEL.INFO, "Processing product data...");
    const files = await fs.readdir(DATA_DIRS.customer);
    log(LOG_LEVEL.INFO, `Customer directory files: ${files.join(", ")}`);

    const webAppFiles = getMonthlyFiles(files, "Web App Stats");
    log(LOG_LEVEL.INFO, `Found Web App files: ${webAppFiles.join(", ")}`);
    const mobileAppFiles = getMonthlyFiles(files, "Mobile App Stats");
    log(LOG_LEVEL.INFO, `Found Mobile App files: ${mobileAppFiles.join(", ")}`);
    const timesheetFiles = getMonthlyFiles(files, "Timesheet Stats");
    log(LOG_LEVEL.INFO, `Found Timesheet files: ${timesheetFiles.join(", ")}`);

    if (
      webAppFiles.length === 0 &&
      mobileAppFiles.length === 0 &&
      timesheetFiles.length === 0
    ) {
      log(LOG_LEVEL.ERROR, "No monthly product data files found");
      return [];
    }

    // Read all data
    const webRows = await readProductFiles(
      webAppFiles,
      "web",
      DATA_DIRS.customer,
      COLUMN_MAPPINGS,
      parseDate,
      readFile
    );
    const mobileRows = await readProductFiles(
      mobileAppFiles,
      "mobile",
      DATA_DIRS.customer,
      COLUMN_MAPPINGS,
      parseDate,
      readFile
    );
    const timesheetRows = await readProductFiles(
      timesheetFiles,
      "timesheet",
      DATA_DIRS.customer,
      COLUMN_MAPPINGS,
      parseDate,
      readFile
    );

    // Combine all rows by date
    const dataByDate = new Map<string, ProductDataPoint>();

    webRows.forEach((row) =>
      addToMap(
        row,
        "web",
        dataByDate,
        COLUMN_MAPPINGS,
        findColumnName,
        formatDateISO,
        formatDateForDisplay
      )
    );
    mobileRows.forEach((row) =>
      addToMap(
        row,
        "mobile",
        dataByDate,
        COLUMN_MAPPINGS,
        findColumnName,
        formatDateISO,
        formatDateForDisplay
      )
    );
    timesheetRows.forEach((row) =>
      addToMap(
        row,
        "timesheet",
        dataByDate,
        COLUMN_MAPPINGS,
        findColumnName,
        formatDateISO,
        formatDateForDisplay
      )
    );

    // Convert map to sorted array
    const result: ProductDataPoint[] = Array.from(dataByDate.values())
      .map((entry) => ({ ...entry }))
      .sort((a, b) =>
        (a.date || "").localeCompare(b.date || "")
      ) as ProductDataPoint[];

    log(
      LOG_LEVEL.INFO,
      `Processed ${result.length} product data points from monthly XLSX files`
    );
    return result;
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    log(LOG_LEVEL.ERROR, `Product data processing failed: ${errorMessage}`);
    return [];
  }
}
