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
import { chartPalette, chartColorSchemes } from '../../../../utils/theme';
import { formatDateForDisplay } from '../../../../utils/date-utils';

interface TicketTypesChartProps extends ChartProps {
  visualizationType?: 'horizontalBar' | 'pie' | 'donut' | 'timeline';
}

export function TicketTypesChart({ data, visualizationType = 'horizontalBar' }: TicketTypesChartProps) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }
  
  // If visualization is timeline, show the trend over time
  if (visualizationType === 'timeline') {
    // Sort data chronologically
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Get unique ticket types across all data points
    const allTicketTypes = new Set<string>();
    sortedData.forEach(dataPoint => {
      Object.keys(dataPoint.ticketTypes || {}).forEach(type => allTicketTypes.add(type));
    });
    
    // Format data for timeline visualization
    const timelineData = sortedData.map(item => {
      const entry: any = {
        date: formatDateForDisplay(new Date(item.date))
      };
      
      // Add each ticket type as a property
      allTicketTypes.forEach(type => {
        entry[type] = item.ticketTypes[type] || 0;
      });
      
      return entry;
    });
    
    // Generate lines for each ticket type with consistent colors
    const ticketTypeArray = Array.from(allTicketTypes);
    const colors = chartColorSchemes.categorical;
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={timelineData}
          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
          <Legend />
          {ticketTypeArray.map((type, index) => (
            <Line 
              key={type}
              type="monotone" 
              dataKey={type} 
              name={type} 
              stroke={colors[index % colors.length]} 
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }
  
  // Aggregate ticket types across all time periods
  const aggregatedTypes: Record<string, number> = {};
  
  // Process each data point
  data.forEach(dataPoint => {
    const types = dataPoint.ticketTypes || {};
    
    // Add each type count to the aggregated totals
    Object.entries(types).forEach(([type, count]) => {
      if (typeof count === 'number') {
        aggregatedTypes[type] = (aggregatedTypes[type] || 0) + count;
      }
    });
  });
  
  // Convert to array format for charts
  const chartData = Object.entries(aggregatedTypes)
    .map(([type, count]) => ({ type, count, value: count, name: type }))
    .sort((a, b) => b.count - a.count);
  
  // Colors for pie chart
  const COLORS = chartColorSchemes.categorical;

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
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
          <Legend />
          <Bar dataKey="count" name="Tickets" fill={chartPalette.color2} />
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
            dataKey="count"
            nameKey="type"
            label={({ type, count, percent }) => `${type}: ${count} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
