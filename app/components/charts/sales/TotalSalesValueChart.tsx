import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, categoryColors, formatLargeNumber } from './types';
import { currencyFormatter } from './tooltips';

const TotalSalesValueChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Total Monthly Sales Value</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
          <Tooltip formatter={currencyFormatter} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="newDirectSalesValue" 
            name="New Direct" 
            stroke={categoryColors.newDirect}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="newPartnerSalesValue" 
            name="New Partner" 
            stroke={categoryColors.newPartner}
          />
          <Line 
            type="monotone" 
            dataKey="existingClientUpsellValue" 
            name="Existing Client" 
            stroke={categoryColors.existingClient}
          />
          <Line 
            type="monotone" 
            dataKey="existingPartnerClientValue" 
            name="Existing Partner" 
            stroke={categoryColors.existingPartner}
          />
          <Line 
            type="monotone" 
            dataKey="selfServiceValue" 
            name="Self-Service" 
            stroke={categoryColors.selfService}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalSalesValueChart;
