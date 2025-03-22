import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, categoryColors, formatLargeNumber, CategoryKey } from './types';
import { CustomSalesTooltip } from './tooltips';

const SalesByCategoryChart: React.FC<ChartProps> = ({ data }) => {
  if (data.length === 0) return null;
  
  // Local state to track which category is active
  // null means all categories are shown
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  
  // Category configuration with dynamic visibility
  const categories = [
    { 
      dataKey: "newDirectSalesValue", 
      name: "New Direct", 
      fill: categoryColors.newDirect,
      categoryKey: 'newDirect' as CategoryKey
    },
    { 
      dataKey: "newPartnerSalesValue", 
      name: "New Partner", 
      fill: categoryColors.newPartner,
      categoryKey: 'newPartner' as CategoryKey
    },
    { 
      dataKey: "existingClientUpsellValue", 
      name: "Existing Client", 
      fill: categoryColors.existingClient,
      categoryKey: 'existingClient' as CategoryKey
    },
    { 
      dataKey: "existingPartnerClientValue", 
      name: "Existing Partner", 
      fill: categoryColors.existingPartner,
      categoryKey: 'existingPartner' as CategoryKey
    },
    { 
      dataKey: "selfServiceValue", 
      name: "Self-Service", 
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
                <path 
                  fill={category.fill} 
                  d="M0,0h14v14h-14z" 
                  className="recharts-legend-icon"
                />
              </svg>
              <span style={{ color: isActive ? '#666' : '#999' }}>{category.name}</span>
            </li>
          );
        })}
      </ul>
    );
  };
  
  // Add a help text for clarity
  const helpText = (
    <p className="text-xs text-gray-500 mt-1 mb-2 text-center">
      Click a legend item to focus on that category. Click again to show all categories.
    </p>
  );
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-1">Sales by Category</h3>
      {helpText}
      <ResponsiveContainer width="100%" height={300}>
        {data.length === 1 ? (
          // If we have only one data point, use non-stacked bars
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomSalesTooltip />} />
            <Legend content={<CustomLegend />} />
            
            {visibleCategories.map((category) => (
              <Bar 
                key={category.dataKey} 
                dataKey={category.dataKey} 
                name={category.name} 
                fill={category.fill}
              />
            ))}
          </BarChart>
        ) : (
          // If we have multiple data points, use a stacked bar chart
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
            <Tooltip content={<CustomSalesTooltip />} />
            <Legend content={<CustomLegend />} />
            
            {visibleCategories.map((category) => (
              <Bar 
                key={category.dataKey} 
                dataKey={category.dataKey} 
                name={category.name} 
                fill={category.fill}
                stackId="a"
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesByCategoryChart;
