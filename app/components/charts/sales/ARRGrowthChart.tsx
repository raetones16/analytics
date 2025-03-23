import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar
} from 'recharts';
import { ChartProps, formatPercentage } from './types';
import { CustomPercentageTooltip } from './tooltips';

interface ARRGrowthChartProps extends ChartProps {
  visualizationType?: 'line' | 'bar' | 'area';
}

const ARRGrowthChart: React.FC<ARRGrowthChartProps> = ({ data, visualizationType = 'line' }) => {
  if (data.length === 0) return null;
  
  // Common chart properties
  const commonProps = {
    data,
    height: 300
  };
  
  const commonAxisProps = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="displayDate" />
      <YAxis tickFormatter={(value) => formatPercentage(value)} />
      <Tooltip content={<CustomPercentageTooltip />} />
      <Legend />
    </>
  );
  
  // Render area chart
  if (visualizationType === 'area') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart {...commonProps}>
          {commonAxisProps}
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
    );
  }
  
  // Render line chart
  if (visualizationType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart {...commonProps}>
          {commonAxisProps}
          <Line 
            type="monotone" 
            dataKey="arrGrowth" 
            name="ARR Growth" 
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="arrGrowthSmoothed" 
            name="ARR Growth (3-month avg)" 
            stroke="#82ca9d"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  
  // Render bar chart
  if (visualizationType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart {...commonProps}>
          {commonAxisProps}
          <Bar 
            dataKey="arrGrowth" 
            name="ARR Growth" 
            fill="#8884d8"
          />
          <Bar 
            dataKey="arrGrowthSmoothed" 
            name="ARR Growth (3-month avg)" 
            fill="#82ca9d"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  
  // Default fallback
  return <div>Unsupported visualization type</div>;
};

export default ARRGrowthChart;
