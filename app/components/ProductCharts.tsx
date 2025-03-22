import React from 'react';
import { SyntheticDataIndicator } from './SyntheticDataIndicator';
import {
  UserLoginsChart,
  AbsencesBookedChart,
  TimesheetsSubmittedChart,
  WorkflowsCreatedChart,
  ProductUsageData
} from './charts/products';

interface ProductChartsProps {
  data: ProductUsageData[];
}

export function ProductCharts({ data }: ProductChartsProps) {
  // Check if any data points have synthetic flags
  const hasSyntheticData = data.some(item => item._synthetic?.data === true);
  const hasSyntheticDistribution = data.some(item => item._synthetic?.distribution === true);
  
  // Details for the indicator
  let syntheticDetails = '';
  let indicatorType: 'full' | 'partial' | 'distribution' = 'partial';
  
  if (hasSyntheticData) {
    syntheticDetails = 'Using generated values because no real data was available';
    indicatorType = 'full';
  } else if (hasSyntheticDistribution) {
    syntheticDetails = 'Using actual totals but time distribution is estimated';
    indicatorType = 'distribution';
  }
  
  // Count data points for the indicator
  const dataPoints = data.length;

  // If we have no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Product Usage</h2>
        <p>No product usage data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-2">Product Usage</h2>
      
      <SyntheticDataIndicator 
        isVisible={hasSyntheticData || hasSyntheticDistribution}
        dataName="product usage data"
        details={syntheticDetails}
        type={indicatorType}
        dataPoints={dataPoints}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Logins Chart */}
        <div>
          <UserLoginsChart data={data} />
        </div>
        
        {/* Absences Booked Chart */}
        <div>
          <AbsencesBookedChart data={data} />
        </div>
        
        {/* Timesheets Submitted Chart */}
        <div>
          <TimesheetsSubmittedChart data={data} />
        </div>
        
        {/* Workflows Created Chart */}
        <div>
          <WorkflowsCreatedChart data={data} />
        </div>
      </div>
    </div>
  );
}
