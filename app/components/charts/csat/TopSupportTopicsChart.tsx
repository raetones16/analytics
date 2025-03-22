"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartProps, prepareTopicsData } from './types';

const TopSupportTopicsChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  // Get the latest data point for the chart
  const latestData = data[data.length - 1];
  const topicsData = prepareTopicsData(latestData);
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Top Support Topics</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topicsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="topic" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" name="Tickets" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopSupportTopicsChart;
