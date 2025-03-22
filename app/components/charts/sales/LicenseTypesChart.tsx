import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ChartProps, formatLargeNumber } from './types';

// License type key for filtering
type LicenseTypeKey = 'user' | 'leaver' | 'timesheet' | 'directory' | 'workflow' | 'other';

interface LicenseTypesChartProps extends ChartProps {
  visualizationType?: 'bar' | 'pie' | 'donut';
}

const LicenseTypesChart: React.FC<LicenseTypesChartProps> = ({ data, visualizationType = 'pie' }) => {
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
  
  // Get latest data point for pie/donut charts
  const latestData = data.length > 0 
    ? data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
  
  // Prepare data for pie/donut charts
  const preparePieData = () => {
    if (!latestData) return [];
    
    return licenseTypes
      .filter(type => {
        return activeLicenseType === null || activeLicenseType === type.typeKey;
      })
      .map(type => ({
        name: type.name,
        value: latestData[type.dataKey as keyof typeof latestData] as number || 0,
        fill: type.fill,
        typeKey: type.typeKey
      }))
      .filter(item => item.value > 0); // Only include non-zero values
  };
  
  const pieData = preparePieData();
  
  // Render bar chart
  if (visualizationType === 'bar') {
    return (
      <div>
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
  }
  
  // Render pie chart
  if (visualizationType === 'pie') {
    return (
      <div>
        {helpText}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, value, percent }) => `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  onClick={() => handleLegendClick(entry.typeKey)}
                />
              ))}
            </Pie>
            <Legend content={<CustomLegend />} />
            <Tooltip formatter={(value: any) => value.toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Render donut chart
  if (visualizationType === 'donut') {
    return (
      <div>
        {helpText}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, value, percent }) => `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  onClick={() => handleLegendClick(entry.typeKey)}
                />
              ))}
            </Pie>
            <Legend content={<CustomLegend />} />
            <Tooltip formatter={(value: any) => value.toLocaleString()} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Default fallback
  return <div>Unsupported visualization type</div>;
};

export default LicenseTypesChart;
