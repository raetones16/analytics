import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { ChartProps, categoryColors, formatLargeNumber, CategoryKey } from './types';
import { CustomSalesTooltip } from './tooltips';

interface TotalSalesValueChartProps extends ChartProps {
  visualizationType?: 'line' | 'bar' | 'area';
}

const TotalSalesValueChart: React.FC<TotalSalesValueChartProps> = ({ data, visualizationType = 'line' }) => {
  if (data.length === 0) return null;
  
  // Local state to track which category is active
  // null means all categories are shown
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  
  // Category configuration with dynamic visibility
  const categories = [
    { 
      dataKey: "newDirectSalesValue", 
      name: "New Direct", 
      stroke: categoryColors.newDirect,
      fill: categoryColors.newDirect,
      categoryKey: 'newDirect' as CategoryKey,
      activeDot: { r: 8 }
    },
    { 
      dataKey: "newPartnerSalesValue", 
      name: "New Partner", 
      stroke: categoryColors.newPartner,
      fill: categoryColors.newPartner,
      categoryKey: 'newPartner' as CategoryKey
    },
    { 
      dataKey: "existingClientUpsellValue", 
      name: "Existing Client", 
      stroke: categoryColors.existingClient,
      fill: categoryColors.existingClient,
      categoryKey: 'existingClient' as CategoryKey
    },
    { 
      dataKey: "existingPartnerClientValue", 
      name: "Existing Partner", 
      stroke: categoryColors.existingPartner,
      fill: categoryColors.existingPartner,
      categoryKey: 'existingPartner' as CategoryKey
    },
    { 
      dataKey: "selfServiceValue", 
      name: "Self-Service", 
      stroke: categoryColors.selfService,
      fill: categoryColors.selfService,
      categoryKey: 'selfService' as CategoryKey
    }
  ];
  
  // Handle legend item click
  const handleLegendClick = (categoryKey: CategoryKey) => {
    // If clicking the already active category, reset to show all
    if (activeCategory === categoryKey) {
      setActiveCategory(null);
    } else {
      // Otherwise, set the clicked category as active
      setActiveCategory(categoryKey);
    }
  };
  
  // Determine which categories to show
  const getVisibleCategories = () => {
    if (activeCategory === null) {
      // If no active category, show all
      return categories;
    } else {
      // Otherwise, only show the active category
      return categories.filter(cat => cat.categoryKey === activeCategory);
    }
  };
  
  const visibleCategories = getVisibleCategories();
  
  // Custom Legend component that handles clicks
  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="recharts-default-legend" style={{ padding: 0, margin: 0, textAlign: 'center' }}>
        {categories.map((category, index) => {
          const isActive = activeCategory === null || activeCategory === category.categoryKey;
          
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
              onClick={() => handleLegendClick(category.categoryKey)}
            >
              <svg 
                className="recharts-surface" 
                width="14" 
                height="14" 
                viewBox="0 0 14 14" 
                style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}
              >
                {visualizationType === 'line' ? (
                  <path 
                    stroke={category.stroke}
                    strokeWidth="2"
                    fill="none"
                    d="M0,7h14" 
                    className="recharts-legend-icon"
                  />
                ) : (
                  <path 
                    fill={category.fill} 
                    d="M0,0h14v14h-14z" 
                    className="recharts-legend-icon"
                  />
                )}
              </svg>
              <span style={{ color: isActive ? '#666' : '#999', fontSize: '0.7rem' }}>{category.name}</span>
            </li>
          );
        })}
      </ul>
    );
  };
  
  // Render line chart
  if (visualizationType === 'line') {
    return (
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomSalesTooltip />} />
            <Legend content={<CustomLegend />} />
            
            {visibleCategories.map((category) => (
              <Line 
                key={category.dataKey}
                type="monotone" 
                dataKey={category.dataKey} 
                name={category.name} 
                stroke={category.stroke}
                activeDot={category.activeDot}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Render bar chart
  if (visualizationType === 'bar') {
    return (
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomSalesTooltip />} />
            <Legend content={<CustomLegend />} />
            
            {visibleCategories.map((category) => (
              <Bar 
                key={category.dataKey}
                dataKey={category.dataKey} 
                name={category.name} 
                fill={category.fill}
                stackId={activeCategory === null ? "a" : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Render area chart
  if (visualizationType === 'area') {
    return (
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomSalesTooltip />} />
            <Legend content={<CustomLegend />} />
            
            {visibleCategories.map((category) => (
              <Area 
                key={category.dataKey}
                type="monotone" 
                dataKey={category.dataKey} 
                name={category.name} 
                stroke={category.stroke}
                fill={category.fill}
                fillOpacity={0.3}
                stackId={activeCategory === null ? "1" : undefined}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Default fallback
  return <div>Unsupported visualization type</div>;
};

export default TotalSalesValueChart;