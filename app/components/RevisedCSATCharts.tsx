"use client";

import React, { useState, useEffect } from 'react';
import { SyntheticDataIndicator } from './SyntheticDataIndicator';
import { CSATData } from './charts/csat/types';
import { SummaryStats } from './charts/csat';
import {
  MonthlyTicketsChart,
  HelpTopicsChart,
  ImpactLevelChart,
  TicketTypesChart
} from './charts/csat/revised';
import { VisualizationToggle } from './VisualizationToggle';
import { saveVisualizationPreferences, loadVisualizationPreferences } from '../utils/storage/localStorage';
import { LayoutManagerWithGrid } from './LayoutManagerWithGrid';
import { EditLayoutButton } from './EditLayoutButton';
import {
  CSAT_CHARTS_LAYOUT_KEY, 
  getDefaultCSATChartsLayout 
} from '../utils/storage/layoutStorage';

interface CSATChartsProps {
  data: CSATData[];
  dateRange: 'month' | 'quarter' | 'half-year' | 'year';
}

export function RevisedCSATCharts({ data, dateRange }: CSATChartsProps) {
  // State for hover over charts
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);
  // State for edit mode
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  // State for visualization preferences
  const [visualPreferences, setVisualPreferences] = useState({
    helpTopics: 'horizontalBar', // default
    impactLevel: 'pie',
    ticketTypes: 'horizontalBar',
    monthlyTickets: 'line'
  });

  // On initial load, load preferences from localStorage
  useEffect(() => {
    const storedPrefs = loadVisualizationPreferences();
    if (storedPrefs) {
      // Only update for CSAT chart preferences
      const csatPrefs = {
        helpTopics: storedPrefs.helpTopics || visualPreferences.helpTopics,
        impactLevel: storedPrefs.impactLevel || visualPreferences.impactLevel,
        ticketTypes: storedPrefs.ticketTypes || visualPreferences.ticketTypes,
        monthlyTickets: storedPrefs.monthlyTickets || visualPreferences.monthlyTickets
      };
      setVisualPreferences(prev => ({ ...prev, ...csatPrefs }));
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

  // Check for synthetic data flags
  const hasSyntheticTickets = data.some(item => 
    (typeof item._synthetic === 'boolean' && item._synthetic) || 
    (item._synthetic && item._synthetic.tickets)
  );
  
  // Create detailed message
  const syntheticDetails = hasSyntheticTickets 
    ? 'Using synthetic support ticket data for demonstration' 
    : '';
  
  // Get the latest data point for the summary stats
  const latestData = data.length > 0 ? data[data.length - 1] : null;
  
  // If we have no data, show a message
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Support Analytics</h2>
        <p>No support data available for the selected period.</p>
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
    <div 
      data-edit-active={isEditingLayout ? "true" : "false"}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Support Analytics</h2>
        <EditLayoutButton 
          isEditing={isEditingLayout} 
          onClick={toggleEditMode} 
        />
      </div>
      
      <SyntheticDataIndicator 
        isVisible={hasSyntheticTickets}
        dataName="Support ticket data"
        details={syntheticDetails}
        type={'partial'}
      />
      
      {/* Summary Stats */}
      {latestData && <SummaryStats data={latestData} />}
      
      
      <LayoutManagerWithGrid
        storageKey={CSAT_CHARTS_LAYOUT_KEY}
        defaultLayout={getDefaultCSATChartsLayout()}
        isEditing={isEditingLayout}
        onSave={handleSaveLayout}
        onCancel={handleCancelLayout}
      >
        {/* Monthly Tickets Chart - Only show for date ranges longer than a month */}
        {dateRange !== 'month' && (
          <div 
            id="monthlyTickets" 
            className="bg-white p-4 rounded-lg shadow-md mb-6 relative"
            onMouseEnter={() => setHoveredChart('monthlyTickets')}
            onMouseLeave={() => setHoveredChart(null)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md">Monthly Ticket Volume</h3>
              <div className={`transition-opacity duration-200 ${hoveredChart === 'monthlyTickets' ? 'opacity-100' : 'opacity-0'}`}>
                <VisualizationToggle
                  current={visualPreferences.monthlyTickets}
                  options={[
                    { value: 'line', label: 'Line' },
                    { value: 'bar', label: 'Bar' },
                    { value: 'area', label: 'Area' }
                  ]}
                  onChange={handleVisualizationChange}
                  chartName="monthlyTickets"
                />
              </div>
            </div>
            <MonthlyTicketsChart 
              data={data} 
              visualizationType={visualPreferences.monthlyTickets as 'line' | 'bar' | 'area'}
            />
          </div>
        )}
        
        {/* Help Topics Chart */}
        <div 
          id="helpTopics" 
          className="bg-white p-4 rounded-lg shadow-md mb-6 relative"
          onMouseEnter={() => setHoveredChart('helpTopics')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Tickets by Help Topic</h3>
            <div className={`transition-opacity duration-200 ${hoveredChart === 'helpTopics' ? 'opacity-100' : 'opacity-0'}`}>
              <VisualizationToggle
                current={visualPreferences.helpTopics}
                options={[
                  { value: 'horizontalBar', label: 'Bar' },
                  { value: 'pie', label: 'Pie' },
                  { value: 'treemap', label: 'TreeMap' }
                ]}
                onChange={handleVisualizationChange}
                chartName="helpTopics"
              />
            </div>
          </div>
          <HelpTopicsChart 
            data={data} 
            visualizationType={visualPreferences.helpTopics as 'horizontalBar' | 'pie' | 'treemap'}
          />
        </div>
        
        {/* Impact Level Chart */}
        <div 
          id="impactLevel" 
          className="bg-white p-4 rounded-lg shadow-md mb-6 relative"
          onMouseEnter={() => setHoveredChart('impactLevel')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Tickets by Impact Level</h3>
            <div className={`transition-opacity duration-200 ${hoveredChart === 'impactLevel' ? 'opacity-100' : 'opacity-0'}`}>
              <VisualizationToggle
                current={visualPreferences.impactLevel}
                options={[
                  { value: 'pie', label: 'Pie' },
                  { value: 'bar', label: 'Bar' },
                  { value: 'donut', label: 'Donut' }
                ]}
                onChange={handleVisualizationChange}
                chartName="impactLevel"
              />
            </div>
          </div>
          <ImpactLevelChart 
            data={data} 
            visualizationType={visualPreferences.impactLevel as 'pie' | 'bar' | 'donut'}
          />
        </div>
        
        {/* Ticket Types Chart */}
        <div 
          id="ticketTypes" 
          className="bg-white p-4 rounded-lg shadow-md mb-6 relative"
          onMouseEnter={() => setHoveredChart('ticketTypes')}
          onMouseLeave={() => setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Tickets by Type</h3>
            <div className={`transition-opacity duration-200 ${hoveredChart === 'ticketTypes' ? 'opacity-100' : 'opacity-0'}`}>
              <VisualizationToggle
                current={visualPreferences.ticketTypes}
                options={[
                  { value: 'horizontalBar', label: 'Bar' },
                  { value: 'pie', label: 'Pie' },
                  { value: 'donut', label: 'Donut' }
                ]}
                onChange={handleVisualizationChange}
                chartName="ticketTypes"
              />
            </div>
          </div>
          <TicketTypesChart 
            data={data} 
            visualizationType={visualPreferences.ticketTypes as 'horizontalBar' | 'pie' | 'donut'}
          />
        </div>
      </LayoutManagerWithGrid>
    </div>
  );
}
