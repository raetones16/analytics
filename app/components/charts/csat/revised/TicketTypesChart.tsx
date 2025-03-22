"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartProps } from '../types';

export function TicketTypesChart({ data }: ChartProps) {
  // Get the latest data point
  const latestData = data.length > 0 
    ? data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
  
  if (!latestData) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-3">Tickets by Type</h3>
        <p>No data available</p>
      </div>
    );
  }
  
  // Prepare data for the chart - sort by count descending
  const chartData = Object.entries(latestData.ticketTypes)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Tickets by Type</h3>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            dataKey="type" 
            type="category" 
            width={95}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
          <Legend />
          <Bar dataKey="count" name="Tickets" fill="#FFBB28" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
