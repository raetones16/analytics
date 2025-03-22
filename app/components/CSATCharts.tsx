import React from 'react';
import { SyntheticDataIndicator } from './SyntheticDataIndicator';
import {
  SummaryStats,
  NPSScoreChart,
  TicketsBySeverityChart,
  TopSupportTopicsChart,
  ChurnRateChart,
  CSATData
} from './charts/csat';

interface CSATChartsProps {
  data: CSATData[];
}

export function CSATCharts({ data }: CSATChartsProps) {
  // Check for synthetic data flags - only triggered if the flags exist
  const hasSyntheticNPS = data.some(item => 
    (typeof item._synthetic === 'boolean' && item._synthetic) || 
    (item._synthetic && item._synthetic.nps)
  );
  
  const hasSyntheticChurn = data.some(item => 
    (typeof item._synthetic === 'boolean' && item._synthetic) || 
    (item._synthetic && item._synthetic.churn)
  );
  
  const hasSyntheticTickets = data.some(item => 
    (typeof item._synthetic === 'boolean' && item._synthetic) || 
    (item._synthetic && item._synthetic.tickets)
  );
  
  // Determine which metrics are synthetic
  const syntheticMetrics = [];
  if (hasSyntheticNPS) syntheticMetrics.push('NPS Score');
  if (hasSyntheticChurn) syntheticMetrics.push('Churn Rate');
  if (hasSyntheticTickets) syntheticMetrics.push('Support Tickets');
  
  // Create detailed message
  const syntheticDetails = syntheticMetrics.length > 0 
    ? `Synthetic data used for: ${syntheticMetrics.join(', ')}` 
    : '';
  
  // Get the latest data point for the summary stats
  const latestData = data.length > 0 ? data[data.length - 1] : null;
  
  // If we have no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">CSAT & Support Statistics</h2>
        <p>No CSAT data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-2">CSAT & Support Statistics</h2>
      
      <SyntheticDataIndicator 
        isVisible={syntheticMetrics.length > 0}
        dataName="CSAT data"
        details={syntheticDetails}
        type={syntheticMetrics.length === 3 ? 'full' : 'partial'}
      />
      
      {/* Summary Stats */}
      {latestData && <SummaryStats data={latestData} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NPS Score Chart */}
        <div>
          <NPSScoreChart data={data} />
        </div>
        
        {/* Tickets by Severity Pie Chart */}
        <div>
          <TicketsBySeverityChart data={data} />
        </div>
        
        {/* Main Support Topics */}
        <div>
          <TopSupportTopicsChart data={data} />
        </div>
        
        {/* Churn Rate Trend */}
        <div>
          <ChurnRateChart data={data} />
        </div>
      </div>
    </div>
  );
}
