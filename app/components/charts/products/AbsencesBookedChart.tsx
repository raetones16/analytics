import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { ChartProps, appColors, formatLargeNumber } from './types';
import { StandardTooltip, numberFormatter } from '../tooltips';

interface AbsencesBookedChartProps extends ChartProps {
  visualizationType?: 'bar' | 'line' | 'stacked';
}

const AbsencesBookedChart: React.FC<AbsencesBookedChartProps> = ({ data, visualizationType = 'bar' }) => {
  if (data.length === 0) return null;
  
  const renderChart = () => {
    const commonProps = {
      data,
      height: 300
    };

    const commonAxisProps = (
      <>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="displayDate" />
        <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
        <Tooltip content={<StandardTooltip formatter={numberFormatter} />} />
        <Legend />
      </>
    );
    
    switch (visualizationType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {commonAxisProps}
            <Bar dataKey="webAbsencesBooked" name="Web App" fill={appColors.web} />
            <Bar dataKey="mobileAbsencesBooked" name="Mobile App" fill={appColors.mobile} />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            {commonAxisProps}
            <Line type="monotone" dataKey="webAbsencesBooked" name="Web App" stroke={appColors.web} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="mobileAbsencesBooked" name="Mobile App" stroke={appColors.mobile} activeDot={{ r: 8 }} />
          </LineChart>
        );
      
      case 'stacked':
        return (
          <BarChart {...commonProps}>
            {commonAxisProps}
            <Bar dataKey="webAbsencesBooked" name="Web App" stackId="a" fill={appColors.web} />
            <Bar dataKey="mobileAbsencesBooked" name="Mobile App" stackId="a" fill={appColors.mobile} />
          </BarChart>
        );
      
      default:
        return (
          <BarChart {...commonProps}>
            {commonAxisProps}
            <Bar dataKey="webAbsencesBooked" name="Web App" fill={appColors.web} />
            <Bar dataKey="mobileAbsencesBooked" name="Mobile App" fill={appColors.mobile} />
          </BarChart>
        );
    }
  };
  
  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default AbsencesBookedChart;
