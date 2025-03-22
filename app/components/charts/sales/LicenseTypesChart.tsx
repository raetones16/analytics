import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, formatLargeNumber } from './types';

const LicenseTypesChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">License Types Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
          <Tooltip formatter={(value: any) => value.toLocaleString()} />
          <Legend />
          <Bar dataKey="userLicensesCount" name="User Licenses" fill="#8884d8" stackId="a" />
          <Bar dataKey="leaverLicensesCount" name="Leaver Licenses" fill="#82ca9d" stackId="a" />
          <Bar dataKey="timesheetLicensesCount" name="Timesheet Licenses" fill="#ffc658" stackId="a" />
          <Bar dataKey="directoryLicensesCount" name="Directory Licenses" fill="#ff8042" stackId="a" />
          <Bar dataKey="workflowLicensesCount" name="Workflow Licenses" fill="#e65100" stackId="a" />
          <Bar dataKey="otherLicensesCount" name="Other Licenses" fill="#9e9e9e" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LicenseTypesChart;
