import React from 'react';
import { formatCurrency } from './types';

// Custom tooltip component for Sales by Category chart
export const CustomSalesTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Calculate total of all values
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="text-sm font-medium">{label}</p>
        <div className="border-t border-gray-200 my-1"></div>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
        <div className="border-t border-gray-200 my-1"></div>
        <p className="text-sm font-bold">
          {`Total: ${formatCurrency(total)}`}
        </p>
      </div>
    );
  }
  return null;
};

// Custom tooltip component for Average Order Value chart
export const CustomAvgTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Calculate average of non-zero values
    const nonZeroValues = payload.filter((entry: any) => entry.value > 0);
    const avgValue = nonZeroValues.length 
      ? nonZeroValues.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0) / nonZeroValues.length
      : 0;
    
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="text-sm font-medium">{label}</p>
        <div className="border-t border-gray-200 my-1"></div>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
        <div className="border-t border-gray-200 my-1"></div>
        <p className="text-sm font-bold">
          {`Overall Average: ${formatCurrency(avgValue)}`}
        </p>
      </div>
    );
  }
  return null;
};

// Generic tooltip formatter for currency values
export const currencyFormatter = (value: any) => formatCurrency(Number(value));

// Generic tooltip formatter for percentage values
export const percentageFormatter = (value: any) => `${Number(value).toFixed(1)}%`;
