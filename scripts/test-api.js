const http = require('http');
const url = require('url');

// Function to make simple HTTP request to our API endpoint
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';

      // A chunk of data has been received
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode}`);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (e) {
            console.error('Error parsing JSON:', e);
            resolve(data);
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Test our API routes
async function runTests() {
  try {
    console.log('Testing API endpoints...');
    
    // Test the 'all' endpoint
    console.log('\n1. Testing /api/data?type=all endpoint');
    const allData = await makeRequest('/api/data?type=all');
    
    if (allData.productData) {
      console.log(`- Product data: ${allData.productData.length} records`);
    } else {
      console.warn('- No product data returned');
    }
    
    if (allData.salesData) {
      console.log(`- Sales data: ${allData.salesData.length} records`);
    } else {
      console.warn('- No sales data returned');
    }
    
    if (allData.csatData) {
      console.log(`- CSAT data: ${allData.csatData.length} records`);
    } else {
      console.warn('- No CSAT data returned');
    }
    
    // Test the 'product' endpoint
    console.log('\n2. Testing /api/data?type=product endpoint');
    const productData = await makeRequest('/api/data?type=product');
    console.log(`- Returned ${Array.isArray(productData) ? productData.length : 0} product records`);
    if (productData.length > 0) {
      console.log('- Sample record:', productData[0]);
    }
    
    // Test the 'sales' endpoint
    console.log('\n3. Testing /api/data?type=sales endpoint');
    const salesData = await makeRequest('/api/data?type=sales');
    console.log(`- Returned ${Array.isArray(salesData) ? salesData.length : 0} sales records`);
    if (salesData.length > 0) {
      console.log('- Sample record:', salesData[0]);
    }
    
    // Test the 'csat' endpoint
    console.log('\n4. Testing /api/data?type=csat endpoint');
    const csatData = await makeRequest('/api/data?type=csat');
    console.log(`- Returned ${Array.isArray(csatData) ? csatData.length : 0} CSAT records`);
    if (csatData.length > 0) {
      console.log('- Sample record:', csatData[0]);
    }
    
    console.log('\nAPI tests completed successfully!');
  } catch (error) {
    console.error('Error during API testing:', error);
  }
}

// Run the tests
console.log('Starting API tests...');
console.log('Note: Make sure the Next.js development server is running on port 3000');
console.log('You can start it with: npm run dev');
console.log('-------------------------------------------------');

// Give a delay to allow time to read the instructions
setTimeout(runTests, 2000);
