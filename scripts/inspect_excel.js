// Simple script to inspect the structure of Excel files
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");
const requireTS = createRequire(import.meta ? import.meta.url : __filename);
const { log, LOG_LEVEL } = requireTS("../app/api/data/utils/logging.node.ts");

// Function to read Excel file and log details
function inspectExcelFile(filePath) {
  try {
    log(LOG_LEVEL.INFO, `\nInspecting Excel file: ${path.basename(filePath)}`);

    // Read the file
    const workbook = XLSX.readFile(filePath);

    log(LOG_LEVEL.INFO, `Available sheets: ${workbook.SheetNames.join(", ")}`);

    // Process each sheet
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      log(LOG_LEVEL.INFO, `\nSheet: ${sheetName}`);
      log(LOG_LEVEL.INFO, `Number of rows: ${data.length}`);

      if (data.length > 0) {
        // Log column names (headers)
        log(LOG_LEVEL.INFO, "Column names:", Object.keys(data[0]).join(", "));

        // Show sample data (first row)
        log(
          LOG_LEVEL.INFO,
          "First row sample:",
          JSON.stringify(data[0], null, 2)
        );
      } else {
        log(LOG_LEVEL.INFO, "Sheet is empty");
      }
    });
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error inspecting Excel file: ${filePath}`, error);
  }
}

// Paths to the Excel files
const webAppStatsPath =
  "/Users/tim.prudames/analytics/data/customer/Web App Stats (Last 90 Days).xlsx";
const mobileAppStatsPath =
  "/Users/tim.prudames/analytics/data/customer/Mobile App Stats (Last 90 Days).xlsx";
const timesheetStatsPath =
  "/Users/tim.prudames/analytics/data/customer/Timesheet Stats (Last 90 Days).xlsx";
const supportPath =
  "/Users/tim.prudames/analytics/data/support/Freshdesk Tickets 20250321_111939.xlsx";

// Inspect each file
inspectExcelFile(webAppStatsPath);
inspectExcelFile(mobileAppStatsPath);
inspectExcelFile(timesheetStatsPath);
inspectExcelFile(supportPath);

log(LOG_LEVEL.INFO, "\nInspection complete!");
