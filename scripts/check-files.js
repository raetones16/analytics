const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { createRequire } = require("module");
const requireTS = createRequire(import.meta ? import.meta.url : __filename);
const { log, LOG_LEVEL } = requireTS("../app/api/data/utils/logging.node.ts");

// Base directories
const BASE_DIR = path.join(__dirname, "..", "data");
const CUSTOMER_DIR = path.join(BASE_DIR, "customer");
const SALES_DIR = path.join(BASE_DIR, "sales");
const SUPPORT_DIR = path.join(BASE_DIR, "support");

// Function to log directory contents
function logDirectoryContents(dir) {
  log(LOG_LEVEL.INFO, `\nChecking directory: ${dir}`);

  if (!fs.existsSync(dir)) {
    log(LOG_LEVEL.ERROR, `Directory does not exist: ${dir}`);
    return;
  }

  const items = fs.readdirSync(dir);
  log(LOG_LEVEL.INFO, `Found ${items.length} items:`);

  items.forEach((item) => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      log(LOG_LEVEL.INFO, `- [DIR] ${item}`);
    } else {
      log(
        LOG_LEVEL.INFO,
        `- [FILE] ${item} (${Math.round(stats.size / 1024)} KB)`
      );
    }
  });

  return items;
}

// Function to check Excel file
function checkExcelFile(filePath) {
  try {
    log(LOG_LEVEL.INFO, `\nChecking Excel file: ${path.basename(filePath)}`);

    if (!fs.existsSync(filePath)) {
      log(LOG_LEVEL.ERROR, `File does not exist: ${filePath}`);
      return;
    }

    const workbook = xlsx.readFile(filePath);
    log(LOG_LEVEL.INFO, `- Sheets: ${workbook.SheetNames.join(", ")}`);

    // Check each sheet
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      log(LOG_LEVEL.INFO, `- Sheet "${sheetName}": ${data.length} rows`);

      if (data.length > 0) {
        // Show column names
        const columns = Object.keys(data[0]);
        log(LOG_LEVEL.INFO, `  - Columns: ${columns.join(", ")}`);

        // Show sample row
        log(LOG_LEVEL.INFO, "  - First row:", JSON.stringify(data[0], null, 2));
      } else {
        log(LOG_LEVEL.INFO, "  - Sheet is empty");
      }
    });
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error checking Excel file ${filePath}:`, error);
  }
}

// Function to check CSV file
function checkCSVFile(filePath) {
  try {
    log(LOG_LEVEL.INFO, `\nChecking CSV file: ${path.basename(filePath)}`);

    if (!fs.existsSync(filePath)) {
      log(LOG_LEVEL.ERROR, `File does not exist: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    if (lines.length > 0) {
      const headerLine = lines[0];
      const headers = headerLine.split(",");

      log(LOG_LEVEL.INFO, `- Headers: ${headers.join(", ")}`);
      log(LOG_LEVEL.INFO, `- Total rows: ${lines.length - 1}`);

      if (lines.length > 1) {
        log(LOG_LEVEL.INFO, "- First data line:", lines[1]);
      }
    } else {
      log(LOG_LEVEL.INFO, "- File is empty");
    }
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error checking CSV file ${filePath}:`, error);
  }
}

// Check data directories
log(LOG_LEVEL.INFO, "=== CHECKING DATA DIRECTORIES AND FILES ===");

// Check main data directory
const dataItems = logDirectoryContents(BASE_DIR);

// Check customer data
if (fs.existsSync(CUSTOMER_DIR)) {
  const customerItems = logDirectoryContents(CUSTOMER_DIR);

  // Check Excel files in customer directory
  customerItems.forEach((item) => {
    if (item.endsWith(".xlsx")) {
      checkExcelFile(path.join(CUSTOMER_DIR, item));
    }
  });
}

// Check sales data
if (fs.existsSync(SALES_DIR)) {
  const salesItems = logDirectoryContents(SALES_DIR);

  // Check CSV files in sales directory
  salesItems.forEach((item) => {
    if (item.endsWith(".csv")) {
      checkCSVFile(path.join(SALES_DIR, item));
    }
  });
}

// Check support data
if (fs.existsSync(SUPPORT_DIR)) {
  const supportItems = logDirectoryContents(SUPPORT_DIR);

  // Check Excel files in support directory
  supportItems.forEach((item) => {
    if (item.endsWith(".xlsx")) {
      checkExcelFile(path.join(SUPPORT_DIR, item));
    }
  });
}

log(LOG_LEVEL.INFO, "\n=== DATA FILES CHECK COMPLETE ===");
