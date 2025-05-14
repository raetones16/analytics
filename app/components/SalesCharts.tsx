"use client";

import React, { useState, useEffect } from "react";
import { SyntheticDataIndicator } from "./SyntheticDataIndicator";
import {
  SalesByCategoryChart,
  AverageOrderValueChart,
  ARRGrowthChart,
  LicenseTypesChart,
  SalesCountChart,
  TotalSalesValueChart,
  AverageModulesSoldChart,
  SalesData,
} from "./charts/sales";
import { VisualizationToggle } from "./VisualizationToggle";
import { LayoutManagerWithGrid } from "./LayoutManagerWithGrid";
import { EditLayoutButton } from "./EditLayoutButton";

interface SalesChartsProps {
  data: SalesData[];
}

// Define local fallback constants
const SALES_CHARTS_LAYOUT_KEY = "sales_charts_layout";
const getDefaultSalesChartsLayout = (): {
  id: string;
  position: number;
  width: "half" | "full";
}[] => [
  { id: "salesByCategory", position: 0, width: "half" },
  { id: "averageOrderValue", position: 1, width: "half" },
  { id: "arrGrowth", position: 2, width: "half" },
  { id: "licenseTypes", position: 3, width: "half" },
  { id: "salesCount", position: 4, width: "half" },
  { id: "totalSalesValue", position: 5, width: "half" },
  { id: "averageModulesSold", position: 6, width: "half" },
];

