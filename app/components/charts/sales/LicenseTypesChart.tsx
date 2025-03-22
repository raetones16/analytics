import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, formatLargeNumber } from './types';

// License type key for filtering
type LicenseTypeKey = 'user' | 'leaver' | 'timesheet' | 'directory' | 'workflow' | 'other';

const LicenseTypesChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  // Local state to track which license type is active
  // null means all types are shown
  const [activeLicenseType, setActiveLicenseType] = useState<LicenseTypeKey | null>(null);
  
  // Define license types with consistent properties
  const licenseTypes = [
    { 
      dataKey: "userLicensesCount", 
      name: "User Licenses", 
      fill: "#8884d8",
      typeKey: 'user' as LicenseTypeKey
    },
    { 
      dataKey: "leaverLicensesCount", 
      name: "Leaver Licenses", 
      fill: "#82ca9d",
      typeKey: 'leaver' as LicenseTypeKey
    },
    { 
      dataKey: "timesheetLicensesCount", 
      name: "Timesheet Licenses", 
      fill: "#ffc658",
      typeKey: 'timesheet' as LicenseTypeKey
    },
    { 
      dataKey: "directoryLicensesCount", 
      name: "Directory Licenses", 
      fill: "#ff8042",
      typeKey: 'directory' as LicenseTypeKey
    },
    { 
      dataKey: "workflowLicensesCount", 
      name: "Workflow Licenses", 
      fill: "#e65100",
      typeKey: 'workflow' as LicenseTypeKey
    },
    { 
      dataKey: "otherLicensesCount", 
      name: "Other Licenses", 
      fill: "#9e9e9e",
      typeKey: 'other' as LicenseTypeKey
    }
  ];
  
  // Handle legend item click
  const handleLegendClick = (typeKey: LicenseTypeKey) => {
    // If clicking the already active license type, reset to show all
    if (activeLicenseType === typeKey) {
      setActiveLicenseType(null);
    } else {
      // Otherwise, set the clicked license type as active
      setActiveLicenseType(typeKey);
    }
  };
  
  // Determine which license types to show
  const getVisibleLicenseTypes = () => {
    if (activeLicenseType === null) {
      // If no active type, show all
      return licenseTypes;
    } else {
      // Otherwise, only show the active type
      return licenseTypes.filter(type => type.typeKey === activeLicenseType);
    }
  };
  
  const visibleLicenseTypes = getVisibleLicenseTypes();
  
  // Custom Legend component that handles clicks
  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="recharts-default-legend" style={{ padding: 0, margin: 0, textAlign: 'center' }}>
        {licenseTypes.map((licenseType, index) => {
          const isActive = activeLicenseType === null || activeLicenseType === licenseType.typeKey;
          
          return (
            <li 
              key={`item-${index}`}
              className="recharts-legend-item"
              style={{ 
                display: 'inline-block', 
                marginRight: 10,
                cursor: 'pointer',
                opacity: isActive ? 1 : 0.5
              }}
              onClick={() => handleLegendClick(licenseType.typeKey)}
            >
              <svg 
                className="recharts-surface" 
                width="14" 
                height="14" 
                viewBox="0 0 14 14" 
                style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}
              >
                <path 
                  fill={licenseType.fill} 
                  d="M0,0h14v14h-14z" 
                  className="recharts-legend-icon"
                />
              </svg>
              <span style={{ color: isActive ? '#666' : '#999' }}>{licenseType.name}</span>
            </li>
          );
        })}
      </ul>
    );
  };
  
  // Add a help text for clarity
  const helpText = (
    <p className="text-xs text-gray-500 mt-1 mb-2 text-center">
      Click a legend item to focus on that license type. Click again to show all types.
    </p>
  );
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-1">License Types Distribution</h3>
      {helpText}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
          <Tooltip formatter={(value: any) => value.toLocaleString()} />
          <Legend content={<CustomLegend />} />
          
          {visibleLicenseTypes.map((licenseType) => (
            <Bar 
              key={licenseType.dataKey}
              dataKey={licenseType.dataKey}
              name={licenseType.name}
              fill={licenseType.fill}
              stackId={activeLicenseType === null ? "a" : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LicenseTypesChart;
