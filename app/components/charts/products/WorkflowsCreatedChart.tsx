import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { ChartProps, appColors, formatLargeNumber, tooltipFormatter } from './types';

interface WorkflowsCreatedChartProps extends ChartProps {
  visualizationType?: 'line' | 'bar' | 'area';
}

const WorkflowsCreatedChart: React.FC<WorkflowsCreatedChartProps> = ({ data, visualizationType = 'bar' }) => {
  if (data.length === 0) return null;
  
  const renderChart = () => {
    const commonProps = {
      data,
      width: '100%',
      height: 300
    };

    const commonAxisProps = (
      <>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="displayDate" />
        <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
        <Tooltip 
          labelFormatter={(value) => `Date: ${value}`}
          formatter={tooltipFormatter}
        />
        <Legend />
      </>
    );
    
    switch (visualizationType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {commonAxisProps}
            <Bar dataKey="workflowsCreated" name="Workflows" fill={appColors.web} />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart {...commonProps}>
            {commonAxisProps}
            <Line 
              type="monotone" 
              dataKey="workflowsCreated" 
              name="Workflows" 
              stroke={appColors.web} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {commonAxisProps}
            <Area 
              type="monotone" 
              dataKey="workflowsCreated" 
              name="Workflows" 
              stroke={appColors.web} 
              fill={appColors.web} 
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      
      default:
        return (
          <BarChart {...commonProps}>
            {commonAxisProps}
            <Bar dataKey="workflowsCreated" name="Workflows" fill={appColors.web} />
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

export default WorkflowsCreatedChart;
