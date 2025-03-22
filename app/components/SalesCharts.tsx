'use client';

import React, { useState, useEffect } from 'react';
import { SyntheticDataIndicator } from './SyntheticDataIndicator';
import { 
  SalesByCategoryChart,
  AverageOrderValueChart,
  ARRGrowthChart,
  LicenseTypesChart,
  SalesCountChart,
  TotalSalesValueChart,
  SalesData
} from './charts/sales';
import { VisualizationToggle } from './VisualizationToggle';
import { saveVisualizationPreferences, loadVisualizationPreferences } from '../utils/storage/localStorage';

interface SalesChartsProps {
  data: SalesData[];
}

export function SalesCharts({ data }: SalesChartsProps) {
  // State for visualization preferences
  const [visualPreferences, setVisualPreferences] = useState({
    salesByCategory: 'pie',
    averageOrderValue: 'line',
    arrGrowth: 'line',
    licenseTypes: 'pie',
    salesCount: 'bar',
    totalSalesValue: 'line'
  });

  // On initial load, load preferences from localStorage
  useEffect(() => {
    const storedPrefs = loadVisualizationPreferences();
    if (storedPrefs) {
      // Only update for Sales chart preferences
      const salesPrefs = {
        salesByCategory: storedPrefs.salesByCategory || visualPreferences.salesByCategory,
        averageOrderValue: storedPrefs.averageOrderValue || visualPreferences.averageOrderValue,
        arrGrowth: storedPrefs.arrGrowth || visualPreferences.arrGrowth,
        licenseTypes: storedPrefs.licenseTypes || visualPreferences.licenseTypes,
        salesCount: storedPrefs.salesCount || visualPreferences.salesCount,
        totalSalesValue: storedPrefs.totalSalesValue || visualPreferences.totalSalesValue
      };
      setVisualPreferences(prev => ({ ...prev, ...salesPrefs }));
    }
  }, []);

  // Function to handle visualization type changes
  const handleVisualizationChange = (chartName: string, value: string) => {
    const newPrefs = {
      ...visualPreferences,
      [chartName]: value
    };
    
    setVisualPreferences(newPrefs);
    
    // Save to localStorage
    const storedPrefs = loadVisualizationPreferences();
    saveVisualizationPreferences({
      ...storedPrefs,
      [chartName]: value
    });
  };

  // Check if any data points have synthetic flags
  const hasSyntheticData = data.some(item => item._synthetic?.data);
  
  // Pre-calculate additional metrics for the charts
  const enhancedData = data.map(item => {
    // Calculate average values for new categories
    const newDirectAvg = item.newDirectSalesCount && item.newDirectSalesValue 
      ? item.newDirectSalesValue / item.newDirectSalesCount : 0;
    
    const newPartnerAvg = item.newPartnerSalesCount && item.newPartnerSalesValue 
      ? item.newPartnerSalesValue / item.newPartnerSalesCount : 0;
    
    const existingClientAvg = item.existingClientUpsellCount && item.existingClientUpsellValue 
      ? item.existingClientUpsellValue / item.existingClientUpsellCount : 0;
    
    const existingPartnerAvg = item.existingPartnerClientCount && item.existingPartnerClientValue 
      ? item.existingPartnerClientValue / item.existingPartnerClientCount : 0;
    
    const selfServiceAvg = item.selfServiceCount && item.selfServiceValue 
      ? item.selfServiceValue / item.selfServiceCount : 0;
    
    return {
      ...item,
      // Add calculated average fields
      newDirectAvg,
      newPartnerAvg,
      existingClientAvg,
      existingPartnerAvg,
      selfServiceAvg
    };
  });
  
  // If we have no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Sales Statistics</h2>
        <p>No sales data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-2">Sales Statistics</h2>
      
      <SyntheticDataIndicator 
        isVisible={hasSyntheticData}
        dataName="sales data"
        details="Data is categorized by Channel__c field"
        type="full"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Sales by Category Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Sales by Category</h3>
            <VisualizationToggle
              current={visualPreferences.salesByCategory}
              options={[
                { value: 'pie', label: 'Pie' },
                { value: 'bar', label: 'Bar' },
                { value: 'donut', label: 'Donut' }
              ]}
              onChange={handleVisualizationChange}
              chartName="salesByCategory"
            />
          </div>
          <SalesByCategoryChart 
            data={enhancedData} 
            visualizationType={visualPreferences.salesByCategory}
          />
        </div>
        
        {/* Average Order Value Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Average Order Value</h3>
            <VisualizationToggle
              current={visualPreferences.averageOrderValue}
              options={[
                { value: 'line', label: 'Line' },
                { value: 'bar', label: 'Bar' },
                { value: 'area', label: 'Area' }
              ]}
              onChange={handleVisualizationChange}
              chartName="averageOrderValue"
            />
          </div>
          <AverageOrderValueChart 
            data={enhancedData} 
            visualizationType={visualPreferences.averageOrderValue}
          />
        </div>
        
        {/* ARR Growth Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">ARR Growth</h3>
            <VisualizationToggle
              current={visualPreferences.arrGrowth}
              options={[
                { value: 'line', label: 'Line' },
                { value: 'bar', label: 'Bar' },
                { value: 'area', label: 'Area' }
              ]}
              onChange={handleVisualizationChange}
              chartName="arrGrowth"
            />
          </div>
          <ARRGrowthChart 
            data={enhancedData} 
            visualizationType={visualPreferences.arrGrowth}
          />
        </div>
        
        {/* License Types Distribution Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">License Types</h3>
            <VisualizationToggle
              current={visualPreferences.licenseTypes}
              options={[
                { value: 'pie', label: 'Pie' },
                { value: 'bar', label: 'Bar' },
                { value: 'donut', label: 'Donut' }
              ]}
              onChange={handleVisualizationChange}
              chartName="licenseTypes"
            />
          </div>
          <LicenseTypesChart 
            data={enhancedData} 
            visualizationType={visualPreferences.licenseTypes}
          />
        </div>
        
        {/* Sales Count by Category Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Sales Count</h3>
            <VisualizationToggle
              current={visualPreferences.salesCount}
              options={[
                { value: 'bar', label: 'Bar' },
                { value: 'line', label: 'Line' },
                { value: 'stacked', label: 'Stacked' }
              ]}
              onChange={handleVisualizationChange}
              chartName="salesCount"
            />
          </div>
          <SalesCountChart 
            data={enhancedData} 
            visualizationType={visualPreferences.salesCount}
          />
        </div>
        
        {/* Total Monthly Sales Value Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Total Sales Value</h3>
            <VisualizationToggle
              current={visualPreferences.totalSalesValue}
              options={[
                { value: 'line', label: 'Line' },
                { value: 'bar', label: 'Bar' },
                { value: 'area', label: 'Area' }
              ]}
              onChange={handleVisualizationChange}
              chartName="totalSalesValue"
            />
          </div>
          <TotalSalesValueChart 
            data={enhancedData} 
            visualizationType={visualPreferences.totalSalesValue}
          />
        </div>
      </div>
    </div>
  );
}
