const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Base directories
const BASE_DIR = path.join(__dirname, '..', 'data');
const CUSTOMER_DIR = path.join(BASE_DIR, 'customer');
const SALES_DIR = path.join(BASE_DIR, 'sales');
const SUPPORT_DIR = path.join(BASE_DIR, 'support');

// Function to log directory contents
function logDirectoryContents(dir) {
  console.log(`\nChecking directory: ${dir}`);
  
  if (!fs.existsSync(dir)) {
    console.error(`Directory does not exist: ${dir}`);
    return;
  }
  
  const items = fs.readdirSync(dir);
  console.log(`Found ${items.length} items:`);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      console.log(`- [DIR] ${item}`);
    } else {
      console.log(`- [FILE] ${item} (${Math.round(stats.size / 1024)} KB)`);
    }
  });
  
  return items;
}

// Function to check Excel file
function checkExcelFile(filePath) {
  try {
    console.log(`\nChecking Excel file: ${path.basename(filePath)}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return;
    }
    
    const workbook = xlsx.readFile(filePath);
    console.log(`- Sheets: ${workbook.SheetNames.join(', ')}`);
    
    // Check each sheet
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      
      console.log(`- Sheet "${sheetName}": ${data.length} rows`);
      
      if (data.length > 0) {
        // Show column names
        const columns = Object.keys(data[0]);
        console.log(`  - Columns: ${columns.join(', ')}`);
        
        // Show sample row
        console.log('  - First row:', JSON.stringify(data[0], null, 2));
      } else {
        console.log('  - Sheet is empty');
      }
    });
  } catch (error) {
    console.error(`Error checking Excel file ${filePath}:`, error);
  }
}

// Function to check CSV file
function checkCSVFile(filePath) {
  try {
    console.log(`\nChecking CSV file: ${path.basename(filePath)}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (lines.length > 0) {
      const headerLine = lines[0];
      const headers = headerLine.split(',');
      
      console.log(`- Headers: ${headers.join(', ')}`);
      console.log(`- Total rows: ${lines.length - 1}`);
      
      if (lines.length > 1) {
        console.log('- First data line:', lines[1]);
      }
    } else {
      console.log('- File is empty');
    }
  } catch (error) {
    console.error(`Error checking CSV file ${filePath}:`, error);
  }
}

// Check data directories
console.log('=== CHECKING DATA DIRECTORIES AND FILES ===');

// Check main data directory
const dataItems = logDirectoryContents(BASE_DIR);

// Check customer data
if (fs.existsSync(CUSTOMER_DIR)) {
  const customerItems = logDirectoryContents(CUSTOMER_DIR);
  
  // Check Excel files in customer directory
  customerItems.forEach(item => {
    if (item.endsWith('.xlsx')) {
      checkExcelFile(path.join(CUSTOMER_DIR, item));
    }
  });
}

// Check sales data
if (fs.existsSync(SALES_DIR)) {
  const salesItems = logDirectoryContents(SALES_DIR);
  
  // Check CSV files in sales directory
  salesItems.forEach(item => {
    if (item.endsWith('.csv')) {
      checkCSVFile(path.join(SALES_DIR, item));
    }
  });
}

// Check support data
if (fs.existsSync(SUPPORT_DIR)) {
  const supportItems = logDirectoryContents(SUPPORT_DIR);
  
  // Check Excel files in support directory
  supportItems.forEach(item => {
    if (item.endsWith('.xlsx')) {
      checkExcelFile(path.join(SUPPORT_DIR, item));
    }
  });
}

console.log('\n=== DATA FILES CHECK COMPLETE ===');
