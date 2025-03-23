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

interface TimesheetsSubmittedChartProps extends ChartProps {
  visualizationType?: 'bar' | 'line' | 'stacked';
}

const TimesheetsSubmittedChart: React.FC<TimesheetsSubmittedChartProps> = ({ data, visualizationType = 'line' }) => {
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
            <Bar dataKey="webTimesheetsSubmitted" name="Web App" fill={appColors.web} />
            <Bar dataKey="mobileTimesheetsSubmitted" name="Mobile App" fill={appColors.mobile} />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            {commonAxisProps}
            <Line type="monotone" dataKey="webTimesheetsSubmitted" name="Web App" stroke={appColors.web} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="mobileTimesheetsSubmitted" name="Mobile App" stroke={appColors.mobile} activeDot={{ r: 8 }} />
          </LineChart>
        );
      
      case 'stacked':
        return (
          <BarChart {...commonProps}>
            {commonAxisProps}
            <Bar dataKey="webTimesheetsSubmitted" name="Web App" stackId="a" fill={appColors.web} />
            <Bar dataKey="mobileTimesheetsSubmitted" name="Mobile App" stackId="a" fill={appColors.mobile} />
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            {commonAxisProps}
            <Line type="monotone" dataKey="webTimesheetsSubmitted" name="Web App" stroke={appColors.web} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="mobileTimesheetsSubmitted" name="Mobile App" stroke={appColors.mobile} activeDot={{ r: 8 }} />
          </LineChart>
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

export default TimesheetsSubmittedChart;
