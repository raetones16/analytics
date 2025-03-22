import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, categoryColors, formatLargeNumber } from './types';
import { CustomAvgTooltip } from './tooltips';

const AverageOrderValueChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  // Calculate average values for each category if not already present
  const enhancedData = data.map(item => {
    const newData = { ...item };
    
    // Only calculate if not already present
    if (newData.newDirectAvg === undefined) {
      newData.newDirectAvg = newData.newDirectSalesCount && newData.newDirectSalesValue 
        ? newData.newDirectSalesValue / newData.newDirectSalesCount : 0;
    }
    
    if (newData.newPartnerAvg === undefined) {
      newData.newPartnerAvg = newData.newPartnerSalesCount && newData.newPartnerSalesValue 
        ? newData.newPartnerSalesValue / newData.newPartnerSalesCount : 0;
    }
    
    if (newData.existingClientAvg === undefined) {
      newData.existingClientAvg = newData.existingClientUpsellCount && newData.existingClientUpsellValue 
        ? newData.existingClientUpsellValue / newData.existingClientUpsellCount : 0;
    }
    
    if (newData.existingPartnerAvg === undefined) {
      newData.existingPartnerAvg = newData.existingPartnerClientCount && newData.existingPartnerClientValue 
        ? newData.existingPartnerClientValue / newData.existingPartnerClientCount : 0;
    }
    
    if (newData.selfServiceAvg === undefined) {
      newData.selfServiceAvg = newData.selfServiceCount && newData.selfServiceValue 
        ? newData.selfServiceValue / newData.selfServiceCount : 0;
    }
    
    return newData;
  });
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Average Order Value by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        {data.length === 1 ? (
          // If we have only one data point, still use multiple bars with consistent colors
          <BarChart data={[{
            date: enhancedData[0].date,
            newDirectAvg: enhancedData[0].newDirectAvg || 0,
            newPartnerAvg: enhancedData[0].newPartnerAvg || 0,
            existingClientAvg: enhancedData[0].existingClientAvg || 0,
            existingPartnerAvg: enhancedData[0].existingPartnerAvg || 0,
            selfServiceAvg: enhancedData[0].selfServiceAvg || 0
          }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomAvgTooltip />} />
            <Legend />
            <Bar dataKey="newDirectAvg" name="New Direct" fill={categoryColors.newDirect} />
            <Bar dataKey="newPartnerAvg" name="New Partner" fill={categoryColors.newPartner} />
            <Bar dataKey="existingClientAvg" name="Existing Client" fill={categoryColors.existingClient} />
            <Bar dataKey="existingPartnerAvg" name="Existing Partner" fill={categoryColors.existingPartner} />
            <Bar dataKey="selfServiceAvg" name="Self-Service" fill={categoryColors.selfService} />
          </BarChart>
        ) : (
          // If we have multiple data points, use a bar chart with consistent colors
          <BarChart data={enhancedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomAvgTooltip />} />
            <Legend />
            <Bar dataKey="newDirectAvg" name="New Direct" fill={categoryColors.newDirect} />
            <Bar dataKey="newPartnerAvg" name="New Partner" fill={categoryColors.newPartner} />
            <Bar dataKey="existingClientAvg" name="Existing Client" fill={categoryColors.existingClient} />
            <Bar dataKey="existingPartnerAvg" name="Existing Partner" fill={categoryColors.existingPartner} />
            <Bar dataKey="selfServiceAvg" name="Self-Service" fill={categoryColors.selfService} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default AverageOrderValueChart;
