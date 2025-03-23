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
import { StandardTooltip, numberFormatter } from '../../tooltips';

interface ImpactLevelChartProps extends ChartProps {
  visualizationType?: 'bar' | 'pie' | 'donut';
}

export function ImpactLevelChart({ data, visualizationType = 'pie' }: ImpactLevelChartProps) {
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
  
  // Prepare data for the chart with consistent order (from low to urgent)
  const chartData = [
    { name: 'Low', value: latestData.supportTicketsBySeverity.low, color: '#82ca9d' },
    { name: 'Medium', value: latestData.supportTicketsBySeverity.medium, color: '#8884d8' },
    { name: 'High', value: latestData.supportTicketsBySeverity.high, color: '#ffc658' },
    { name: 'Urgent', value: latestData.supportTicketsBySeverity.urgent, color: '#ff8042' }
  ];
  
  // Render bar chart
  if (visualizationType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
          <Legend />
          <Bar dataKey="value" name="Tickets">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
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
            dataKey="value"
            nameKey="name"
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
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
            dataKey="value"
            nameKey="name"
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Default fallback
  return <div>Unsupported visualization type</div>;
}
