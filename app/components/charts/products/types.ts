// Common types used by product chart components

export interface ProductUsageData {
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

export interface ChartProps {
  data: ProductUsageData[];
}

// Import colors from the global theme system
import { appColorsMapped } from '../../../utils/theme';

// Re-export the app colors for consistency
export const appColors = appColorsMapped;

// Format large numbers with K/M abbreviations
export const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

// Custom tooltip formatter to show numbers with commas
export const numberFormatter = (value: number): string => {
  return value.toLocaleString();
};

// Custom tooltip formatter for recharts
export const tooltipFormatter = (value: any, name: string): [string, string] => {
  if (typeof value === 'number') {
    return [numberFormatter(value), name];
  }
  return [String(value), name];
};
