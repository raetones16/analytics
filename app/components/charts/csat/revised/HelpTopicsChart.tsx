"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartProps } from '../types';

export function HelpTopicsChart({ data }: ChartProps) {
  // Get the latest data point for the chart
  const latestData = data.length > 0 
    ? data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
  
  if (!latestData) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-3">Tickets by Help Topic</h3>
        <p>No data available</p>
      </div>
    );
  }
  
  // Prepare data for the chart - sort by count descending and limit to top 10
  const chartData = Object.entries(latestData.supportTopics)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Limit to top 10 for better readability
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Tickets by Help Topic (Top 10)</h3>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            dataKey="topic" 
            type="category" 
            width={115}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
          <Legend />
          <Bar dataKey="count" name="Tickets" fill="#00C49F" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
