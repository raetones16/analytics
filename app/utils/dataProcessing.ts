import { readCSVFile, readExcelFile } from './readFiles';

// Types for our data
export interface ProductUsageData {
  date: string;
  webLogins: number;
  mobileLogins: number;
  webAbsencesBooked: number;
  mobileAbsencesBooked: number;
  webTimesheetsSubmitted: number;
  mobileTimesheetsSubmitted: number;
  workflowsCreated: number;
}

export interface SalesData {
  date: string;
  averageOrderValue: number;
  averageModulesPerClient: number;
  arrGrowth: number;
}

export interface CSATData {
  date: string;
  npsScore: number;
  churnPercentage: number;
  supportTicketsBySeverity: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  supportTopics: {
    [key: string]: number;
  };
}

/**
 * Process product usage data from Excel files
 */
export async function processProductUsageData(
  webStatsPath: string,
  mobileStatsPath: string,
  timesheetStatsPath: string
): Promise<ProductUsageData[]> {
  try {
    // Read the data files
    const webStats: any[] = await readExcelFile(webStatsPath);
    const mobileStats: any[] = await readExcelFile(mobileStatsPath);
    const timesheetStats: any[] = await readExcelFile(timesheetStatsPath);

    // Create a map of dates to combined data
    const dataByDate = new Map<string, Partial<ProductUsageData>>();

    // Process web stats
    webStats.forEach(stat => {
      const date = new Date(stat.Date).toISOString().split('T')[0];
      if (!dataByDate.has(date)) {
        dataByDate.set(date, { date });
      }
      const data = dataByDate.get(date)!;
      data.webLogins = stat.Logins || 0;
      data.webAbsencesBooked = stat.AbsencesBooked || 0;
      data.workflowsCreated = stat.WorkflowsCreated || 0;
    });

    // Process mobile stats
    mobileStats.forEach(stat => {
      const date = new Date(stat.Date).toISOString().split('T')[0];
      if (!dataByDate.has(date)) {
        dataByDate.set(date, { date });
      }
      const data = dataByDate.get(date)!;
      data.mobileLogins = stat.Logins || 0;
      data.mobileAbsencesBooked = stat.AbsencesBooked || 0;
    });

    // Process timesheet stats
    timesheetStats.forEach(stat => {
      const date = new Date(stat.Date).toISOString().split('T')[0];
      if (!dataByDate.has(date)) {
        dataByDate.set(date, { date });
      }
      const data = dataByDate.get(date)!;
      data.webTimesheetsSubmitted = stat.WebTimesheets || 0;
      data.mobileTimesheetsSubmitted = stat.MobileTimesheets || 0;
    });

    // Convert the map to an array and fill in any missing values with 0
    const result = Array.from(dataByDate.values()).map(item => ({
      date: item.date || '',
      webLogins: item.webLogins || 0,
      mobileLogins: item.mobileLogins || 0,
      webAbsencesBooked: item.webAbsencesBooked || 0,
      mobileAbsencesBooked: item.mobileAbsencesBooked || 0,
      webTimesheetsSubmitted: item.webTimesheetsSubmitted || 0,
      mobileTimesheetsSubmitted: item.mobileTimesheetsSubmitted || 0,
      workflowsCreated: item.workflowsCreated || 0,
    }));

    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error processing product usage data:', error);
    return [];
  }
}

/**
 * Process sales data from Salesforce CSV exports
 */
