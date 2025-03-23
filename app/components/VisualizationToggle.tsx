'use client';

import React from 'react';
import { uiColors } from '../utils/theme';

export interface VisualizationOption {
  value: string;
  label: string;
}

interface VisualizationToggleProps {
  current: string;
  options: VisualizationOption[];
  onChange: (chartName: string, value: string) => void;
  chartName: string;
}

export function VisualizationToggle({ 
  current, 
  options, 
  onChange,
  chartName
}: VisualizationToggleProps) {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <span className="text-gray-500 text-sm">View as:</span>
      <div className="flex border rounded-md">
        {options.map(option => (
          <button
            key={option.value}
            className={`px-3 py-1 text-sm ${
              current === option.value 
                ? `${uiColors.primary.bgLight} ${uiColors.primary.text}` 
                : `${uiColors.default.text} hover:bg-gray-50`
            }`}
            onClick={() => onChange(chartName, option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
