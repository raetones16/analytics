const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Generate dates for the last 90 days
function generateDates(days = 90) {
  const dates = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    dates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
  }
  
  return dates;
}

// Generate random number within range
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ensure data directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Base directories
const BASE_DIR = path.join(__dirname, '..', 'data');
const CUSTOMER_DIR = path.join(BASE_DIR, 'customer');
const SALES_DIR = path.join(BASE_DIR, 'sales');
const SUPPORT_DIR = path.join(BASE_DIR, 'support');

// Ensure directories exist
[BASE_DIR, CUSTOMER_DIR, SALES_DIR, SUPPORT_DIR].forEach(ensureDir);

// Generate dates
const dates = generateDates(90);

// -------------------------
// 1. Generate Web App Stats
// -------------------------
const webAppStats = dates.map(date => ({
  Date: date,
  Logins: randomNumber(800, 1600),
  AbsencesBooked: randomNumber(200, 500),
  WorkflowsCreated: randomNumber(30, 80)
}));

// Create workbook and add data
const webAppWorkbook = xlsx.utils.book_new();
const webAppSheet = xlsx.utils.json_to_sheet(webAppStats);
xlsx.utils.book_append_sheet(webAppWorkbook, webAppSheet, 'Web App Data');

// Write to file
xlsx.writeFile(webAppWorkbook, path.join(CUSTOMER_DIR, 'Web App Stats (Last 90 Days).xlsx'));
console.log('Generated Web App Stats file');

// -------------------------
// 2. Generate Mobile App Stats
// -------------------------
const mobileAppStats = dates.map(date => ({
  Date: date,
  Logins: randomNumber(600, 1200),
  AbsencesBooked: randomNumber(150, 300)
}));

// Create workbook and add data
const mobileAppWorkbook = xlsx.utils.book_new();
const mobileAppSheet = xlsx.utils.json_to_sheet(mobileAppStats);
xlsx.utils.book_append_sheet(mobileAppWorkbook, mobileAppSheet, 'Mobile App Data');

// Write to file
xlsx.writeFile(mobileAppWorkbook, path.join(CUSTOMER_DIR, 'Mobile App Stats (Last 90 Days).xlsx'));
console.log('Generated Mobile App Stats file');

// -------------------------
// 3. Generate Timesheet Stats
// -------------------------
const timesheetStats = dates.map(date => ({
  Date: date,
  WebTimesheets: randomNumber(700, 1200),
  MobileTimesheets: randomNumber(400, 800)
}));

// Create workbook and add data
const timesheetWorkbook = xlsx.utils.book_new();
const timesheetSheet = xlsx.utils.json_to_sheet(timesheetStats);
xlsx.utils.book_append_sheet(timesheetWorkbook, timesheetSheet, 'Timesheet Data');

// Write to file
xlsx.writeFile(timesheetWorkbook, path.join(CUSTOMER_DIR, 'Timesheet Stats (Last 90 Days).xlsx'));
console.log('Generated Timesheet Stats file');

// -------------------------
// 4. Generate Salesforce Opportunities Data
// -------------------------
// Generate monthly data for the last 12 months
const salesDates = [];
const now = new Date();

for (let i = 12; i >= 0; i--) {
  // Get the first day of each month
  const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
  salesDates.push(date.toISOString().split('T')[0]);
}

// Generate multiple opportunities per month
const salesforceData = [];
let id = 1;

salesDates.forEach(monthDate => {
  // Generate 5-15 opportunities per month
  const opportunityCount = randomNumber(5, 15);
  
  for (let i = 0; i < opportunityCount; i++) {
    // Generate a random day in the month
    const dateParts = monthDate.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0).getDate();
    const day = randomNumber(1, lastDay);
    
    // Format the close date
    const closeDate = new Date(year, month, day).toISOString().split('T')[0];
    
    salesforceData.push({
      Id: `OPP-${id++}`,
      CloseDate: closeDate,
      Amount: randomNumber(5000, 15000),
      NumberOfModules: randomNumber(2, 6)
    });
  }
});

// Write to CSV file
const salesforceCsv = 
  'Id,CloseDate,Amount,NumberOfModules\n' +
  salesforceData.map(opp => 
    `${opp.Id},${opp.CloseDate},${opp.Amount},${opp.NumberOfModules}`
  ).join('\n');

fs.writeFileSync(path.join(SALES_DIR, 'salesforce-won-opportunities.csv'), salesforceCsv);
console.log('Generated Salesforce Opportunities file');

// -------------------------
// 5. Generate Support Tickets Data
// -------------------------
// Priority options
const priorities = ['Low', 'Medium', 'High', 'Urgent'];

// Topic options
const topics = [
  'Login Issues', 
  'Reporting', 
  'Mobile App', 
  'Integrations', 
  'Workflows', 
  'System Performance',
  'Feature Request',
  'Billing',
  'User Management',
  'Other'
];

// Ticket types
const types = ['Issue', 'Question', 'Feature Request', 'Cancellation'];

// Generate support tickets
const supportTickets = [];

for (let i = 0; i < 300; i++) {
  // Random date within the last 90 days
  const dateIndex = randomNumber(0, dates.length - 1);
  const createdAt = dates[dateIndex];
  
  supportTickets.push({
    Created_at: createdAt,
    Priority: priorities[randomNumber(0, priorities.length - 1)],
    Topic: topics[randomNumber(0, topics.length - 1)],
    Type: types[randomNumber(0, types.length - 1)],
    NPS_score: Math.random() < 0.7 ? randomNumber(0, 10) : null // 70% have NPS scores
  });
}

// Create workbook and add data
const supportWorkbook = xlsx.utils.book_new();
const supportSheet = xlsx.utils.json_to_sheet(supportTickets);
xlsx.utils.book_append_sheet(supportWorkbook, supportSheet, 'Support Tickets');

// Write to file
xlsx.writeFile(supportWorkbook, path.join(SUPPORT_DIR, 'Freshdesk Tickets 20250321_111939.xlsx'));
console.log('Generated Support Tickets file');

console.log('Sample data generation complete!');
