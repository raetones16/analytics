import React from 'react';

interface SyntheticDataIndicatorProps {
  isVisible: boolean;
  dataName?: string;
  details?: string;
  type?: 'full' | 'partial' | 'distribution';
  dataPoints?: number;
}

export const SyntheticDataIndicator: React.FC<SyntheticDataIndicatorProps> = ({
  isVisible,
  dataName = 'data',
  details = '',
  type = 'full',
  dataPoints = 0
}) => {
  // Don't render anything if there's no synthetic data
  if (!isVisible) return null;

  let bgColor = 'bg-blue-50';
  let borderColor = 'border-blue-400';
  let textColor = 'text-blue-700';
  let message = '';
  
  // Determine style and message based on type
  if (type === 'full') {
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-400';
    textColor = 'text-yellow-700';
    message = `Using fully synthetic ${dataName}`;
  } else if (type === 'distribution') {
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-400';
    textColor = 'text-blue-700';
    message = `Using real totals with synthetic time distribution`;
  } else {
    // Partial type
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-400';
    textColor = 'text-blue-700';
    message = `Using partially synthetic ${dataName}`;
  }
  
  // Add data points info if available
  const pointsInfo = dataPoints > 0 ? `Based on ${dataPoints} data points` : '';
  
  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-2 mb-2 text-xs`}>
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className={`${textColor}`}>
          <p>{message}</p>
          {(details || pointsInfo) && (
            <p className="block mt-0.5 ml-5 text-xs opacity-80">
              {details}
              {details && pointsInfo && ' • '}
              {pointsInfo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
