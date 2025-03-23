"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartProps, COLORS } from './types';
import { chartColors } from '../../../utils/theme';

export function TicketsByGroupChart({ data }: ChartProps) {
  // Get the latest data point
  const latestData = data.length > 0 
    ? data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
  
  if (!latestData) {
    return (
      <div className="h-72">
        <h3 className="text-md font-medium mb-2">Tickets by Support Group</h3>
        <p>No data available</p>
      </div>
    );
  }
  
  // Prepare data for the chart - sort by count descending
  const chartData = latestData.ticketsByGroup
    ? Object.entries(latestData.ticketsByGroup)
      .map(([group, count]) => ({ name: group, value: count }))
      .sort((a, b) => b.value - a.value)
    : [];
  
  return (
    <div className="h-72">
      <h3 className="text-md font-medium mb-2">Tickets by Support Group</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
          <Legend />
          <Bar dataKey="value" fill={chartColors.primary} name="Tickets" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
