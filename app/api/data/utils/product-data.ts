import { promises as fs } from 'fs';
import path from 'path';
import { LOG_LEVEL, log } from './logging';
import { DATA_DIRS, formatDateISO, formatDateForDisplay, readFile, sumColumn, parseDate } from './file-utils';

// Define interfaces for the data
interface ProductDataPoint {
  date: string;
  displayDate?: string;
  webLogins: number;
  mobileLogins: number;
  webAbsencesBooked: number;
  mobileAbsencesBooked: number;
  webTimesheetsSubmitted: number;
  mobileTimesheetsSubmitted: number;
  workflowsCreated: number;
  _synthetic?: {
    distribution?: boolean;
    data?: boolean;
  };
}

// Column name mappings - this allows us to handle variations in column naming
const COLUMN_MAPPINGS = {
  date: ['Date', 'date', 'Event Date', 'event_date', 'Transaction Date'],
  webLogins: ['Login Success (Total Events)', 'Web Login', 'Web Logins', 'Login Success'],
  mobileLogins: ['Mobile App Login Success (Total Events)', 'Mobile Login', 'Mobile Logins', 'Mobile App Login Success'],
  webAbsences: ['Created Absence (Total Events)', 'Absence Created', 'Web Absence', 'Web Absences Booked', 'Created Absence'],
  mobileAbsences: ['Mobile App Absence Booked (Total Events)', 'Mobile Absence', 'Mobile Absences Booked'],
  webTimesheets: ['Timesheet Submitted (Total Events)', 'Web Timesheet', 'Web Timesheets', 'Timesheet Submitted'],
  mobileTimesheets: ['Mobile App Timesheet Submitted (Total Events)', 'Mobile Timesheet', 'Mobile Timesheets'],
  workflows: ['User impersonated (Total Events)', 'Workflow Created', 'Workflows Created', 'User impersonated']
};

// Helper function to find column name in data
function findColumnName(data: any[], possibleNames: string[]): string | null {
  if (!data || data.length === 0) return null;
  const columns = Object.keys(data[0]);
  
  // Try exact match first
  for (const name of possibleNames) {
    if (columns.includes(name)) return name;
  }
  
  // Try case-insensitive match
  for (const name of possibleNames) {
    const lowercaseName = name.toLowerCase();
    const match = columns.find(col => col.toLowerCase() === lowercaseName);
    if (match) return match;
  }
  
  return null;
}

