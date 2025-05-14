import { promises as fs } from "fs";
import path from "path";
import * as Papa from "papaparse";
import * as xlsx from "xlsx";
import { LOG_LEVEL, log } from "./logging";

// Get the absolute path to the data directory
export const BASE_DATA_DIR = path.resolve(process.cwd(), "data");
export const DATA_DIRS = {
  customer: path.join(BASE_DATA_DIR, "customer"),
  sales: path.join(BASE_DATA_DIR, "sales"),
  support: path.join(BASE_DATA_DIR, "support"),
};

// Helper function to parse date from various formats
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;

  // Clean up the string
  const cleanString = dateString.toString().trim();

  try {
    // Try as-is (ISO format or similar)
    let date = new Date(cleanString);
    if (!isNaN(date.getTime())) return date;

    // Try DD/MM/YYYY format
    if (cleanString.includes("/")) {
      const parts = cleanString.split("/");
      if (parts.length === 3) {
        // Try DD/MM/YYYY
        date = new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
        if (!isNaN(date.getTime())) return date;

        // Try MM/DD/YYYY
        date = new Date(
          parseInt(parts[2]),
          parseInt(parts[0]) - 1,
          parseInt(parts[1])
        );
        if (!isNaN(date.getTime())) return date;
      }
    }

    // Try DD-MM-YYYY format
    if (cleanString.includes("-")) {
      const parts = cleanString.split("-");
      if (parts.length === 3) {
        // Try YYYY-MM-DD (ISO format again)
        date = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        );
        if (!isNaN(date.getTime())) return date;

        // Try DD-MM-YYYY
        date = new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
        if (!isNaN(date.getTime())) return date;
      }
    }

    // Try to extract date from custom format strings
    // Look for patterns like "Jan 2023" or "January 2023"
    const monthYearRegex = /([A-Za-z]+)\s+(\d{4})/;
    const match = cleanString.match(monthYearRegex);
    if (match) {
      const monthStr = match[1];
      const year = parseInt(match[2]);

      const months = [
        ["jan", "january"],
        ["feb", "february"],
        ["mar", "march"],
        ["apr", "april"],
        ["may", "may"],
        ["jun", "june"],
        ["jul", "july"],
        ["aug", "august"],
        ["sep", "september"],
        ["oct", "october"],
        ["nov", "november"],
        ["dec", "december"],
      ];

      const monthLower = monthStr.toLowerCase();
      const monthIndex = months.findIndex((m) => m.includes(monthLower));

      if (monthIndex !== -1) {
        date = new Date(year, monthIndex, 1);
        if (!isNaN(date.getTime())) return date;
      }
    }

    // Handle Excel numeric date format (days since 1/1/1900)
    // This is for when Excel dates are parsed incorrectly to numbers
    if (typeof cleanString === "number" || !isNaN(Number(cleanString))) {
      const numValue = Number(cleanString);
      if (numValue > 1000) {
        // Likely an Excel date (not a small number)
        const excelEpoch = new Date(1900, 0, 1);
        // Excel dates are days since 1/1/1900 (with an adjustment for leap year bug)
        const daysSinceEpoch = numValue - (numValue > 60 ? 2 : 1);
        date = new Date(
          excelEpoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000
        );
        if (
          !isNaN(date.getTime()) &&
          date.getFullYear() > 1950 &&
          date.getFullYear() < 2100
        ) {
          return date; // Only return if the date is reasonably within our expected range
        }
      }
    }

    // If all else fails, log and return null
    log(LOG_LEVEL.WARN, `Could not parse date from string: ${cleanString}`);
    return null;
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    log(LOG_LEVEL.ERROR, `Error parsing date: ${cleanString}`, errorMessage);
    return null;
  }
}

export function formatDateISO(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Format date for display (e.g., "Jan 2025")
export function formatDateForDisplay(date: Date | null): string {
  if (!date) return "";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Interface for CSV options
export interface CSVReadOptions {
  header?: boolean;
  dynamicTyping?: boolean;
  skipEmptyLines?: boolean;
  delimiter?: string;
  comments?: string | boolean;
  encoding?: string;
  // Add other Papa Parse options as needed
}

// Interface for Excel reading options
export interface ExcelReadOptions {
  sheetName?: string | number;
  cellDates?: boolean;
  cellFormula?: boolean; // Correct property name for SheetJS
  cellStyles?: boolean;
  dateNF?: string;
  raw?: boolean;
  headerRows?: number;
  range?: string;
  defval?: any;
  blankrows?: boolean;
  sheetStubs?: boolean;
}

// Interface for file reading options
export interface FileReadOptions {
  excel?: ExcelReadOptions; // Excel-specific options
  csv?: CSVReadOptions; // CSV-specific options
}

// Read file based on extension with enhanced options
export async function readFile(
  filePath: string,
  options: FileReadOptions = {}
): Promise<{ data: any[] }> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".csv") {
    return readCSVFile(filePath, options.csv);
  } else if (ext === ".xlsx" || ext === ".xls") {
    return { data: await readExcelFile(filePath, options.excel || {}) };
  } else {
    log(LOG_LEVEL.WARN, `Unknown file extension: ${ext} for file ${filePath}`);
    return { data: [] };
  }
}

