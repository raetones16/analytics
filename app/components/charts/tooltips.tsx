import React from 'react';

// Standard tooltip component for consistency across all charts
export const StandardTooltip = ({ active, payload, label, formatter = (val: any) => val.toLocaleString() }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="text-sm font-medium">{label}</p>
        <div className="border-t border-gray-200 my-1"></div>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatter(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Formatter for displaying numbers with comma separators
export const numberFormatter = (value: any) => {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
};

// Formatter for displaying large numbers with K/M suffixes
export const largeNumberFormatter = (value: any) => {
  if (typeof value !== 'number') return String(value);
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

// Formatter for displaying percentages
export const percentageFormatter = (value: any) => {
  if (typeof value !== 'number') return String(value);
  return `${value.toFixed(1)}%`;
};

// Formatter for displaying currency
export const currencyFormatter = (value: any) => {
  if (typeof value !== 'number') return String(value);
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};