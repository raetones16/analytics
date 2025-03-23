import React from 'react';
import { uiColors } from '../utils/theme';

type DateRangeType = 'month' | 'quarter' | 'half-year' | 'year';

interface DateFilterProps {
  value: DateRangeType;
  onChange: (value: DateRangeType) => void;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div>
      <label className="block font-medium text-grey-40 mb-1 text-right text-sm">
        Time Period
      </label>
      <div className="flex space-x-2">
        <DateFilterButton 
          label="Month" 
          value="month" 
          selected={value === 'month'} 
          onClick={() => onChange('month')} 
        />
        <DateFilterButton 
          label="Quarter" 
          value="quarter" 
          selected={value === 'quarter'} 
          onClick={() => onChange('quarter')} 
        />
        <DateFilterButton 
          label="Half Year" 
          value="half-year" 
          selected={value === 'half-year'} 
          onClick={() => onChange('half-year')} 
        />
        <DateFilterButton 
          label="Year" 
          value="year" 
          selected={value === 'year'} 
          onClick={() => onChange('year')} 
        />
      </div>
    </div>
  );
}

interface DateFilterButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}

function DateFilterButton({ label, selected, onClick }: DateFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium rounded-md transition-colors text-sm
        ${selected 
          ? `${uiColors.primary.bg} text-white` 
          : `${uiColors.default.bg} ${uiColors.default.text} border ${uiColors.default.border} hover:bg-grey-80`
        }
      `}
    >
      {label}
    </button>
  );
}
