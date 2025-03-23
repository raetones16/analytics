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
    heading: 'text-rose-30',
    value: 'text-rose-20'
  },
  tickets: {
    heading: 'text-green-30',
    value: 'text-green-20'
  },
  urgent: {
    heading: 'text-orange-30',
    value: 'text-orange-20'
  }
};

const SummaryStats: React.FC<SummaryProps> = ({ data }) => {
  if (!data) return null;
  
  // Get total tickets directly from the data
  const totalTickets = data.totalTickets;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${bgColors.nps} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${textColors.nps.heading}`}>NPS Score</h3>
          <p className={`text-2xl font-bold ${textColors.nps.value}`}>{data.npsScore.toFixed(1)}</p>
        </div>
        <div className={`${bgColors.churn} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${textColors.churn.heading}`}>Churn Rate</h3>
          <p className={`text-2xl font-bold ${textColors.churn.value}`}>{data.churnPercentage.toFixed(1)}%</p>
        </div>
        <div className={`${bgColors.tickets} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${textColors.tickets.heading}`}>Total Tickets</h3>
          <p className={`text-2xl font-bold ${textColors.tickets.value}`}>{totalTickets}</p>
        </div>
        <div className={`${bgColors.urgent} p-4 rounded-lg`}>
          <h3 className={`text-sm font-medium ${textColors.urgent.heading}`}>Urgent Tickets</h3>
          <p className={`text-2xl font-bold ${textColors.urgent.value}`}>{data.supportTicketsBySeverity.urgent}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
