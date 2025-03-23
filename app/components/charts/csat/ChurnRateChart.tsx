"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps } from './types';
import { chartPalette, getTailwindColor } from '../../../utils/theme';

const ChurnRateChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Churn Rate Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 'dataMax + 2']} />
          <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="churnPercentage" 
            name="Churn Rate" 
            stroke={getTailwindColor('rose-60')} 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChurnRateChart;
