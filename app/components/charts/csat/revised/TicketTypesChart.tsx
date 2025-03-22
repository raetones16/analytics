"use client";

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartProps } from '../types';

interface TicketTypesChartProps extends ChartProps {
  visualizationType?: 'horizontalBar' | 'pie' | 'donut';
}

export function TicketTypesChart({ data, visualizationType = 'horizontalBar' }: TicketTypesChartProps) {
  // Get the latest data point
  const latestData = data.length > 0 
    ? data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
  
  if (!latestData) {
    return (
      <div>
        <p>No data available</p>
      </div>
    );
  }
  
  // Prepare data for the chart - sort by count descending
  const chartData = Object.entries(latestData.ticketTypes)
    .map(([type, count]) => ({ type, count, value: count, name: type }))
    .sort((a, b) => b.count - a.count);
  
  // Colors for pie chart
  const COLORS = [
    '#FFBB28', '#FF8042', '#0088FE', '#00C49F', '#8884d8', 
    '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'
  ];

  // Render horizontal bar chart
  if (visualizationType === 'horizontalBar') {
    return (
      <ResponsiveContainer width="100%" height={400}>
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
    );
  }

  // Render pie chart
  if (visualizationType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={150}
            fill="#8884d8"
            dataKey="count"
            nameKey="type"
            label={({ type, count, percent }) => `${type}: ${count} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Render donut chart
  if (visualizationType === 'donut') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={150}
            fill="#8884d8"
            dataKey="count"
            nameKey="type"
            label={({ type, count, percent }) => `${type}: ${count} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Default fallback
  return <div>Unsupported visualization type</div>;
}
