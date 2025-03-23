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
import { LayoutManagerWithGrid } from './LayoutManagerWithGrid';
import { EditLayoutButton } from './EditLayoutButton';
import {
  PRODUCT_CHARTS_LAYOUT_KEY, 
  getDefaultProductChartsLayout 
} from '../utils/storage/layoutStorage';

interface ProductChartsProps {
  data: ProductUsageData[];
}

export function ProductCharts({ data }: ProductChartsProps) {
  // State for hover over charts
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);
  // State for edit mode
  const [isEditingLayout, setIsEditingLayout] = useState(false);
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

  // Function to toggle edit mode
  const toggleEditMode = () => {
    // If currently editing another section, don't allow switching to edit mode
    const otherSectionEditing = document.querySelector('[data-edit-active="true"]');
    if (otherSectionEditing && !isEditingLayout) {
      alert('Please save or cancel editing in the other section first.');
      return;
    }
    
    setIsEditingLayout(!isEditingLayout);
  };

  // Function to handle save
  const handleSaveLayout = () => {
    setIsEditingLayout(false);
  };

  // Function to handle cancel
  const handleCancelLayout = () => {
    setIsEditingLayout(false);
  };

  return (
    <div data-edit-active={isEditingLayout ? "true" : "false"}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Product Usage</h2>
        <EditLayoutButton 
          isEditing={isEditingLayout} 
          onClick={toggleEditMode} 
        />
      </div>
      
      <SyntheticDataIndicator 
        isVisible={hasSyntheticData || hasSyntheticDistribution}
        dataName="product usage data"
        details={syntheticDetails}
        type={indicatorType}
        dataPoints={dataPoints}
      />
      
      <LayoutManagerWithGrid
        storageKey={PRODUCT_CHARTS_LAYOUT_KEY}
        defaultLayout={getDefaultProductChartsLayout()}
        isEditing={isEditingLayout}
        onSave={handleSaveLayout}
        onCancel={handleCancelLayout}
      >
        {/* User Logins Chart */}
        <div 
          id="userLogins" 
          className="bg-white p-4 rounded-lg shadow-md relative" 
          onMouseEnter={() => !isEditingLayout && setHoveredChart('userLogins')} 
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">User Logins</h3>
            <div className={`transition-opacity duration-200 ${hoveredChart === 'userLogins' ? 'opacity-100' : 'opacity-0'}`}>
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
          </div>
          <UserLoginsChart 
            data={data} 
            visualizationType={visualPreferences.userLogins as 'line' | 'bar' | 'area'} 
          />
        </div>
        
        {/* Absences Booked Chart */}
        <div 
          id="absencesBooked" 
          className="bg-white p-4 rounded-lg shadow-md relative" 
          onMouseEnter={() => !isEditingLayout && setHoveredChart('absencesBooked')} 
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Absences Booked</h3>
            <div className={`transition-opacity duration-200 ${hoveredChart === 'absencesBooked' ? 'opacity-100' : 'opacity-0'}`}>
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
          </div>
          <AbsencesBookedChart 
            data={data} 
            visualizationType={visualPreferences.absencesBooked as 'bar' | 'line' | 'stacked'} 
          />
        </div>
        
        {/* Timesheets Submitted Chart */}
        <div 
          id="timesheetsSubmitted" 
          className="bg-white p-4 rounded-lg shadow-md relative" 
          onMouseEnter={() => !isEditingLayout && setHoveredChart('timesheetsSubmitted')} 
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Timesheets Submitted</h3>
            <div className={`transition-opacity duration-200 ${hoveredChart === 'timesheetsSubmitted' ? 'opacity-100' : 'opacity-0'}`}>
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
          </div>
          <TimesheetsSubmittedChart 
            data={data} 
            visualizationType={visualPreferences.timesheetsSubmitted as 'line' | 'bar' | 'stacked'} 
          />
        </div>
        
        {/* Workflows Created Chart */}
        <div 
          id="workflowsCreated" 
          className="bg-white p-4 rounded-lg shadow-md relative" 
          onMouseEnter={() => !isEditingLayout && setHoveredChart('workflowsCreated')} 
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Workflows Created</h3>
            <div className={`transition-opacity duration-200 ${hoveredChart === 'workflowsCreated' ? 'opacity-100' : 'opacity-0'}`}>
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
          </div>
          <WorkflowsCreatedChart 
            data={data} 
            visualizationType={visualPreferences.workflowsCreated as 'bar' | 'line' | 'area'} 
          />
        </div>
      </LayoutManagerWithGrid>
    </div>
  );
}
