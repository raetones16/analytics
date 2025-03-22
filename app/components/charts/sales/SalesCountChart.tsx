import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, categoryColors } from './types';

const SalesCountChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Sales Count by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="newDirectSalesCount" name="New Direct" fill={categoryColors.newDirect} stackId="a" />
          <Bar dataKey="newPartnerSalesCount" name="New Partner" fill={categoryColors.newPartner} stackId="a" />
          <Bar dataKey="existingClientUpsellCount" name="Existing Client" fill={categoryColors.existingClient} stackId="a" />
          <Bar dataKey="existingPartnerClientCount" name="Existing Partner" fill={categoryColors.existingPartner} stackId="a" />
          <Bar dataKey="selfServiceCount" name="Self-Service" fill={categoryColors.selfService} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesCountChart;
