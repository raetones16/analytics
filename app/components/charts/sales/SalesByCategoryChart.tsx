import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, categoryColors, formatLargeNumber } from './types';
import { CustomSalesTooltip } from './tooltips';

const SalesByCategoryChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Sales by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        {data.length === 1 ? (
          // If we have only one data point, still use multiple bars with consistent colors
          <BarChart data={[{
            date: data[0].date,
            newDirectSalesValue: data[0].newDirectSalesValue || 0,
            newPartnerSalesValue: data[0].newPartnerSalesValue || 0,
            existingClientUpsellValue: data[0].existingClientUpsellValue || 0,
            existingPartnerClientValue: data[0].existingPartnerClientValue || 0,
            selfServiceValue: data[0].selfServiceValue || 0
          }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomSalesTooltip />} />
            <Legend />
            <Bar dataKey="newDirectSalesValue" name="New Direct" fill={categoryColors.newDirect} />
            <Bar dataKey="newPartnerSalesValue" name="New Partner" fill={categoryColors.newPartner} />
            <Bar dataKey="existingClientUpsellValue" name="Existing Client" fill={categoryColors.existingClient} />
            <Bar dataKey="existingPartnerClientValue" name="Existing Partner" fill={categoryColors.existingPartner} />
            <Bar dataKey="selfServiceValue" name="Self-Service" fill={categoryColors.selfService} />
          </BarChart>
        ) : (
          // If we have multiple data points, use a stacked bar chart with consistent colors
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomSalesTooltip />} />
            <Legend />
            <Bar dataKey="newDirectSalesValue" name="New Direct" fill={categoryColors.newDirect} stackId="a" />
            <Bar dataKey="newPartnerSalesValue" name="New Partner" fill={categoryColors.newPartner} stackId="a" />
            <Bar dataKey="existingClientUpsellValue" name="Existing Client" fill={categoryColors.existingClient} stackId="a" />
            <Bar dataKey="existingPartnerClientValue" name="Existing Partner" fill={categoryColors.existingPartner} stackId="a" />
            <Bar dataKey="selfServiceValue" name="Self-Service" fill={categoryColors.selfService} stackId="a" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesByCategoryChart;
