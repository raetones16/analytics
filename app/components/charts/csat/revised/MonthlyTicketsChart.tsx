"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartProps } from '../types';
import { formatDateForDisplay } from '../../../../utils/date-utils';

export function MonthlyTicketsChart({ data }: ChartProps) {
  // Format data for the chart
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      month: formatDateForDisplay(new Date(item.date)),
      tickets: item.totalTickets
    }));

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Monthly Support Tickets</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45} 
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} tickets`, 'Total']} />
          <Bar dataKey="tickets" fill="#8884d8" name="Total Tickets" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
