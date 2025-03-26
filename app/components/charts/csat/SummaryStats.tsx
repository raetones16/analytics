"use client";

import React from 'react';
import { SummaryProps } from './types';
import { getTailwindColor } from '../../../utils/theme';

// Get colors directly from our theme system for consistency
const bgColors = {
  nps: 'bg-blue-90',      // Blue L85
  churn: 'bg-rose-90',     // Rose L85
  tickets: 'bg-green-90',  // Green L85
  urgent: 'bg-orange-90'   // Orange L85
};

const textColors = {
  nps: {
    heading: 'text-blue-30',
    value: 'text-blue-20'
  },
  churn: {
    heading: 'text-rose-60',
    value: 'text-rose-30'
  },
  tickets: {
    heading: 'text-green-30',
    value: 'text-green-20'
  },
  urgent: {
    heading: 'text-orange-70',
    value: 'text-orange-40'
  }
};

interface SummaryStatsProps {
  data: any[];  // Array of CSAT data points for the selected period
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  // Calculate aggregated metrics for the entire period
  const totalTickets = data.reduce((sum, item) => sum + item.totalTickets, 0);
  
  // Calculate total urgent tickets
  const totalUrgentTickets = data.reduce(
    (sum, item) => sum + (item.supportTicketsBySeverity.urgent || 0), 
    0
  );
  
  // Calculate average NPS score (weighted by ticket count to be more accurate)
  const weightedNpsSum = data.reduce(
    (sum, item) => sum + (item.npsScore * item.totalTickets), 
    0
  );
  const averageNps = weightedNpsSum / totalTickets;
  
  // Calculate average churn percentage
  const averageChurn = data.reduce(
    (sum, item) => sum + item.churnPercentage, 
    0
  ) / data.length;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${bgColors.nps} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${textColors.nps.heading}`}>Average NPS</h3>
          <p className={`text-2xl font-bold ${textColors.nps.value}`}>{averageNps.toFixed(1)}</p>
        </div>
        <div className={`${bgColors.churn} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${textColors.churn.heading}`}>Avg Churn Rate</h3>
          <p className={`text-2xl font-bold ${textColors.churn.value}`}>{averageChurn.toFixed(1)}%</p>
        </div>
        <div className={`${bgColors.tickets} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${textColors.tickets.heading}`}>Total Tickets</h3>
          <p className={`text-2xl font-bold ${textColors.tickets.value}`}>{totalTickets}</p>
        </div>
        <div className={`${bgColors.urgent} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${textColors.urgent.heading}`}>Urgent Tickets</h3>
          <p className={`text-2xl font-bold ${textColors.urgent.value}`}>{totalUrgentTickets}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