export async function processSalesData(salesforcePath: string): Promise<SalesData[]> {
  try {
    // Read the sales data
    const result = await readCSVFile(salesforcePath);
    const salesforceData = result.data;

    // Group by month
    const dataByMonth = new Map<string, any[]>();
    
    salesforceData.forEach((item: any) => {
      const date = new Date(item.CloseDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!dataByMonth.has(monthKey)) {
        dataByMonth.set(monthKey, []);
      }
      
      dataByMonth.get(monthKey)!.push(item);
    });

    // Calculate metrics for each month
    const processedData: SalesData[] = [];
    let previousMonthTotalARR = 0;

    Array.from(dataByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, deals], index) => {
        // Calculate average order value
        const totalValue = deals.reduce((sum: number, deal: any) => sum + (deal.Amount || 0), 0);
        const avgOrderValue = deals.length > 0 ? totalValue / deals.length : 0;
        
        // Calculate average modules per client
        const totalModules = deals.reduce((sum: number, deal: any) => sum + (deal.NumberOfModules || 0), 0);
        const avgModules = deals.length > 0 ? totalModules / deals.length : 0;
        
        // Calculate ARR growth
        const currentMonthTotalARR = totalValue * 12; // Assuming Amount is monthly value
        const arrGrowth = previousMonthTotalARR > 0 
          ? ((currentMonthTotalARR - previousMonthTotalARR) / previousMonthTotalARR) * 100
          : 0;
        
        previousMonthTotalARR = currentMonthTotalARR;
        
        processedData.push({
          date: month,
          averageOrderValue: avgOrderValue,
          averageModulesPerClient: avgModules,
          arrGrowth: arrGrowth
        });
      });

    return processedData;
  } catch (error) {
    console.error('Error processing sales data:', error);
    return [];
  }
}

/**
 * Process CSAT and support data from Support portal exports
 */
export async function processCSATData(supportPath: string): Promise<CSATData[]> {
  try {
    // Read the support data
    const supportData: any[] = await readExcelFile(supportPath);
    
    // Group by month
    const dataByMonth = new Map<string, any[]>();
    
    supportData.forEach(ticket => {
      const date = new Date(ticket.Created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!dataByMonth.has(monthKey)) {
        dataByMonth.set(monthKey, []);
      }
      
      dataByMonth.get(monthKey)!.push(ticket);
    });

    // Calculate metrics for each month
    const processedData: CSATData[] = [];

    Array.from(dataByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([month, tickets]) => {
        // Calculate NPS score (assuming it's available in the data)
        const npsScores = tickets
          .filter((ticket: any) => ticket.NPS_score !== undefined && ticket.NPS_score !== null)
          .map((ticket: any) => ticket.NPS_score);
        
        const npsScore = npsScores.length > 0
          ? npsScores.reduce((sum: number, score: number) => sum + score, 0) / npsScores.length
          : 0;
        
        // Calculate churn percentage (if available in data)
        const churnCount = tickets.filter((ticket: any) => ticket.Type === 'Cancellation').length;
        const totalCustomers = 100; // This would need to come from another data source
        const churnPercentage = (churnCount / totalCustomers) * 100;
        
        // Count tickets by severity
        const ticketsBySeverity = {
          low: tickets.filter((ticket: any) => ticket.Priority?.toLowerCase() === 'low').length,
          medium: tickets.filter((ticket: any) => ticket.Priority?.toLowerCase() === 'medium').length,
          high: tickets.filter((ticket: any) => ticket.Priority?.toLowerCase() === 'high').length,
          urgent: tickets.filter((ticket: any) => ticket.Priority?.toLowerCase() === 'urgent').length,
        };
        
        // Count tickets by topic
        const topicsMap: { [key: string]: number } = {};
        tickets.forEach((ticket: any) => {
          const topic = ticket.Topic || 'Other';
          topicsMap[topic] = (topicsMap[topic] || 0) + 1;
        });
        
        processedData.push({
          date: month,
          npsScore: npsScore,
          churnPercentage: churnPercentage,
          supportTicketsBySeverity: ticketsBySeverity,
          supportTopics: topicsMap,
        });
      });

    return processedData;
  } catch (error) {
    console.error('Error processing CSAT data:', error);
    return [];
  }
}

/**
 * Filter data by date range
 */
export function filterDataByDateRange<T extends { date: string }>(
  data: T[],
  range: 'month' | 'quarter' | 'half-year' | 'year'
): T[] {
  const now = new Date();
  let startDate: Date;
  
  switch (range) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case 'half-year':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  }

  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= now;
  });
}
