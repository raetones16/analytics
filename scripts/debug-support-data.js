// Debug script to verify the support data processing
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { createRequire } = require("module");
const requireTS = createRequire(import.meta ? import.meta.url : __filename);
const { log, LOG_LEVEL } = requireTS("../app/api/data/utils/logging.node.ts");

// Start a server to test the API route
log(LOG_LEVEL.INFO, "Starting a local test server...");

const server = spawn("npx", ["next", "dev", "-p", "3002"], {
  cwd: path.resolve(__dirname, ".."),
  env: { ...process.env, NODE_ENV: "development" },
  stdio: ["ignore", "pipe", "pipe"],
});

// Collect stdout for debug information
server.stdout.on("data", (data) => {
  const output = data.toString();
  if (output.includes("support")) {
    log(LOG_LEVEL.INFO, "SERVER: " + output.trim());
  }
});

server.stderr.on("data", (data) => {
  log(LOG_LEVEL.ERROR, "SERVER ERROR: " + data.toString().trim());
});

// Wait for server to start, then make a series of test requests
setTimeout(() => {
  log(LOG_LEVEL.INFO, "\n--- Testing API with different date ranges ---\n");

  // Make requests with different date ranges
  testDateRange("month")
    .then(() => testDateRange("quarter"))
    .then(() => testDateRange("half-year"))
    .then(() => testDateRange("year"))
    .then(() => {
      log(LOG_LEVEL.INFO, "\n--- Tests completed ---");
      server.kill();
      process.exit(0);
    })
    .catch((error) => {
      log(LOG_LEVEL.ERROR, "TEST ERROR: " + error.message);
      server.kill();
      process.exit(1);
    });
}, 8000); // Wait 8 seconds for server to start

async function testDateRange(range) {
  log(LOG_LEVEL.INFO, `\nTesting with date range: ${range}`);
  try {
    const response = await fetch(`http://localhost:3002/api/data?type=csat`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    log(LOG_LEVEL.INFO, `Received ${data.length} CSAT data points`);

    // Analyze data
    if (data.length > 0) {
      const totalTickets = data.reduce(
        (sum, item) => sum + item.totalTickets,
        0
      );
      log(LOG_LEVEL.INFO, `Total tickets across all months: ${totalTickets}`);

      // Get date range
      const dates = data.map((item) => new Date(item.date));
      const oldestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const newestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

      log(
        LOG_LEVEL.INFO,
        `Date range: ${oldestDate.toISOString().split("T")[0]} to ${
          newestDate.toISOString().split("T")[0]
        }`
      );

      // Show month-by-month breakdown
      log(LOG_LEVEL.INFO, "\nMonthly breakdown:");
      data
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .forEach((item) => {
          log(LOG_LEVEL.INFO, `- ${item.date}: ${item.totalTickets} tickets`);
        });
    }

    return true;
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error testing ${range}: ${error.message}`);
    throw error;
  }
}

// Handle server termination
process.on("SIGINT", () => {
  server.kill();
  process.exit();
});
