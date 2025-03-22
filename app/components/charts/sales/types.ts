// Common types used by sales chart components

export interface SalesData {
  date: string;
  // Channel__c based metrics
  newDirectSalesCount?: number;
  newDirectSalesValue?: number;
  newPartnerSalesCount?: number;
  newPartnerSalesValue?: number;
  existingClientUpsellCount?: number;
  existingClientUpsellValue?: number;
  existingPartnerClientCount?: number;
  existingPartnerClientValue?: number;
  selfServiceCount?: number;
  selfServiceValue?: number;
  // License type metrics
  userLicensesCount?: number;
  leaverLicensesCount?: number;
  timesheetLicensesCount?: number;
  directoryLicensesCount?: number;
  workflowLicensesCount?: number;
  otherLicensesCount?: number;
  // Combined metrics
  totalSalesCount?: number;
  averageOrderValue: number;
  averageModulesPerClient: number;
  avgRevenuePerAccount?: number;
  arrGrowth: number;
  arrGrowthSmoothed?: number;
  arrValues?: number[];
  _synthetic?: {
    data?: boolean;
  };
  
  // Calculated fields added during chart processing
  newDirectAvg?: number;
  newPartnerAvg?: number;
  existingClientAvg?: number;
  existingPartnerAvg?: number; 
  selfServiceAvg?: number;
}

export interface ChartProps {
  data: SalesData[];
}

// Common category colors to ensure consistency across charts
export const categoryColors = {
  newDirect: "#8884d8",      // Purple
  newPartner: "#82ca9d",     // Green
  existingClient: "#ffc658", // Yellow
  existingPartner: "#8B008B", // Dark Purple
  selfService: "#ff8042"     // Orange
};

// Common formatting functions
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
