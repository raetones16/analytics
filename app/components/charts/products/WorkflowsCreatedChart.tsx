import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, appColors, formatLargeNumber, tooltipFormatter } from './types';

const WorkflowsCreatedChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Workflows Created</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" />
          <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
          <Tooltip 
            labelFormatter={(value) => `Date: ${value}`}
            formatter={tooltipFormatter}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="workflowsCreated" 
            name="Workflows" 
            stroke={appColors.web} 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkflowsCreatedChart;
