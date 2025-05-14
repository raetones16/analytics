// Simple script to verify the structure of our data files
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const Papa = require("papaparse");
const { createRequire } = require("module");
const requireTS = createRequire(import.meta ? import.meta.url : __filename);
const { log, LOG_LEVEL } = requireTS("../app/api/data/utils/logging.node.ts");

const BASE_DATA_DIR = path.join(__dirname, "..", "data");

// Log directory structure
const logDirectoryStructure = (dir) => {
  try {
    log(LOG_LEVEL.INFO, `\nChecking directory: ${dir}`);
    const items = fs.readdirSync(dir);
    log(LOG_LEVEL.INFO, `Found ${items.length} items: ${items.join(", ")}`);
    return items;
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error reading directory ${dir}:`, error);
    return [];
  }
};

// Function to check Excel file
const checkExcelFile = (filePath) => {
  try {
    log(LOG_LEVEL.INFO, `\nChecking Excel file: ${path.basename(filePath)}`);
    const workbook = xlsx.readFile(filePath);

    log(LOG_LEVEL.INFO, `Available sheets: ${workbook.SheetNames.join(", ")}`);

    // Check each sheet
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      log(LOG_LEVEL.INFO, `Sheet: ${sheetName}, Rows: ${data.length}`);

      if (data.length > 0) {
        // Check column names
        const columns = Object.keys(data[0]);
        log(LOG_LEVEL.INFO, `Columns: ${columns.join(", ")}`);

        // Show sample data (first row)
        log(LOG_LEVEL.INFO, "Sample data (first row):", data[0]);
      } else {
        log(LOG_LEVEL.INFO, "Sheet is empty");
      }
    });
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error processing Excel file ${filePath}:`, error);
  }
};

// Function to check CSV file
const checkCSVFile = (filePath) => {
  try {
    log(LOG_LEVEL.INFO, `\nChecking CSV file: ${path.basename(filePath)}`);
    const content = fs.readFileSync(filePath, "utf8");
    const result = Papa.parse(content, { header: true, dynamicTyping: true });

    log(LOG_LEVEL.INFO, `Rows: ${result.data.length}`);

    if (result.data.length > 0) {
      // Check column names
      log(LOG_LEVEL.INFO, `Columns: ${result.meta.fields.join(", ")}`);

      // Show sample data (first row)
      log(LOG_LEVEL.INFO, "Sample data (first row):", result.data[0]);
    } else {
      log(LOG_LEVEL.INFO, "File is empty");
    }
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error processing CSV file ${filePath}:`, error);
  }
};

// Check main data directory
log(LOG_LEVEL.INFO, "=== CHECKING DATA DIRECTORIES AND FILES ===");
const dataDir = logDirectoryStructure(BASE_DATA_DIR);

// Check customer data
if (dataDir.includes("customer")) {
  const customerDir = path.join(BASE_DATA_DIR, "customer");
  const customerFiles = logDirectoryStructure(customerDir);

  // Check each Excel file in the customer directory
  customerFiles.forEach((file) => {
    if (file.endsWith(".xlsx")) {
      checkExcelFile(path.join(customerDir, file));
    }
  });
}

// Check sales data
if (dataDir.includes("sales")) {
  const salesDir = path.join(BASE_DATA_DIR, "sales");
  const salesFiles = logDirectoryStructure(salesDir);

  // Check each CSV file in the sales directory
  salesFiles.forEach((file) => {
    if (file.endsWith(".csv")) {
      checkCSVFile(path.join(salesDir, file));
    }
  });
}

// Check support data
if (dataDir.includes("support")) {
  const supportDir = path.join(BASE_DATA_DIR, "support");
  const supportFiles = logDirectoryStructure(supportDir);

  // Check each Excel file in the support directory
  supportFiles.forEach((file) => {
    if (file.endsWith(".xlsx")) {
      checkExcelFile(path.join(supportDir, file));
    }
  });
}

log(LOG_LEVEL.INFO, "\n=== DATA CHECK COMPLETE ===");
