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

interface UserLoginsChartProps extends ChartProps {
  visualizationType?: 'bar' | 'line' | 'area';
}

const UserLoginsChart: React.FC<UserLoginsChartProps> = ({ data, visualizationType = 'line' }) => {
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
            <Bar dataKey="webLogins" name="Web App" fill={appColors.web} />
            <Bar dataKey="mobileLogins" name="Mobile App" fill={appColors.mobile} />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            {commonAxisProps}
            <Line type="monotone" dataKey="webLogins" name="Web App" stroke={appColors.web} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="mobileLogins" name="Mobile App" stroke={appColors.mobile} activeDot={{ r: 8 }} />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {commonAxisProps}
            <Area type="monotone" dataKey="webLogins" name="Web App" stroke={appColors.web} fill={appColors.web} fillOpacity={0.3} />
            <Area type="monotone" dataKey="mobileLogins" name="Mobile App" stroke={appColors.mobile} fill={appColors.mobile} fillOpacity={0.3} />
          </AreaChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            {commonAxisProps}
            <Line type="monotone" dataKey="webLogins" name="Web App" stroke={appColors.web} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="mobileLogins" name="Mobile App" stroke={appColors.mobile} activeDot={{ r: 8 }} />
          </LineChart>
        );
    }
  };
  
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default UserLoginsChart;
