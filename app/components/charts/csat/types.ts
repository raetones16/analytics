// Common types used by CSAT chart components

export interface CSATData {
  date: string;
  npsScore: number;
  churnPercentage: number;
  totalTickets: number;
  supportTicketsBySeverity: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  supportTopics: {
    [key: string]: number;
  };
  ticketTypes: {
    [key: string]: number;
  };
  ticketsByGroup?: {
    [key: string]: number;
  };
  _synthetic?: {
    nps?: boolean;
    churn?: boolean;
    tickets?: boolean;
  } | boolean;
}

export interface ChartProps {
  data: CSATData[];
  visualizationType?: string;
}

export interface SummaryProps {
  data: CSATData;
}

// Visualization type definitions
export type HelpTopicsVisualizationType = 'horizontalBar' | 'pie' | 'treemap';
export type ImpactLevelVisualizationType = 'bar' | 'pie' | 'donut';
export type TicketTypesVisualizationType = 'horizontalBar' | 'pie' | 'donut';
export type MonthlyTicketsVisualizationType = 'line' | 'bar' | 'area';

import { COLORS_MAPPED } from '../../../utils/theme';

// Colors for charts - uses theme colors
export const COLORS = COLORS_MAPPED;

// Prepare data for the tickets by severity pie chart
export const prepareSeverityData = (latestData: CSATData | null) => {
  if (!latestData) return [];
  
  return [
    { name: 'Low', value: latestData.supportTicketsBySeverity.low },
    { name: 'Medium', value: latestData.supportTicketsBySeverity.medium },
    { name: 'High', value: latestData.supportTicketsBySeverity.high },
    { name: 'Urgent', value: latestData.supportTicketsBySeverity.urgent }
  ];
};

// Prepare data for the support topics chart
export const prepareTopicsData = (latestData: CSATData | null) => {
  if (!latestData) return [];
  
  return Object.entries(latestData.supportTopics)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};
