import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, appColors, formatLargeNumber, tooltipFormatter } from './types';

const UserLoginsChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">User Logins</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" />
          <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
          <Tooltip 
            labelFormatter={(value) => `Date: ${value}`}
            formatter={tooltipFormatter}
          />
          <Legend />
          <Bar dataKey="webLogins" name="Web App" fill={appColors.web} />
          <Bar dataKey="mobileLogins" name="Mobile App" fill={appColors.mobile} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserLoginsChart;
