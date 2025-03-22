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

interface CSATChartsProps {
  data: CSATData[];
  dateRange: 'month' | 'quarter' | 'half-year' | 'year';
}

export function RevisedCSATCharts({ data, dateRange }: CSATChartsProps) {
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-2">Support Analytics</h2>
      
      <SyntheticDataIndicator 
        isVisible={hasSyntheticTickets}
        dataName="Support ticket data"
        details={syntheticDetails}
        type={'partial'}
      />
      
      {/* Summary Stats */}
      {latestData && <SummaryStats data={latestData} />}
      
      {/* Monthly Tickets Chart - Only show for date ranges longer than a month */}
      {dateRange !== 'month' && (
        <div className="mb-12">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Monthly Ticket Volume</h3>
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
          <MonthlyTicketsChart 
            data={data} 
            visualizationType={visualPreferences.monthlyTickets}
          />
        </div>
      )}
      
      <div className="mb-12">
        {/* Help Topics Chart */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Tickets by Help Topic</h3>
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
        <HelpTopicsChart 
          data={data} 
          visualizationType={visualPreferences.helpTopics}
        />
      </div>
      
      <div className="mb-12">
        {/* Impact Level Chart */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Tickets by Impact Level</h3>
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
        <ImpactLevelChart 
          data={data} 
          visualizationType={visualPreferences.impactLevel}
        />
      </div>
      
      <div className="mb-12">
        {/* Ticket Types Chart */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Tickets by Type</h3>
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
        <TicketTypesChart 
          data={data} 
          visualizationType={visualPreferences.ticketTypes}
        />
      </div>
    </div>
  );
}
