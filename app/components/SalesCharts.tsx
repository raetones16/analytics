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

interface SalesChartsProps {
  data: SalesData[];
}

export function SalesCharts({ data }: SalesChartsProps) {
  // Check if any data points have synthetic flags
  const hasSyntheticData = data.some(item => item._synthetic?.data);
  
  // Add more detailed logging for data changes
  useEffect(() => {
    console.log('##################################');
    console.log('DATA CHANGE DETECTED - Length:', data?.length);
    console.log('Current data points:', data?.map(d => d.date).join(', '));
    console.log('##################################');
  }, [data]);
  
  // For debugging specific data points
  useEffect(() => {
    // Only run once in development
    if (process.env.NODE_ENV === 'development') {
      if (data.length > 0) {
        // Add highly distinctive markers that will definitely show in logs
        console.log('##################################');
        console.log('######## SALES DEBUG START #######');
        console.log('##################################');
        
        data.forEach((dataPoint, index) => {
          console.log(`DATA POINT ${index + 1} (${dataPoint.date}):`);
          
          // Log Channel__c based categories
          console.log('NEW DIRECT SALES:', {
            count: dataPoint.newDirectSalesCount || 0,
            totalValue: dataPoint.newDirectSalesValue || 0,
            calculatedAvg: dataPoint.newDirectSalesCount && dataPoint.newDirectSalesValue 
              ? (dataPoint.newDirectSalesValue / dataPoint.newDirectSalesCount)
              : 'N/A'
          });
          
          console.log('NEW PARTNER SALES:', {
            count: dataPoint.newPartnerSalesCount || 0,
            totalValue: dataPoint.newPartnerSalesValue || 0,
            calculatedAvg: dataPoint.newPartnerSalesCount && dataPoint.newPartnerSalesValue 
              ? (dataPoint.newPartnerSalesValue / dataPoint.newPartnerSalesCount)
              : 'N/A'
          });
          
          console.log('EXISTING CLIENT UPSELL:', {
            count: dataPoint.existingClientUpsellCount || 0,
            totalValue: dataPoint.existingClientUpsellValue || 0,
            calculatedAvg: dataPoint.existingClientUpsellCount && dataPoint.existingClientUpsellValue 
              ? (dataPoint.existingClientUpsellValue / dataPoint.existingClientUpsellCount)
              : 'N/A'
          });
          
          console.log('EXISTING PARTNER CLIENT:', {
            count: dataPoint.existingPartnerClientCount || 0,
            totalValue: dataPoint.existingPartnerClientValue || 0,
            calculatedAvg: dataPoint.existingPartnerClientCount && dataPoint.existingPartnerClientValue 
              ? (dataPoint.existingPartnerClientValue / dataPoint.existingPartnerClientCount)
              : 'N/A'
          });
          
          console.log('SELF-SERVICE:', {
            count: dataPoint.selfServiceCount || 0,
            totalValue: dataPoint.selfServiceValue || 0,
            calculatedAvg: dataPoint.selfServiceCount && dataPoint.selfServiceValue 
              ? (dataPoint.selfServiceValue / dataPoint.selfServiceCount)
              : 'N/A'
          });
        });
        
        console.log('##################################');
        console.log('######### SALES DEBUG END ########');
        console.log('##################################');
      }
    }
  }, [data]);
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales by Category Chart */}
        <div>
          <SalesByCategoryChart data={enhancedData} />
        </div>
        
        {/* Average Order Value Chart */}
        <div>
          <AverageOrderValueChart data={enhancedData} />
        </div>
        
        {/* ARR Growth Chart */}
        <div>
          <ARRGrowthChart data={enhancedData} />
        </div>
        
        {/* License Types Distribution Chart */}
        <div>
          <LicenseTypesChart data={enhancedData} />
        </div>
        
        {/* Sales Count by Category Chart */}
        <div>
          <SalesCountChart data={enhancedData} />
        </div>
        
        {/* Total Monthly Sales Value Chart */}
        <div>
          <TotalSalesValueChart data={enhancedData} />
        </div>
      </div>
    </div>
  );
}
