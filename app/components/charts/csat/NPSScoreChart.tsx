"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps } from './types';

const NPSScoreChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">NPS Score Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="npsScore" 
            name="NPS Score" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NPSScoreChart;
