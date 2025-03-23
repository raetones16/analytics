"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartProps } from './types';
import { formatDateForDisplay } from '../../../utils/date-utils';
import { chartColors } from '../../../utils/theme';

export function MonthlyTicketsChart({ data }: ChartProps) {
  // Format data for the chart
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      name: formatDateForDisplay(new Date(item.date)),
      value: item.totalTickets
    }));

  return (
    <div className="h-72">
      <h3 className="text-md font-medium mb-2">Monthly Support Tickets</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} tickets`, 'Total']} />
          <Bar dataKey="value" fill={chartColors.primary} name="Tickets" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
