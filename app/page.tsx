"use client";

import { useState, useEffect } from "react";
import { DateFilter } from "./components/DateFilter";
import { ProductCharts } from "./components/ProductCharts";
import { SalesCharts } from "./components/SalesCharts";
import { processChartData } from "./utils/date-utils";
import { uiColors } from "./utils/theme";

// Define types for our data
interface ProductUsageData {
  date: string;
  webLogins: number;
  mobileLogins: number;
  webAbsencesBooked: number;
  mobileAbsencesBooked: number;
  webTimesheetsSubmitted: number;
  mobileTimesheetsSubmitted: number;
  workflowsCreated: number;
  _synthetic?: {
    distribution?: boolean;
    data?: boolean;
  };
}

interface SalesData {
  date: string;
  averageOrderValue: number;
  averageModulesPerClient: number;
  arrGrowth: number;
  _synthetic?: {
    data?: boolean;
  };
}

// Helper function for filtering data by date
function filterDataByDateRange<T extends { date: string }>(
  data: T[],
  range: "month" | "quarter" | "half-year" | "year"
): T[] {
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case "month":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      break;
    case "quarter":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        now.getDate()
      );
      break;
    case "half-year":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 6,
        now.getDate()
      );
      break;
    case "year":
      startDate = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      break;
    default:
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
  }

  return data.filter((item) => {
    try {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    } catch (error) {
      console.error(`Error parsing date: ${item.date}`, error);
      return false;
    }
  });
}

type DateRangeType = "month" | "quarter" | "half-year" | "year";

// Mock data for fallback
const mockProductData: ProductUsageData[] = [
  {
    date: "2025-01-01",
    webLogins: 1250,
    mobileLogins: 850,
    webAbsencesBooked: 320,
    mobileAbsencesBooked: 180,
    webTimesheetsSubmitted: 920,
    mobileTimesheetsSubmitted: 580,
    workflowsCreated: 42,
  },
  {
    date: "2025-02-01",
    webLogins: 1330,
    mobileLogins: 910,
    webAbsencesBooked: 345,
    mobileAbsencesBooked: 205,
    webTimesheetsSubmitted: 965,
    mobileTimesheetsSubmitted: 620,
    workflowsCreated: 49,
  },
  {
    date: "2025-03-01",
    webLogins: 1480,
    mobileLogins: 1050,
    webAbsencesBooked: 410,
    mobileAbsencesBooked: 240,
    webTimesheetsSubmitted: 1090,
    mobileTimesheetsSubmitted: 730,
    workflowsCreated: 64,
  },
];

const mockSalesData: SalesData[] = [
  {
    date: "2025-01-01",
    averageOrderValue: 8500,
    averageModulesPerClient: 3.2,
    arrGrowth: 4.5,
  },
  {
    date: "2025-02-01",
    averageOrderValue: 9200,
    averageModulesPerClient: 3.5,
    arrGrowth: 5.8,
  },
  {
    date: "2025-03-01",
    averageOrderValue: 10500,
    averageModulesPerClient: 3.8,
    arrGrowth: 7.2,
  },
];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRangeType>("quarter");
  const [productData, setProductData] = useState<ProductUsageData[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "mock">("api");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching data from API...");
        // Try to fetch data from the API first
        const response = await fetch(`/api/data?type=all`);

        if (response.ok) {
          const data = await response.json();
          // Add detailed console logging for data
          console.log(
            `Data from API - Product: ${
              data.productData?.length || 0
            }, Sales: ${data.salesData?.length || 0}`
          );

          // Check if we received data for each category
          const hasProductData =
            data.productData &&
            Array.isArray(data.productData) &&
            data.productData.length > 0;
          const hasSalesData =
            data.salesData &&
            Array.isArray(data.salesData) &&
            data.salesData.length > 0;

          console.log(
            `Data availability - Product: ${hasProductData}, Sales: ${hasSalesData}`
          );

          // Use fetched data if available, otherwise fall back to mock data
          const productDataSource = hasProductData
            ? data.productData
            : mockProductData;
          const salesDataSource = hasSalesData ? data.salesData : mockSalesData;

          // Set data source flag based on whether we're using real or mock data
          setDataSource(hasProductData && hasSalesData ? "api" : "mock");

          if (!hasProductData || !hasSalesData) {
            setError(
              "Some data could not be loaded from the API. Using fallback data where needed."
            );
          }

          // Filter by date range
          console.log("Filtering data by date range:", dateRange);
          const filteredProductData = filterDataByDateRange(
            productDataSource,
            dateRange
          );
          const filteredSalesData = filterDataByDateRange(
            salesDataSource,
            dateRange
          );

          console.log(
            `Filtered data counts - Product: ${filteredProductData.length}, Sales: ${filteredSalesData.length}`
          );

          // Process data with consistent date formatting and ordering
          const processedProductData = processChartData(
            filteredProductData as ProductUsageData[]
          );
          const processedSalesData = processChartData(
            filteredSalesData as SalesData[]
          );

          setProductData(processedProductData);
          setSalesData(processedSalesData);
        } else {
          // If API fails, use mock data
          const errorText = await response.text();
          console.warn(`API returned error (${response.status}): ${errorText}`);
          setError(`API error: ${response.status} ${response.statusText}`);
          setDataSource("mock");

          // Filter and process mock data
          const filteredProductData = filterDataByDateRange(
            mockProductData,
            dateRange
          );
          const filteredSalesData = filterDataByDateRange(
            mockSalesData,
            dateRange
          );

          // Process data with consistent date formatting and ordering
          const processedProductData = processChartData(
            filteredProductData as ProductUsageData[]
          );
          const processedSalesData = processChartData(
            filteredSalesData as SalesData[]
          );

          setProductData(processedProductData);
          setSalesData(processedSalesData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError(
          `Error fetching data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setDataSource("mock");

        // Filter and process mock data
        const filteredProductData = filterDataByDateRange(
          mockProductData,
          dateRange
        );
        const filteredSalesData = filterDataByDateRange(
          mockSalesData,
          dateRange
        );

        // Process data with consistent date formatting and ordering
        const processedProductData = processChartData(
          filteredProductData as ProductUsageData[]
        );
        const processedSalesData = processChartData(
          filteredSalesData as SalesData[]
        );

        setProductData(processedProductData);
        setSalesData(processedSalesData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange]);

  return (
    <div className="container 2xl:max-w-[1800px] mx-auto px-4">
      <header className="pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-sm">
            View key business metrics at a glance
          </p>
        </div>
        <DateFilter value={dateRange} onChange={setDateRange} />
      </header>

      {error && (
        <div
          className={`${uiColors.warning.bg} border-l-4 ${uiColors.warning.border} p-4 mb-6`}
        >
          <div className="flex">
            <div className="ml-3">
              <p className={uiColors.warning.text}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {dataSource === "mock" && !error && (
        <div
          className={`${uiColors.info.bg} border-l-4 ${uiColors.info.border} p-4 mb-6`}
        >
          <div className="flex">
            <div className="ml-3">
              <p className={uiColors.info.text}>
                Using mock data. No real data available from API.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <ProductCharts data={productData} />
          </div>
          <div className="mb-12">
            <SalesCharts data={salesData} />
          </div>
        </>
      )}
    </div>
  );
}
