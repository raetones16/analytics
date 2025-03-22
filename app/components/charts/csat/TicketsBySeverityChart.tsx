"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, COLORS, prepareSeverityData } from './types';

const TicketsBySeverityChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  // Get the latest data point for the pie chart
  const latestData = data[data.length - 1];
  const severityData = prepareSeverityData(latestData);
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Tickets by Severity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={severityData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {severityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => Number(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketsBySeverityChart;
