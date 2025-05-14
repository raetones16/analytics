const http = require("http");
const fs = require("fs");
const path = require("path");
const { createRequire } = require("module");
const requireTS = createRequire(import.meta ? import.meta.url : __filename);
const { log, LOG_LEVEL } = requireTS("../app/api/data/utils/logging.node.ts");

// Create a directory for debug logs if it doesn't exist
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a timestamped log file
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFile = path.join(logsDir, `api-debug-${timestamp}.log`);
const logStream = fs.createWriteStream(logFile, { flags: "a" });

console.log(`Debug log will be saved to: ${logFile}`);

// Function to make API request
async function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/data?type=all",
      method: "GET",
    };

    log(LOG_LEVEL.INFO, "Making API request to /api/data?type=all");
    const req = http.request(options, (res) => {
      let data = "";

      // Log response status
      log(LOG_LEVEL.INFO, `Response status: ${res.statusCode}`);

      // Collect data chunks
      res.on("data", (chunk) => {
        data += chunk;
      });

      // Process complete response
      res.on("end", () => {
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(data);

          // Log summary of data
          log(LOG_LEVEL.INFO, "API Response Summary:");

          if (parsed.productData) {
            log(
              LOG_LEVEL.INFO,
              `- Product data: ${parsed.productData.length} records`
            );
            if (parsed.productData.length > 0) {
              log(
                LOG_LEVEL.INFO,
                `  First record: ${JSON.stringify(parsed.productData[0])}`
              );
            }
          }

          if (parsed.salesData) {
            log(
              LOG_LEVEL.INFO,
              `- Sales data: ${parsed.salesData.length} records`
            );
            if (parsed.salesData.length > 0) {
              log(
                LOG_LEVEL.INFO,
                `  First record: ${JSON.stringify(parsed.salesData[0])}`
              );
            }
          }

          if (parsed.csatData) {
            log(
              LOG_LEVEL.INFO,
              `- CSAT data: ${parsed.csatData.length} records`
            );
            if (parsed.csatData.length > 0) {
              log(
                LOG_LEVEL.INFO,
                `  First record: ${JSON.stringify(parsed.csatData[0])}`
              );
            }
          }

          resolve(parsed);
        } catch (error) {
          log(LOG_LEVEL.ERROR, `Error parsing API response: ${error.message}`);
          log(LOG_LEVEL.ERROR, `Raw response: ${data}`);
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      log(LOG_LEVEL.ERROR, `API request error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

// Helper to log to console and file
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}`;

  console.log(logLine);
  logStream.write(logLine + "\n");
}

// Handle log file closing
process.on("exit", () => {
  logStream.end();
  console.log(`Debug log saved to: ${logFile}`);
});

// Main function
async function main() {
  log(LOG_LEVEL.INFO, "Starting API debug script");

  try {
    // First, check if server is running by making a simple request
    log(LOG_LEVEL.INFO, "Checking if server is running...");

    try {
      await testAPI();
      log(LOG_LEVEL.INFO, "API test completed successfully.");
    } catch (error) {
      log(
        LOG_LEVEL.ERROR,
        `API test failed. Make sure the server is running with 'npm run dev' in another terminal.`
      );
    }
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error: ${error.message}`);
  }

  log(LOG_LEVEL.INFO, "Debug script completed");
}

// Run the main function
main().catch((error) => {
  log(LOG_LEVEL.ERROR, `Uncaught error: ${error.message}`);
  process.exit(1);
});
