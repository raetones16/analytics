// Layout storage utility functions

// Keys for storing layout preferences
export const PRODUCT_CHARTS_LAYOUT_KEY = 'analytics_product_charts_layout';
export const SALES_CHARTS_LAYOUT_KEY = 'analytics_sales_charts_layout';
export const CSAT_CHARTS_LAYOUT_KEY = 'analytics_csat_charts_layout';

// Type definitions for layout configuration
export interface ChartLayoutItem {
  id: string;
  width: 'half' | 'full';
  position: number;
}

export type ChartLayoutConfig = ChartLayoutItem[];

// Save layout to localStorage
export function saveLayoutConfig(key: string, layout: ChartLayoutConfig): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(layout));
      console.log(`Layout saved for ${key}:`, layout);
    }
  } catch (error) {
    console.error(`Failed to save layout for ${key}:`, error);
  }
}

// Load layout from localStorage
export function loadLayoutConfig(key: string): ChartLayoutConfig | null {
  try {
    if (typeof window !== 'undefined') {
      const storedLayout = localStorage.getItem(key);
      if (storedLayout) {
        return JSON.parse(storedLayout) as ChartLayoutConfig;
      }
    }
  } catch (error) {
    console.error(`Failed to load layout for ${key}:`, error);
  }
  return null;
}

// Reset layout to default
export function resetLayoutConfig(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
      console.log(`Layout reset for ${key}`);
    }
  } catch (error) {
    console.error(`Failed to reset layout for ${key}:`, error);
  }
}

// Get product charts default layout
export function getDefaultProductChartsLayout(): ChartLayoutConfig {
  return [
    { id: "userLogins", width: "half", position: 0 },
    { id: "absencesBooked", width: "half", position: 1 },
    { id: "timesheetsSubmitted", width: "half", position: 2 },
    { id: "workflowsCreated", width: "half", position: 3 }
  ];
}

// Get sales charts default layout
export function getDefaultSalesChartsLayout(): ChartLayoutConfig {
  return [
    { id: "salesByCategory", width: "half", position: 0 },
    { id: "averageOrderValue", width: "half", position: 1 },
    { id: "arrGrowth", width: "half", position: 2 },
    { id: "licenseTypes", width: "half", position: 3 },
    { id: "salesCount", width: "half", position: 4 },
    { id: "totalSalesValue", width: "half", position: 5 }
  ];
}

// Get CSAT charts default layout
export function getDefaultCSATChartsLayout(): ChartLayoutConfig {
  return [
    { id: "monthlyTickets", width: "full", position: 0 },
    { id: "helpTopics", width: "half", position: 1 },
    { id: "impactLevel", width: "half", position: 2 },
    { id: "ticketTypes", width: "full", position: 3 }
  ];
}
