// Simple script to inspect the structure of Excel files
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Function to read Excel file and log details
function inspectExcelFile(filePath) {
  try {
    console.log(`\nInspecting Excel file: ${path.basename(filePath)}`);
    
    // Read the file
    const workbook = XLSX.readFile(filePath);
    
    console.log(`Available sheets: ${workbook.SheetNames.join(', ')}`);
    
    // Process each sheet
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      console.log(`\nSheet: ${sheetName}`);
      console.log(`Number of rows: ${data.length}`);
      
      if (data.length > 0) {
        // Log column names (headers)
        console.log("Column names:", Object.keys(data[0]).join(", "));
        
        // Show sample data (first row)
        console.log("First row sample:", JSON.stringify(data[0], null, 2));
      } else {
        console.log("Sheet is empty");
      }
    });
  } catch (error) {
    console.error(`Error inspecting Excel file: ${filePath}`, error);
  }
}

// Paths to the Excel files
const webAppStatsPath = '/Users/tim.prudames/analytics/data/customer/Web App Stats (Last 90 Days).xlsx';
const mobileAppStatsPath = '/Users/tim.prudames/analytics/data/customer/Mobile App Stats (Last 90 Days).xlsx';
const timesheetStatsPath = '/Users/tim.prudames/analytics/data/customer/Timesheet Stats (Last 90 Days).xlsx';
const supportPath = '/Users/tim.prudames/analytics/data/support/Freshdesk Tickets 20250321_111939.xlsx';

// Inspect each file
inspectExcelFile(webAppStatsPath);
inspectExcelFile(mobileAppStatsPath);
inspectExcelFile(timesheetStatsPath);
inspectExcelFile(supportPath);

console.log("\nInspection complete!");