// Read CSV file with configurable options
export async function readCSVFile(
  filePath: string,
  options?: CSVReadOptions
): Promise<{ data: any[]; meta?: Papa.ParseMeta }> {
  try {
    log(LOG_LEVEL.DEBUG, `Reading CSV file: ${path.basename(filePath)}`);
    const content = await fs.readFile(filePath, "utf8");

    // Default options with overrides from passed options
    const parseOptions: Papa.ParseConfig = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      ...(options
        ? {
            ...options,
            // Ensure comments is properly typed
            comments:
              typeof options.comments === "string"
                ? options.comments
                : options.comments === true
                ? false
                : options.comments,
          }
        : {}),
    };

    const result = Papa.parse<any>(content, parseOptions);

    if (result.data.length > 0) {
      log(
        LOG_LEVEL.DEBUG,
        `CSV columns: ${result.meta?.fields?.join(", ") || "No columns found"}`
      );
      log(LOG_LEVEL.DEBUG, `Total rows: ${result.data.length}`);
    } else {
      log(LOG_LEVEL.WARN, `CSV file is empty or invalid`);
    }

    return result;
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    log(LOG_LEVEL.ERROR, `Failed to read CSV: ${errorMessage}`);
    return { data: [] };
  }
}

// Read Excel file with enhanced options and error handling
export async function readExcelFile(
  filePath: string,
  options: ExcelReadOptions = {}
): Promise<any[]> {
  try {
    log(LOG_LEVEL.DEBUG, `Reading Excel file: ${path.basename(filePath)}`);
    const buffer = await fs.readFile(filePath);

    let workbook;
    try {
      // Apply default options for XLSX parsing and merge with user options
      const xlsxOptions: xlsx.ParsingOptions = {
        type: "buffer" as const,
        cellDates: options.cellDates ?? true, // Convert dates by default
        cellFormula: options.cellFormula ?? false, // Don't evaluate formulas by default
        cellStyles: options.cellStyles ?? false, // Don't include styles by default
        dateNF: options.dateNF, // Optional date format string
        sheetStubs: options.sheetStubs ?? true, // Include empty cells
        raw: options.raw ?? false, // Convert raw values by default
      };

      workbook = xlsx.read(buffer, xlsxOptions);
    } catch (xlsxError: unknown) {
      let errorMessage = "Unknown Excel parsing error";
      if (xlsxError instanceof Error) {
        errorMessage = xlsxError.message;
      } else if (typeof xlsxError === "string") {
        errorMessage = xlsxError;
      }
      log(LOG_LEVEL.ERROR, `Excel parsing error: ${errorMessage}`);
      return [];
    }

    // Determine which sheet to use
    const sheetName = options.sheetName ?? 0; // Default to first sheet
    const sheetNameToUse =
      typeof sheetName === "string" && workbook.SheetNames.includes(sheetName)
        ? sheetName
        : workbook.SheetNames[Number(sheetName) || 0];

    if (!sheetNameToUse) {
      log(
        LOG_LEVEL.ERROR,
        `No valid sheet found in Excel file: ${path.basename(filePath)}`
      );
      return [];
    }

    log(
      LOG_LEVEL.DEBUG,
      `Using sheet '${sheetNameToUse}' from file ${path.basename(filePath)}`
    );
    const sheet = workbook.Sheets[sheetNameToUse];

    // Configure sheet_to_json options
    const sheetToJsonOptions: xlsx.Sheet2JSONOpts = {
      header: options.headerRows, // Can be a row number or undefined for first row
      range: options.range, // Optional range to read
      defval: options.defval, // Default value for empty cells
      blankrows: options.blankrows ?? false, // Don't include blank rows by default
    };

    // Convert sheet to JSON
    const data = xlsx.utils.sheet_to_json(sheet, sheetToJsonOptions);

    if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      log(
        LOG_LEVEL.DEBUG,
        `Excel sheet: ${sheetNameToUse}, columns: ${Object.keys(data[0]).join(
          ", "
        )}`
      );
      log(LOG_LEVEL.DEBUG, `Total rows: ${data.length}`);
    } else {
      log(LOG_LEVEL.WARN, `Excel sheet is empty or invalid`);
    }

    return data;
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    log(LOG_LEVEL.ERROR, `Failed to read Excel: ${errorMessage}`);
    return [];
  }
}

// Find a column by possible names
export function findColumn(
  row: Record<string, any> | null,
  possibleNames: string[]
): string | null {
  if (!row) return null;

  const keys = Object.keys(row);
  // First try exact match
  for (const name of possibleNames) {
    if (keys.includes(name)) return name;
  }

  // Then try case-insensitive match
  for (const name of possibleNames) {
    const match = keys.find((k) => k.toLowerCase() === name.toLowerCase());
    if (match) return match;
  }

  return null;
}

// Helper to sum a column in an array of objects
export function sumColumn(
  data: any[] | null | undefined,
  columnName: string
): number {
  if (!data || !data.length) return 0;

  return data.reduce((sum, item) => {
    // Skip items that don't have the column
    if (!item || typeof item !== "object" || !(columnName in item)) {
      return sum;
    }

    const value = item[columnName];

    // Handle different value types
    if (typeof value === "number") {
      return sum + value;
    } else if (typeof value === "string") {
      // Try to parse strings as numbers
      const parsedValue = parseFloat(value.replace(/[^\d.-]/g, ""));
      return sum + (isNaN(parsedValue) ? 0 : parsedValue);
    } else if (value === true) {
      // Count boolean true as 1
      return sum + 1;
    }

    return sum;
  }, 0);
}
