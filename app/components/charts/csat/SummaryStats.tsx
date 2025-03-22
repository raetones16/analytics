"use client";

import React from 'react';
import { SummaryProps } from './types';

const SummaryStats: React.FC<SummaryProps> = ({ data }) => {
  if (!data) return null;
  
  // Get total tickets directly from the data
  const totalTickets = data.totalTickets;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800">NPS Score</h3>
        <p className="text-2xl font-bold text-blue-900">{data.npsScore.toFixed(1)}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-red-800">Churn Rate</h3>
        <p className="text-2xl font-bold text-red-900">{data.churnPercentage.toFixed(1)}%</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-green-800">Total Tickets</h3>
        <p className="text-2xl font-bold text-green-900">{totalTickets}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800">Urgent Tickets</h3>
        <p className="text-2xl font-bold text-yellow-900">{data.supportTicketsBySeverity.urgent}</p>
      </div>
    </div>
  );
};

export default SummaryStats;
