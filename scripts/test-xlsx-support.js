const { spawn } = require('child_process');
const path = require('path');

// Execute the data API to test XLSX file reading
console.log('Testing XLSX support file reading...');

// Create a simple server to test the API route
const server = spawn('npx', ['next', 'dev', '-p', '3001'], {
  cwd: path.resolve(__dirname, '..'),
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit'
});

// Wait for server to start, then make a request
setTimeout(() => {
  console.log('Making test request to API...');
  
  // Make a simple fetch request to the API
  fetch('http://localhost:3001/api/data?type=csat')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('🟢 SUCCESS: Received response from API');
      console.log(`Total CSAT data points: ${data.length}`);
      
      // Print unique months in the data
      const uniqueMonths = new Set();
      data.forEach(point => uniqueMonths.add(point.date));
      console.log(`Unique months in data: ${Array.from(uniqueMonths).sort().join(', ')}`);
      
      // Summarize ticket data
      const totalTickets = data.reduce((sum, point) => sum + point.totalTickets, 0);
      console.log(`Total tickets processed: ${totalTickets}`);
      
      // Clean up and exit
      server.kill();
      process.exit(0);
    })
    .catch(error => {
      console.error('🔴 ERROR:', error);
      server.kill();
      process.exit(1);
    });
}, 5000); // Wait 5 seconds for server to start

// Handle server termination
process.on('SIGINT', () => {
  server.kill();
  process.exit();
});
