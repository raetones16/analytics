import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartProps, categoryColors, formatLargeNumber, CategoryKey } from './types';
import { currencyFormatter } from './tooltips';

const TotalSalesValueChart: React.FC<ChartProps> = ({ data }) => {
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
      categoryKey: 'newDirect' as CategoryKey,
      activeDot: { r: 8 }
    },
    { 
      dataKey: "newPartnerSalesValue", 
      name: "New Partner", 
      stroke: categoryColors.newPartner,
      categoryKey: 'newPartner' as CategoryKey
    },
    { 
      dataKey: "existingClientUpsellValue", 
      name: "Existing Client", 
      stroke: categoryColors.existingClient,
      categoryKey: 'existingClient' as CategoryKey
    },
    { 
      dataKey: "existingPartnerClientValue", 
      name: "Existing Partner", 
      stroke: categoryColors.existingPartner,
      categoryKey: 'existingPartner' as CategoryKey
    },
    { 
      dataKey: "selfServiceValue", 
      name: "Self-Service", 
      stroke: categoryColors.selfService,
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
                  stroke={category.stroke}
                  strokeWidth="2"
                  fill="none"
                  d="M0,7h14" 
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
      <h3 className="text-lg font-medium mb-1">Total Monthly Sales Value</h3>
      {helpText}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatLargeNumber(value)} />
          <Tooltip formatter={currencyFormatter} />
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
};

export default TotalSalesValueChart;
