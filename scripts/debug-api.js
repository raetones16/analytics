const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a directory for debug logs if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a timestamped log file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(logsDir, `api-debug-${timestamp}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

console.log(`Debug log will be saved to: ${logFile}`);

// Function to make API request
async function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/data?type=all',
      method: 'GET',
    };

    logMessage('Making API request to /api/data?type=all');
    const req = http.request(options, (res) => {
      let data = '';

      // Log response status
      logMessage(`Response status: ${res.statusCode}`);
      
      // Collect data chunks
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Process complete response
      res.on('end', () => {
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(data);
          
          // Log summary of data
          logMessage('API Response Summary:');
          
          if (parsed.productData) {
            logMessage(`- Product data: ${parsed.productData.length} records`);
            if (parsed.productData.length > 0) {
              logMessage(`  First record: ${JSON.stringify(parsed.productData[0])}`);
            }
          }
          
          if (parsed.salesData) {
            logMessage(`- Sales data: ${parsed.salesData.length} records`);
            if (parsed.salesData.length > 0) {
              logMessage(`  First record: ${JSON.stringify(parsed.salesData[0])}`);
            }
          }
          
          if (parsed.csatData) {
            logMessage(`- CSAT data: ${parsed.csatData.length} records`);
            if (parsed.csatData.length > 0) {
              logMessage(`  First record: ${JSON.stringify(parsed.csatData[0])}`);
            }
          }
          
          resolve(parsed);
        } catch (error) {
          logMessage(`Error parsing API response: ${error.message}`);
          logMessage(`Raw response: ${data}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      logMessage(`API request error: ${error.message}`);
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
  logStream.write(logLine + '\n');
}

// Handle log file closing
process.on('exit', () => {
  logStream.end();
  console.log(`Debug log saved to: ${logFile}`);
});

// Main function
async function main() {
  logMessage('Starting API debug script');
  
  try {
    // First, check if server is running by making a simple request
    logMessage('Checking if server is running...');
    
    try {
      await testAPI();
      logMessage('API test completed successfully.');
    } catch (error) {
      logMessage(`API test failed. Make sure the server is running with 'npm run dev' in another terminal.`);
    }
    
  } catch (error) {
    logMessage(`Error: ${error.message}`);
  }
  
  logMessage('Debug script completed');
}

// Run the main function
main().catch(error => {
  logMessage(`Uncaught error: ${error.message}`);
  process.exit(1);
});
