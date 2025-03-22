"use client";

import React from 'react';
import { SyntheticDataIndicator } from './SyntheticDataIndicator';
import { CSATData } from './charts/csat/types';
import { SummaryStats } from './charts/csat';
import {
  MonthlyTicketsChart,
  HelpTopicsChart,
  ImpactLevelChart,
  TicketTypesChart
} from './charts/csat/revised';

interface CSATChartsProps {
  data: CSATData[];
  dateRange: 'month' | 'quarter' | 'half-year' | 'year';
}

export function RevisedCSATCharts({ data, dateRange }: CSATChartsProps) {
  // Check for synthetic data flags
  const hasSyntheticTickets = data.some(item => 
    (typeof item._synthetic === 'boolean' && item._synthetic) || 
    (item._synthetic && item._synthetic.tickets)
  );
  
  // Create detailed message
  const syntheticDetails = hasSyntheticTickets 
    ? 'Using synthetic support ticket data for demonstration' 
    : '';
  
  // Get the latest data point for the summary stats
  const latestData = data.length > 0 ? data[data.length - 1] : null;
  
  // If we have no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Support Analytics</h2>
        <p>No support data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-2">Support Analytics</h2>
      
      <SyntheticDataIndicator 
        isVisible={hasSyntheticTickets}
        dataName="Support ticket data"
        details={syntheticDetails}
        type={'partial'}
      />
      
      {/* Summary Stats */}
      {latestData && <SummaryStats data={latestData} />}
      
      {/* Monthly Tickets Chart - Only show for date ranges longer than a month */}
      {dateRange !== 'month' && (
        <div className="mb-12">
          <MonthlyTicketsChart data={data} />
        </div>
      )}
      
      <div className="mb-12">
        {/* Help Topics Chart */}
        <HelpTopicsChart data={data} />
      </div>
      
      <div className="mb-12">
        {/* Impact Level Chart */}
        <ImpactLevelChart data={data} />
      </div>
      
      <div className="mb-12">
        {/* Ticket Types Chart */}
        <TicketTypesChart data={data} />
      </div>
    </div>
  );
}
