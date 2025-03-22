'use client';

import React, { useState, useEffect } from 'react';
import { SyntheticDataIndicator } from './SyntheticDataIndicator';
import {
  UserLoginsChart,
  AbsencesBookedChart,
  TimesheetsSubmittedChart,
  WorkflowsCreatedChart,
  ProductUsageData
} from './charts/products';
import { VisualizationToggle } from './VisualizationToggle';
import { saveVisualizationPreferences, loadVisualizationPreferences } from '../utils/storage/localStorage';

interface ProductChartsProps {
  data: ProductUsageData[];
}

export function ProductCharts({ data }: ProductChartsProps) {
  // State for visualization preferences
  const [visualPreferences, setVisualPreferences] = useState({
    userLogins: 'line',
    absencesBooked: 'bar',
    timesheetsSubmitted: 'line',
    workflowsCreated: 'bar'
  });

  // On initial load, load preferences from localStorage
  useEffect(() => {
    const storedPrefs = loadVisualizationPreferences();
    if (storedPrefs) {
      // Only update for Product chart preferences
      const productPrefs = {
        userLogins: storedPrefs.userLogins || visualPreferences.userLogins,
        absencesBooked: storedPrefs.absencesBooked || visualPreferences.absencesBooked,
        timesheetsSubmitted: storedPrefs.timesheetsSubmitted || visualPreferences.timesheetsSubmitted,
        workflowsCreated: storedPrefs.workflowsCreated || visualPreferences.workflowsCreated
      };
      setVisualPreferences(prev => ({ ...prev, ...productPrefs }));
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
  const hasSyntheticData = data.some(item => item._synthetic?.data === true);
  const hasSyntheticDistribution = data.some(item => item._synthetic?.distribution === true);
  
  // Details for the indicator
  let syntheticDetails = '';
  let indicatorType: 'full' | 'partial' | 'distribution' = 'partial';
  
  if (hasSyntheticData) {
    syntheticDetails = 'Using generated values because no real data was available';
    indicatorType = 'full';
  } else if (hasSyntheticDistribution) {
    syntheticDetails = 'Using actual totals but time distribution is estimated';
    indicatorType = 'distribution';
  }
  
  // Count data points for the indicator
  const dataPoints = data.length;

  // If we have no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Product Usage</h2>
        <p>No product usage data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-2">Product Usage</h2>
      
      <SyntheticDataIndicator 
        isVisible={hasSyntheticData || hasSyntheticDistribution}
        dataName="product usage data"
        details={syntheticDetails}
        type={indicatorType}
        dataPoints={dataPoints}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* User Logins Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">User Logins</h3>
            <VisualizationToggle
              current={visualPreferences.userLogins}
              options={[
                { value: 'line', label: 'Line' },
                { value: 'bar', label: 'Bar' },
                { value: 'area', label: 'Area' }
              ]}
              onChange={handleVisualizationChange}
              chartName="userLogins"
            />
          </div>
          <UserLoginsChart 
            data={data} 
            visualizationType={visualPreferences.userLogins} 
          />
        </div>
        
        {/* Absences Booked Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Absences Booked</h3>
            <VisualizationToggle
              current={visualPreferences.absencesBooked}
              options={[
                { value: 'bar', label: 'Bar' },
                { value: 'line', label: 'Line' },
                { value: 'stacked', label: 'Stacked' }
              ]}
              onChange={handleVisualizationChange}
              chartName="absencesBooked"
            />
          </div>
          <AbsencesBookedChart 
            data={data} 
            visualizationType={visualPreferences.absencesBooked} 
          />
        </div>
        
        {/* Timesheets Submitted Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Timesheets Submitted</h3>
            <VisualizationToggle
              current={visualPreferences.timesheetsSubmitted}
              options={[
                { value: 'line', label: 'Line' },
                { value: 'bar', label: 'Bar' },
                { value: 'stacked', label: 'Stacked' }
              ]}
              onChange={handleVisualizationChange}
              chartName="timesheetsSubmitted"
            />
          </div>
          <TimesheetsSubmittedChart 
            data={data} 
            visualizationType={visualPreferences.timesheetsSubmitted} 
          />
        </div>
        
        {/* Workflows Created Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">Workflows Created</h3>
            <VisualizationToggle
              current={visualPreferences.workflowsCreated}
              options={[
                { value: 'bar', label: 'Bar' },
                { value: 'line', label: 'Line' },
                { value: 'area', label: 'Area' }
              ]}
              onChange={handleVisualizationChange}
              chartName="workflowsCreated"
            />
          </div>
          <WorkflowsCreatedChart 
            data={data} 
            visualizationType={visualPreferences.workflowsCreated} 
          />
        </div>
      </div>
    </div>
  );
}