export function SalesCharts({ data }: SalesChartsProps) {
  // State for hover over charts
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);
  // State for edit mode
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  // State for visualization preferences
  const [visualPreferences, setVisualPreferences] = useState({
    salesByCategory: "pie",
    averageOrderValue: "line",
    arrGrowth: "line",
    licenseTypes: "pie",
    salesCount: "bar",
    totalSalesValue: "line",
    averageModulesSold: "line",
  });

  // Check if any data points have synthetic flags
  const hasSyntheticData = data.some((item) => item._synthetic?.data);

  // Pre-calculate additional metrics for the charts
  const enhancedData = data.map((item) => {
    // Calculate average values for new categories
    const newDirectAvg =
      item.newDirectSalesCount && item.newDirectSalesValue
        ? item.newDirectSalesValue / item.newDirectSalesCount
        : 0;

    const newPartnerAvg =
      item.newPartnerSalesCount && item.newPartnerSalesValue
        ? item.newPartnerSalesValue / item.newPartnerSalesCount
        : 0;

    const existingClientAvg =
      item.existingClientUpsellCount && item.existingClientUpsellValue
        ? item.existingClientUpsellValue / item.existingClientUpsellCount
        : 0;

    const existingPartnerAvg =
      item.existingPartnerClientCount && item.existingPartnerClientValue
        ? item.existingPartnerClientValue / item.existingPartnerClientCount
        : 0;

    const selfServiceAvg =
      item.selfServiceCount && item.selfServiceValue
        ? item.selfServiceValue / item.selfServiceCount
        : 0;

    return {
      ...item,
      // Add calculated average fields
      newDirectAvg,
      newPartnerAvg,
      existingClientAvg,
      existingPartnerAvg,
      selfServiceAvg,
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

  // Function to toggle edit mode
  const toggleEditMode = () => {
    // If currently editing another section, don't allow switching to edit mode
    const otherSectionEditing = document.querySelector(
      '[data-edit-active="true"]'
    );
    if (otherSectionEditing && !isEditingLayout) {
      alert("Please save or cancel editing in the other section first.");
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

  // Function to handle visualization type changes
  const handleVisualizationChange = (chartName: string, value: string) => {
    setVisualPreferences((prev) => ({ ...prev, [chartName]: value }));
  };

  return (
    <div data-edit-active={isEditingLayout ? "true" : "false"}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sales Statistics</h2>
        <EditLayoutButton
          isEditing={isEditingLayout}
          onClick={toggleEditMode}
        />
      </div>

      <SyntheticDataIndicator
        isVisible={hasSyntheticData}
        dataName="sales data"
        details="Data is categorized by Channel__c field"
        type="full"
      />

      <LayoutManagerWithGrid
        storageKey={SALES_CHARTS_LAYOUT_KEY}
        defaultLayout={getDefaultSalesChartsLayout()}
        isEditing={isEditingLayout}
        onSave={handleSaveLayout}
        onCancel={handleCancelLayout}
      >
        {/* Sales by Category Chart */}
        <div
          id="salesByCategory"
          className="bg-white p-4 rounded-lg shadow-md relative"
          onMouseEnter={() =>
            !isEditingLayout && setHoveredChart("salesByCategory")
          }
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Sales by Category</h3>
            <div
              className={`transition-opacity duration-200 ${
                hoveredChart === "salesByCategory" ? "opacity-100" : "opacity-0"
              }`}
            >
              <VisualizationToggle
                current={visualPreferences.salesByCategory}
                options={[
                  { value: "pie", label: "Pie" },
                  { value: "bar", label: "Bar" },
                  { value: "donut", label: "Donut" },
                ]}
                onChange={handleVisualizationChange}
                chartName="salesByCategory"
              />
            </div>
          </div>
          <SalesByCategoryChart
            data={enhancedData}
            visualizationType={
              visualPreferences.salesByCategory as "pie" | "bar" | "donut"
            }
          />
        </div>

        {/* Average Order Value Chart */}
        <div
          id="averageOrderValue"
          className="bg-white p-4 rounded-lg shadow-md relative"
          onMouseEnter={() =>
            !isEditingLayout && setHoveredChart("averageOrderValue")
          }
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Average Order Value</h3>
            <div
              className={`transition-opacity duration-200 ${
                hoveredChart === "averageOrderValue"
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            >
              <VisualizationToggle
                current={visualPreferences.averageOrderValue}
                options={[
                  { value: "line", label: "Line" },
                  { value: "bar", label: "Bar" },
                  { value: "area", label: "Area" },
                ]}
                onChange={handleVisualizationChange}
                chartName="averageOrderValue"
              />
            </div>
          </div>
          <AverageOrderValueChart
            data={enhancedData}
            visualizationType={
              visualPreferences.averageOrderValue as "line" | "bar" | "area"
            }
          />
        </div>

        {/* ARR Growth Chart */}
        <div
          id="arrGrowth"
          className="bg-white p-4 rounded-lg shadow-md relative"
          onMouseEnter={() => !isEditingLayout && setHoveredChart("arrGrowth")}
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">ARR Growth</h3>
            <div
              className={`transition-opacity duration-200 ${
                hoveredChart === "arrGrowth" ? "opacity-100" : "opacity-0"
              }`}
            >
              <VisualizationToggle
                current={visualPreferences.arrGrowth}
                options={[
                  { value: "line", label: "Line" },
                  { value: "bar", label: "Bar" },
                  { value: "area", label: "Area" },
                ]}
                onChange={handleVisualizationChange}
                chartName="arrGrowth"
              />
            </div>
          </div>
          <ARRGrowthChart
            data={enhancedData}
            visualizationType={
              visualPreferences.arrGrowth as "line" | "bar" | "area"
            }
          />
        </div>

        {/* License Types Distribution Chart */}
        <div
          id="licenseTypes"
          className="bg-white p-4 rounded-lg shadow-md relative"
          onMouseEnter={() =>
            !isEditingLayout && setHoveredChart("licenseTypes")
          }
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">License Types</h3>
            <div
              className={`transition-opacity duration-200 ${
                hoveredChart === "licenseTypes" ? "opacity-100" : "opacity-0"
              }`}
            >
              <VisualizationToggle
                current={visualPreferences.licenseTypes}
                options={[
                  { value: "pie", label: "Pie" },
                  { value: "bar", label: "Bar" },
                  { value: "donut", label: "Donut" },
                ]}
                onChange={handleVisualizationChange}
                chartName="licenseTypes"
              />
            </div>
          </div>
          <LicenseTypesChart
            data={enhancedData}
            visualizationType={
              visualPreferences.licenseTypes as "pie" | "bar" | "donut"
            }
          />
        </div>

        {/* Sales Count by Category Chart */}
        <div
          id="salesCount"
          className="bg-white p-4 rounded-lg shadow-md relative"
          onMouseEnter={() => !isEditingLayout && setHoveredChart("salesCount")}
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Sales Count</h3>
            <div
              className={`transition-opacity duration-200 ${
                hoveredChart === "salesCount" ? "opacity-100" : "opacity-0"
              }`}
            >
              <VisualizationToggle
                current={visualPreferences.salesCount}
                options={[
                  { value: "bar", label: "Bar" },
                  { value: "line", label: "Line" },
                  { value: "stacked", label: "Stacked" },
                ]}
                onChange={handleVisualizationChange}
                chartName="salesCount"
              />
            </div>
          </div>
          <SalesCountChart
            data={enhancedData}
            visualizationType={
              visualPreferences.salesCount as "bar" | "line" | "stacked"
            }
          />
        </div>

        {/* Total Monthly Sales Value Chart */}
        <div
          id="totalSalesValue"
          className="bg-white p-4 rounded-lg shadow-md relative"
          onMouseEnter={() =>
            !isEditingLayout && setHoveredChart("totalSalesValue")
          }
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Total Sales Value</h3>
            <div
              className={`transition-opacity duration-200 ${
                hoveredChart === "totalSalesValue" ? "opacity-100" : "opacity-0"
              }`}
            >
              <VisualizationToggle
                current={visualPreferences.totalSalesValue}
                options={[
                  { value: "line", label: "Line" },
                  { value: "bar", label: "Bar" },
                  { value: "area", label: "Area" },
                ]}
                onChange={handleVisualizationChange}
                chartName="totalSalesValue"
              />
            </div>
          </div>
          <TotalSalesValueChart
            data={enhancedData}
            visualizationType={
              visualPreferences.totalSalesValue as "line" | "bar" | "area"
            }
          />
        </div>

        {/* Average Modules Sold per New Client Chart */}
        <div
          id="averageModulesSold"
          className="bg-white p-4 rounded-lg shadow-md relative"
          onMouseEnter={() =>
            !isEditingLayout && setHoveredChart("averageModulesSold")
          }
          onMouseLeave={() => !isEditingLayout && setHoveredChart(null)}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md">Average Modules Sold per New Client</h3>
            <div
              className={`transition-opacity duration-200 ${
                hoveredChart === "averageModulesSold"
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            >
              <VisualizationToggle
                current={visualPreferences.averageModulesSold}
                options={[
                  { value: "line", label: "Line" },
                  { value: "bar", label: "Bar" },
                  { value: "area", label: "Area" },
                ]}
                onChange={handleVisualizationChange}
                chartName="averageModulesSold"
              />
            </div>
          </div>
          <AverageModulesSoldChart
            data={enhancedData}
            visualizationType={
              visualPreferences.averageModulesSold as "line" | "bar" | "area"
            }
          />
        </div>
      </LayoutManagerWithGrid>
    </div>
  );
}
