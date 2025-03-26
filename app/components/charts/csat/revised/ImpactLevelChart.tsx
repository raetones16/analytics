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
  Cell,
  LineChart,
  Line
} from 'recharts';
import { ChartProps } from '../types';
import { StandardTooltip, numberFormatter } from '../../tooltips';
import { severityColorsMapped, chartPalette } from '../../../../utils/theme';
import { formatDateForDisplay } from '../../../../utils/date-utils';

interface ImpactLevelChartProps extends ChartProps {
  visualizationType?: 'bar' | 'pie' | 'donut' | 'timeline';
}

export function ImpactLevelChart({ data, visualizationType = 'timeline' }: ImpactLevelChartProps) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }
  
  // If visualization is timeline, we need a different approach
  if (visualizationType === 'timeline') {
    // Sort data chronologically
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Format data for timeline visualization
    const timelineData = sortedData.map(item => ({
      date: formatDateForDisplay(new Date(item.date)),
      low: item.supportTicketsBySeverity.low,
      medium: item.supportTicketsBySeverity.medium,
      high: item.supportTicketsBySeverity.high,
      urgent: item.supportTicketsBySeverity.urgent,
      // Add total as well
      total: item.totalTickets
    }));
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={timelineData}
          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
          <Legend />
          <Bar dataKey="low" name="Low" stackId="severity" fill={severityColorsMapped.low} />
          <Bar dataKey="medium" name="Medium" stackId="severity" fill={severityColorsMapped.medium} />
          <Bar dataKey="high" name="High" stackId="severity" fill={severityColorsMapped.high} />
          <Bar dataKey="urgent" name="Urgent" stackId="severity" fill={severityColorsMapped.urgent} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Aggregate severity levels across all time periods
  const totalLow = data.reduce((sum, item) => sum + item.supportTicketsBySeverity.low, 0);
  const totalMedium = data.reduce((sum, item) => sum + item.supportTicketsBySeverity.medium, 0);
  const totalHigh = data.reduce((sum, item) => sum + item.supportTicketsBySeverity.high, 0);
  const totalUrgent = data.reduce((sum, item) => sum + item.supportTicketsBySeverity.urgent, 0);
  
  // Prepare aggregated data for charts
  const chartData = [
    { name: 'Low', value: totalLow, color: severityColorsMapped.low },
    { name: 'Medium', value: totalMedium, color: severityColorsMapped.medium },
    { name: 'High', value: totalHigh, color: severityColorsMapped.high },
    { name: 'Urgent', value: totalUrgent, color: severityColorsMapped.urgent }
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