export async function processProductData(): Promise<ProductDataPoint[]> {
  try {
    log(LOG_LEVEL.INFO, "Processing product data...");
    const files = await fs.readdir(DATA_DIRS.customer);
    
    // Find the files we need
    // Use the original files (Last 90 Days) to get real data
    const webAppFile = files.find(f => f.includes('Web App Stats (Last 90 Days)'));
    const mobileAppFile = files.find(f => f.includes('Mobile App Stats (Last 90 Days)'));
    const timesheetFile = files.find(f => f.includes('Timesheet Stats'));
    
    // Get date mapping file (if available)
    const dateMapFile = files.find(f => f.includes('Date_Map.csv'));
    
    log(LOG_LEVEL.INFO, `Found files: Web=${webAppFile}, Mobile=${mobileAppFile}, Timesheet=${timesheetFile}`);
    
    if (!webAppFile && !mobileAppFile && !timesheetFile) {
      log(LOG_LEVEL.ERROR, "No product data files found");
      return [];
    }
    
    // Get date mapping if available
    let dateMap = new Map<string, string>();
    if (dateMapFile) {
      try {
        const dateMapData = await readFile(path.join(DATA_DIRS.customer, dateMapFile));
        // Create mapping from dates to month-year
        for (const row of dateMapData.data) {
          if (row.Date && row.MonthYear) {
            dateMap.set(row.Date, row.MonthYear);
          }
        }
        log(LOG_LEVEL.INFO, `Loaded date mapping with ${dateMap.size} entries`);
      } catch (error: unknown) {
        log(LOG_LEVEL.WARN, `Failed to load date mapping file: ${error}`);
      }
    }
    
    // Read all files
    const webStatsResult = webAppFile ? await readFile(path.join(DATA_DIRS.customer, webAppFile)) : { data: [] };
    const mobileStatsResult = mobileAppFile ? await readFile(path.join(DATA_DIRS.customer, mobileAppFile)) : { data: [] };
    const timesheetStatsResult = timesheetFile ? await readFile(path.join(DATA_DIRS.customer, timesheetFile)) : { data: [] };
    
    const webStats = webStatsResult.data;
    const mobileStats = mobileStatsResult.data;
    const timesheetStats = timesheetStatsResult.data;
    
    // Log column names for debugging
    if (webStats.length > 0) {
      log(LOG_LEVEL.INFO, `Web stats columns: ${Object.keys(webStats[0]).join(', ')}`);
    }
    if (mobileStats.length > 0) {
      log(LOG_LEVEL.INFO, `Mobile stats columns: ${Object.keys(mobileStats[0]).join(', ')}`);
    }
    if (timesheetStats.length > 0) {
      log(LOG_LEVEL.INFO, `Timesheet stats columns: ${Object.keys(timesheetStats[0]).join(', ')}`);
    }
    
    // Find metric columns in each dataset
    const webLoginsCol = findColumnName(webStats, COLUMN_MAPPINGS.webLogins);
    const mobileLoginsCol = findColumnName(mobileStats, COLUMN_MAPPINGS.mobileLogins) || 
                          findColumnName(webStats, COLUMN_MAPPINGS.mobileLogins);
    const webAbsencesCol = findColumnName(webStats, COLUMN_MAPPINGS.webAbsences);
    const mobileAbsencesCol = findColumnName(mobileStats, COLUMN_MAPPINGS.mobileAbsences);
    const webTimesheetsCol = findColumnName(webStats, COLUMN_MAPPINGS.webTimesheets) || 
                            findColumnName(timesheetStats, COLUMN_MAPPINGS.webTimesheets);
    const mobileTimesheetsCol = findColumnName(mobileStats, COLUMN_MAPPINGS.mobileTimesheets) || 
                              findColumnName(timesheetStats, COLUMN_MAPPINGS.mobileTimesheets);
    const workflowsCol = findColumnName(webStats, COLUMN_MAPPINGS.workflows);
    
    log(LOG_LEVEL.INFO, `Identified columns - ` +
                       `Web logins: ${webLoginsCol}, Mobile logins: ${mobileLoginsCol}, ` +
                       `Web absences: ${webAbsencesCol}, Mobile absences: ${mobileAbsencesCol}, ` +
                       `Web timesheets: ${webTimesheetsCol}, Mobile timesheets: ${mobileTimesheetsCol}, ` +
                       `Workflows: ${workflowsCol}`);
    
    // Calculate totals from the files
    const webLoginTotal = webLoginsCol ? sumColumn(webStats, webLoginsCol) : 0;
    const mobileLoginTotal = mobileLoginsCol ? 
      (mobileStats.length > 0 ? sumColumn(mobileStats, mobileLoginsCol) : sumColumn(webStats, mobileLoginsCol)) : 0;
    
    const webAbsencesTotal = webAbsencesCol ? sumColumn(webStats, webAbsencesCol) : 0;
    const mobileAbsencesTotal = mobileAbsencesCol ? sumColumn(mobileStats, mobileAbsencesCol) : 0;
    
    const webTimesheetsTotal = webTimesheetsCol ? 
      (webStats.length > 0 ? sumColumn(webStats, webTimesheetsCol) : sumColumn(timesheetStats, webTimesheetsCol)) : 0;
    const mobileTimesheetsTotal = mobileTimesheetsCol ? 
      (mobileStats.length > 0 ? sumColumn(mobileStats, mobileTimesheetsCol) : sumColumn(timesheetStats, mobileTimesheetsCol)) : 0;
    
    const workflowsTotal = workflowsCol ? sumColumn(webStats, workflowsCol) : 0;
    
    log(LOG_LEVEL.INFO, `Calculated totals - Web logins: ${webLoginTotal}, Mobile logins: ${mobileLoginTotal}, ` +
                       `Web absences: ${webAbsencesTotal}, Mobile absences: ${mobileAbsencesTotal}, ` +
                       `Web timesheets: ${webTimesheetsTotal}, Mobile timesheets: ${mobileTimesheetsTotal}, ` +
                       `Workflows: ${workflowsTotal}`);
    
    // Create 3 months of data (most recent months)
    const today = new Date();
    const months = [
      new Date(today.getFullYear(), today.getMonth() - 2, 1),
      new Date(today.getFullYear(), today.getMonth() - 1, 1),
      new Date(today.getFullYear(), today.getMonth(), 1)
    ];
    
    // If we have a date mapping, use it for the dates
    if (dateMap.size > 0) {
      // Use the dates from the mapping instead
      months.length = 0; // Clear the array
      
      // Get unique month-years
      const uniqueMonthYears = new Set<string>();
      dateMap.forEach((monthYear) => {
        uniqueMonthYears.add(monthYear);
      });
      
      // Create dates for each unique month-year
      for (const monthYear of Array.from(uniqueMonthYears).sort()) {
        const [month, year] = monthYear.split(' ');
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
        if (monthIndex !== -1) {
          months.push(new Date(parseInt(year), monthIndex, 1));
        }
      }
      
      log(LOG_LEVEL.INFO, `Using ${months.length} months from date mapping`);
    }
    
    // Distribution factors for the 3 months (Jan, Feb, Mar 2025)
    // These determine how the total is distributed across months
    const distributionFactors = [
      { web: 0.32, mobile: 0.30 }, // Month 1 (Jan)
      { web: 0.33, mobile: 0.32 }, // Month 2 (Feb)
      { web: 0.35, mobile: 0.38 }  // Month 3 (Mar)
    ];
    
    // Distribute the totals across months based on the factors
    const result = months.map((date, i) => {
      const factor = distributionFactors[i];
      
      return {
        date: formatDateISO(date),
        displayDate: formatDateForDisplay(date),
        webLogins: Math.round(webLoginTotal * factor.web),
        mobileLogins: Math.round(mobileLoginTotal * factor.mobile),
        webAbsencesBooked: Math.round(webAbsencesTotal * factor.web),
        mobileAbsencesBooked: Math.round(mobileAbsencesTotal * factor.mobile),
        webTimesheetsSubmitted: Math.round(webTimesheetsTotal * factor.web),
        mobileTimesheetsSubmitted: Math.round(mobileTimesheetsTotal * factor.mobile),
        workflowsCreated: Math.round(workflowsTotal * (0.42 + i * 0.08)), // Increasing trend for workflows
        _synthetic: {
          distribution: true, // The monthly distribution is synthetic
          data: false        // The total data is from real files
        }
      };
    });
    
    log(LOG_LEVEL.INFO, `Processed ${result.length} product data points with monthly aggregation`);
    return result;
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    log(LOG_LEVEL.ERROR, `Product data processing failed: ${errorMessage}`);
    return [];
  }
}