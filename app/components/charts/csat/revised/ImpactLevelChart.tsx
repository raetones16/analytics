"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartProps } from '../types';

export function ImpactLevelChart({ data }: ChartProps) {
  // Get the latest data point
  const latestData = data.length > 0 
    ? data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
  
  if (!latestData) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-3">Tickets by Impact Level</h3>
        <p>No data available</p>
      </div>
    );
  }
  
  // Prepare data for the chart with consistent order (from low to urgent)
  const chartData = [
    { name: 'Low', value: latestData.supportTicketsBySeverity.low },
    { name: 'Medium', value: latestData.supportTicketsBySeverity.medium },
    { name: 'High', value: latestData.supportTicketsBySeverity.high },
    { name: 'Urgent', value: latestData.supportTicketsBySeverity.urgent }
  ];
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Tickets by Impact Level</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
          <Legend />
          <Bar dataKey="value" name="Tickets" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
