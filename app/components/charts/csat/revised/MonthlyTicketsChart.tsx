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
  Area
} from 'recharts';
import { ChartProps } from '../types';
import { formatDateForDisplay } from '../../../../utils/date-utils';
import { StandardTooltip, numberFormatter } from '../../tooltips';

interface MonthlyTicketsChartProps extends ChartProps {
  visualizationType?: 'line' | 'bar' | 'area';
}

export function MonthlyTicketsChart({ data, visualizationType = 'line' }: MonthlyTicketsChartProps) {
  // Format data for the chart
  const chartData = data
    .map(item => ({
      month: item.displayDate || formatDateForDisplay(new Date(item.date)),
      tickets: item.totalTickets
    }));

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
          <Line 
            type="monotone" 
            dataKey="tickets" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }}
            name="Total Tickets"
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
          <Bar dataKey="tickets" fill="#8884d8" name="Total Tickets" />
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
          <Area 
            type="monotone" 
            dataKey="tickets" 
            stroke="#8884d8" 
            fill="#8884d8" 
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
