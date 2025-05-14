const { spawn } = require("child_process");
const path = require("path");
const { createRequire } = require("module");
const requireTS = createRequire(import.meta ? import.meta.url : __filename);
const { log, LOG_LEVEL } = requireTS("../app/api/data/utils/logging.node.ts");

// Execute the data API to test XLSX file reading
log(LOG_LEVEL.INFO, "Testing XLSX support file reading...");

// Create a simple server to test the API route
const server = spawn("npx", ["next", "dev", "-p", "3001"], {
  cwd: path.resolve(__dirname, ".."),
  env: { ...process.env, NODE_ENV: "development" },
  stdio: "inherit",
});

// Wait for server to start, then make a request
setTimeout(() => {
  log(LOG_LEVEL.INFO, "Making test request to API...");

  // Make a simple fetch request to the API
  fetch("http://localhost:3001/api/data?type=csat")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      log(LOG_LEVEL.SUCCESS, "🟢 SUCCESS: Received response from API");
      log(LOG_LEVEL.INFO, `Total CSAT data points: ${data.length}`);

      // Print unique months in the data
      const uniqueMonths = new Set();
      data.forEach((point) => uniqueMonths.add(point.date));
      log(
        LOG_LEVEL.INFO,
        `Unique months in data: ${Array.from(uniqueMonths).sort().join(", ")}`
      );

      // Summarize ticket data
      const totalTickets = data.reduce(
        (sum, point) => sum + point.totalTickets,
        0
      );
      log(LOG_LEVEL.INFO, `Total tickets processed: ${totalTickets}`);

      // Clean up and exit
      server.kill();
      process.exit(0);
    })
    .catch((error) => {
      log(LOG_LEVEL.ERROR, "🔴 ERROR:", error);
      server.kill();
      process.exit(1);
    });
}, 5000); // Wait 5 seconds for server to start

// Handle server termination
process.on("SIGINT", () => {
  server.kill();
  process.exit();
});
