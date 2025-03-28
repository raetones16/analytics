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
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { ChartProps } from '../types';
import { formatDateForDisplay } from '../../../../utils/date-utils';
import { StandardTooltip, numberFormatter } from '../../tooltips';
import { chartPalette } from '../../../../utils/theme';

interface MonthlyTicketsChartProps extends ChartProps {
  visualizationType?: 'line' | 'bar' | 'area';
}

export function MonthlyTicketsChart({ data, visualizationType = 'line' }: MonthlyTicketsChartProps) {
  // Format data for the chart - sort by date, oldest to newest
  const chartData = data
    .map(item => ({
      date: new Date(item.date),  // Convert string date to Date object
      month: formatDateForDisplay(new Date(item.date)),
      tickets: item.totalTickets
    }))
    // Sort chronologically - oldest to newest
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    // Remove the date property before rendering
    .map(({ date, ...rest }) => rest);

  // Common chart properties
  const chartMargin = { top: 5, right: 30, left: 20, bottom: 25 };
  const chartHeight = 300;
  
  // Render line chart
  if (visualizationType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart
          data={chartData}
          margin={chartMargin}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45} 
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="tickets" 
            stroke={chartPalette.color1} 
            activeDot={{ r: 8 }}
            name="Total Tickets"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Render bar chart
  if (visualizationType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          margin={chartMargin}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45} 
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
          <Legend />
          <Bar dataKey="tickets" fill={chartPalette.color1} name="Total Tickets" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Render area chart
  if (visualizationType === 'area') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart
          data={chartData}
          margin={chartMargin}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            angle={-45} 
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="tickets" 
            stroke={chartPalette.color1} 
            fill={chartPalette.color1} 
            fillOpacity={0.3}
            name="Total Tickets"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Default fallback
  return <div>Unsupported visualization type</div>;
}
