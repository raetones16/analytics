"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartProps, COLORS } from './types';

export function TicketTypesPieChart({ data }: ChartProps) {
  // Get the latest data point
  const latestData = data.length > 0 
    ? data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
  
  if (!latestData) {
    return (
      <div className="h-72">
        <h3 className="text-md font-medium mb-2">Ticket Types</h3>
        <p>No data available</p>
      </div>
    );
  }
  
  // Prepare data for the pie chart
  const chartData = Object.entries(latestData.ticketTypes)
    .map(([type, count]) => ({ name: type, value: count }))
    .sort((a, b) => b.value - a.value);
  
  return (
    <div className="h-72">
      <h3 className="text-md font-medium mb-2">Ticket Types</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
