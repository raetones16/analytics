const http = require("http");
const url = require("url");
const { createRequire } = require("module");
const requireTS = createRequire(import.meta ? import.meta.url : __filename);
const { log, LOG_LEVEL } = requireTS("../app/api/data/utils/logging.node.ts");

// Function to make simple HTTP request to our API endpoint
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: endpoint,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";

      // A chunk of data has been received
      res.on("data", (chunk) => {
        data += chunk;
      });

      // The whole response has been received
      res.on("end", () => {
        log(LOG_LEVEL.INFO, `Response status: ${res.statusCode}`);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            log(LOG_LEVEL.ERROR, "Error parsing JSON:", e);
            resolve(data);
          }
        } else {
          reject(
            new Error(
              `Request failed with status code ${res.statusCode}: ${data}`
            )
          );
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
}

// Test our API routes
async function runTests() {
  try {
    log(LOG_LEVEL.INFO, "Testing API endpoints...");

    // Test the 'all' endpoint
    log(LOG_LEVEL.INFO, "\n1. Testing /api/data?type=all endpoint");
    const allData = await makeRequest("/api/data?type=all");

    if (allData.productData) {
      log(
        LOG_LEVEL.INFO,
        `- Product data: ${allData.productData.length} records`
      );
    } else {
      log(LOG_LEVEL.WARN, "- No product data returned");
    }

    if (allData.salesData) {
      log(LOG_LEVEL.INFO, `- Sales data: ${allData.salesData.length} records`);
    } else {
      log(LOG_LEVEL.WARN, "- No sales data returned");
    }

    if (allData.csatData) {
      log(LOG_LEVEL.INFO, `- CSAT data: ${allData.csatData.length} records`);
    } else {
      log(LOG_LEVEL.WARN, "- No CSAT data returned");
    }

    // Test the 'product' endpoint
    log(LOG_LEVEL.INFO, "\n2. Testing /api/data?type=product endpoint");
    const productData = await makeRequest("/api/data?type=product");
    log(
      LOG_LEVEL.INFO,
      `- Returned ${
        Array.isArray(productData) ? productData.length : 0
      } product records`
    );
    if (productData.length > 0) {
      log(LOG_LEVEL.INFO, "- Sample record:", productData[0]);
    }

    // Test the 'sales' endpoint
    log(LOG_LEVEL.INFO, "\n3. Testing /api/data?type=sales endpoint");
    const salesData = await makeRequest("/api/data?type=sales");
    log(
      LOG_LEVEL.INFO,
      `- Returned ${
        Array.isArray(salesData) ? salesData.length : 0
      } sales records`
    );
    if (salesData.length > 0) {
      log(LOG_LEVEL.INFO, "- Sample record:", salesData[0]);
    }

    // Test the 'csat' endpoint
    log(LOG_LEVEL.INFO, "\n4. Testing /api/data?type=csat endpoint");
    const csatData = await makeRequest("/api/data?type=csat");
    log(
      LOG_LEVEL.INFO,
      `- Returned ${Array.isArray(csatData) ? csatData.length : 0} CSAT records`
    );
    if (csatData.length > 0) {
      log(LOG_LEVEL.INFO, "- Sample record:", csatData[0]);
    }

    log(LOG_LEVEL.INFO, "\nAPI tests completed successfully!");
  } catch (error) {
    log(LOG_LEVEL.ERROR, "Error during API testing:", error);
  }
}

// Run the tests
log(LOG_LEVEL.INFO, "Starting API tests...");
log(
  LOG_LEVEL.INFO,
  "Note: Make sure the Next.js development server is running on port 3000"
);
log(LOG_LEVEL.INFO, "You can start it with: npm run dev");
log(LOG_LEVEL.INFO, "-------------------------------------------------");

// Give a delay to allow time to read the instructions
setTimeout(runTests, 2000);
