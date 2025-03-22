import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, formatPercentage } from './types';
import { percentageFormatter } from './tooltips';

const ARRGrowthChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Month-on-Month ARR Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatPercentage(value)} />
          <Tooltip formatter={percentageFormatter} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="arrGrowth" 
            name="ARR Growth" 
            fill="#8884d8" 
            stroke="#8884d8"
            fillOpacity={0.3}
          />
          <Area 
            type="monotone" 
            dataKey="arrGrowthSmoothed" 
            name="ARR Growth (3-month avg)" 
            fill="#82ca9d" 
            stroke="#82ca9d"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ARRGrowthChart;
