const fs = require('fs');
const path = require('path');

// Define paths
const dataDir = path.join(__dirname, '..', 'data');
const customerDir = path.join(dataDir, 'customer');
const salesDir = path.join(dataDir, 'sales');
const supportDir = path.join(dataDir, 'support');

// Ensure directory exists
function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
}

// Main function
function setup() {
  console.log('Setting up data directories...');
  
  // Create main data directories
  ensureDirectory(dataDir);
  ensureDirectory(customerDir);
  ensureDirectory(salesDir);
  ensureDirectory(supportDir);
  
  console.log('\nDirectory structure:');
  console.log(`- ${dataDir}`);
  console.log(`  ├── ${path.basename(customerDir)}/`);
  console.log(`  ├── ${path.basename(salesDir)}/`);
  console.log(`  └── ${path.basename(supportDir)}/`);
  
  console.log('\nSetup complete! Data directories are ready for use.');
  console.log('\nNext steps:');
  console.log('1. Add your data files to these directories');
  console.log('   - customer/ - Excel files with Web App, Mobile App, and Timesheet stats');
  console.log('   - sales/ - CSV files with Salesforce opportunity data');
  console.log('   - support/ - Excel files with Freshdesk ticket data');
  console.log('2. Or generate sample data with: npm run generate-data');
  console.log('3. Start the development server: npm run dev');
}

// Run setup
setup();
