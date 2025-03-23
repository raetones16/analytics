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
  Treemap
} from 'recharts';
import { ChartProps } from '../types';
import { StandardTooltip, numberFormatter } from '../../tooltips';

interface HelpTopicsChartProps extends ChartProps {
  visualizationType?: 'horizontalBar' | 'pie' | 'treemap';
}

export function HelpTopicsChart({ data, visualizationType = 'horizontalBar' }: HelpTopicsChartProps) {
  // Get the latest data point for the chart
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
  
  // Prepare data for the chart - sort by count descending and limit to top 10
  const chartData = Object.entries(latestData.supportTopics)
    .map(([topic, count]) => ({ topic, count, value: count })) // Adding 'value' for Treemap
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Limit to top 10 for better readability
  
  // Colors for pie chart and treemap
  const COLORS = [
    '#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884d8', 
    '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'
  ];

  // Create a custom content component for the Treemap
  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, index } = props;
    // Only render if space is sufficient for readable text
    const isLabelVisible = width > 30 && height > 20;
    const item = chartData[index];
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        {isLabelVisible && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
              fontWeight="bold"
            >
              {item.topic}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 8}
              textAnchor="middle"
              fill="#fff"
              fontSize={10}
            >
              {item.count} tickets
            </text>
          </>
        )}
      </g>
    );
  };

  // Render horizontal bar chart
  if (visualizationType === 'horizontalBar') {
    return (
      <ResponsiveContainer width="100%" height={400}>
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
          <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
          <Legend />
          <Bar dataKey="count" name="Tickets" fill="#00C49F" />
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
            outerRadius={160}
            fill="#8884d8"
            dataKey="count"
            nameKey="topic"
            label={({ topic, count, percent }) => `${topic}: ${count} (${(percent * 100).toFixed(0)}%)`}
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

  // Render treemap
  if (visualizationType === 'treemap') {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={chartData}
          dataKey="value"
          nameKey="topic"
          aspectRatio={4/3}
          stroke="#fff"
          fill="#8884d8"
          content={<CustomTreemapContent />}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Treemap>
      </ResponsiveContainer>
    );
  }

  // Default fallback (should never happen due to default param)
  return <div>Unsupported visualization type</div>;
}
