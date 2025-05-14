const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");
const requireTS = createRequire(import.meta ? import.meta.url : __filename);
const { log, LOG_LEVEL } = requireTS("../app/api/data/utils/logging.node.ts");

// Define paths
const dataDir = path.join(__dirname, "..", "data");
const customerDir = path.join(dataDir, "customer");
const salesDir = path.join(dataDir, "sales");
const supportDir = path.join(dataDir, "support");

// Ensure directory exists
function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    log(LOG_LEVEL.INFO, `Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    log(LOG_LEVEL.INFO, `Directory already exists: ${dir}`);
  }
}

// Main function
function setup() {
  log(LOG_LEVEL.INFO, "Setting up data directories...");

  // Create main data directories
  ensureDirectory(dataDir);
  ensureDirectory(customerDir);
  ensureDirectory(salesDir);
  ensureDirectory(supportDir);

  log(LOG_LEVEL.INFO, "\nDirectory structure:");
  log(LOG_LEVEL.INFO, `- ${dataDir}`);
  log(LOG_LEVEL.INFO, `  ├── ${path.basename(customerDir)}/`);
  log(LOG_LEVEL.INFO, `  ├── ${path.basename(salesDir)}/`);
  log(LOG_LEVEL.INFO, `  └── ${path.basename(supportDir)}/`);

  log(LOG_LEVEL.INFO, "\nSetup complete! Data directories are ready for use.");
  log(LOG_LEVEL.INFO, "\nNext steps:");
  log(LOG_LEVEL.INFO, "1. Add your data files to these directories");
  log(
    LOG_LEVEL.INFO,
    "   - customer/ - Excel files with Web App, Mobile App, and Timesheet stats"
  );
  log(
    LOG_LEVEL.INFO,
    "   - sales/ - CSV files with Salesforce opportunity data"
  );
  log(LOG_LEVEL.INFO, "   - support/ - Excel files with Freshdesk ticket data");
  log(LOG_LEVEL.INFO, "2. Or generate sample data with: npm run generate-data");
  log(LOG_LEVEL.INFO, "3. Start the development server: npm run dev");
}

// Run setup
setup();
