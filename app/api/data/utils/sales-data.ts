import { promises as fs } from "fs";
import path from "path";
import { LOG_LEVEL, log } from "./logging";
import { DATA_DIRS, findColumn, parseDate, readCSVFile } from "./file-utils";

// Define interfaces for the data
interface SalesDataPoint {
  date: string;
  // Sales type metrics based on Channel__c categories
  newDirectSalesCount: number;
  newDirectSalesValue: number;
  newPartnerSalesCount: number;
  newPartnerSalesValue: number;
  existingClientUpsellCount: number;
  existingClientUpsellValue: number;
  existingPartnerClientCount: number;
  existingPartnerClientValue: number;
  selfServiceCount: number;
  selfServiceValue: number;
  // License type metrics
  userLicensesCount: number;
  leaverLicensesCount: number;
  timesheetLicensesCount: number;
  directoryLicensesCount: number;
  workflowLicensesCount: number;
  otherLicensesCount: number;
  // Combined metrics
  totalSalesCount: number;
  averageOrderValue: number;
  averageModulesPerClient: number;
  avgRevenuePerAccount: number; // Overall ARPA
  arrGrowth: number;
  arrGrowthSmoothed: number; // 3-month trailing average
  arrValues: number[]; // Store last 3 months for smoothing
  _synthetic?: {
    data?: boolean;
  };
}

export async function processSalesData(): Promise<SalesDataPoint[]> {
  try {
    log(LOG_LEVEL.INFO, "Processing sales data...");
    const files = await fs.readdir(DATA_DIRS.sales);

    // Find the sales file
    const salesforceFile = files.find((f) => f.includes("salesforce"));
    log(LOG_LEVEL.INFO, `Found sales file: ${salesforceFile}`);

    if (!salesforceFile) {
      log(LOG_LEVEL.ERROR, "No salesforce file found");
      return [];
    }

    // Read the data
    const result = await readCSVFile(
      path.join(DATA_DIRS.sales, salesforceFile)
    );
    const salesforceData = result.data;

    if (!salesforceData || salesforceData.length === 0) {
      log(LOG_LEVEL.ERROR, "No data found in salesforce file");
      return [];
    }

    // Find relevant columns
    if (salesforceData?.length > 0) {
      const firstRow = salesforceData[0];
      const dateColumn = findColumn(firstRow, [
        "CloseDate",
        "closeDate",
        "Close_Date",
        "Date",
      ]);
      const amountColumn = findColumn(firstRow, [
        "Amount",
        "amount",
        "deal_amount",
        "value",
        "ARR__c",
      ]);
      // Only explicit modules count column (avoid generic or license fields)
      const modulesColumn = findColumn(firstRow, ["NumberOfModules"]);
      const channelColumn = findColumn(firstRow, [
        "Channel__c",
        "channel",
        "Channel",
        "sale_type",
      ]);
      const typeColumn = findColumn(firstRow, ["Type", "type", "StageName"]);

      log(
        LOG_LEVEL.INFO,
        `Sales columns - Date: ${dateColumn}, Amount: ${amountColumn}, Modules: ${modulesColumn}, Channel: ${channelColumn}, Type: ${typeColumn}`
      );

      if (!dateColumn || !amountColumn) {
        log(LOG_LEVEL.ERROR, "Missing required columns in sales data");
        return [];
      }

      // Group by month, using the Channel__c field for categorization
      const dataByMonth = new Map();

      // Function to categorize sales based on Channel__c and Type fields
      const getSalesCategory = (item: any) => {
        if (
          !channelColumn ||
          !item[channelColumn] ||
          !typeColumn ||
          !item[typeColumn]
        ) {
          return "unknown";
        }

        const channelValue = String(item[channelColumn]).trim();
        const typeValue = String(item[typeColumn]).trim();

        // Revised logic: require both Channel__c and Type to match for new categories
        if (channelValue === "Direct Sale" && typeValue === "New prospect") {
          return "new-direct";
        } else if (
          channelValue === "Partner Sale (Partner)" &&
          typeValue === "Partner Program Opportunity"
        ) {
          return "new-partner";
        } else if (channelValue === "Direct Sale") {
          // Direct Sale but not new prospect = existing client
          return "existing-client";
        } else if (channelValue === "Partner Sale (Partner)") {
          // Partner Sale but not new partner program = existing partner
          return "existing-partner";
        } else if (channelValue === "Customer Sale") {
          return "existing-client";
        } else if (channelValue === "Customer Sale (Partner)") {
          return "existing-partner";
        } else if (channelValue === "Self-Service System Order") {
          return "self-service";
        } else {
          log(LOG_LEVEL.WARN, `Unknown sales channel: ${channelValue}`);
          return "unknown";
        }
      };

      // Function to count license types
      const getLicenseTypes = (item: any) => {
        const itemId = item.Id || "Unknown";
        const result = {
          userLicenses: 0,
          leaverLicenses: 0,
          timesheetLicenses: 0,
          directoryLicenses: 0,
          workflowLicenses: 0,
          otherLicenses: 0,
        };

        // User licenses - try both columns and be more detailed in logging
        const ul1Column = findColumn(item, ["User_licenses1__c"]);
        const ultColumn = findColumn(item, ["User_Licenses_Total__c"]);

        if (
          ul1Column &&
          item[ul1Column] !== undefined &&
          item[ul1Column] !== null
        ) {
          const rawValue = item[ul1Column];
          log(
            LOG_LEVEL.INFO,
            `Deal ${itemId}: User_licenses1__c raw value: "${rawValue}", type: ${typeof rawValue}`
          );

          // Try to parse the value properly
          if (typeof rawValue === "string") {
            // Remove any non-numeric characters except decimal point
            const cleanedValue = rawValue.replace(/[^0-9.]/g, "");
            if (cleanedValue) {
              result.userLicenses = parseFloat(cleanedValue) || 0;
            }
          } else if (typeof rawValue === "number") {
            result.userLicenses = rawValue;
          }

          log(
            LOG_LEVEL.INFO,
            `Deal ${itemId}: Parsed userLicenses value: ${result.userLicenses}`
          );
        } else if (
          ultColumn &&
          item[ultColumn] !== undefined &&
          item[ultColumn] !== null
        ) {
          const rawValue = item[ultColumn];
          log(
            LOG_LEVEL.INFO,
            `Deal ${itemId}: User_Licenses_Total__c raw value: "${rawValue}", type: ${typeof rawValue}`
          );

          // Try to parse the value properly
          if (typeof rawValue === "string") {
            // Remove any non-numeric characters except decimal point
            const cleanedValue = rawValue.replace(/[^0-9.]/g, "");
            if (cleanedValue) {
              result.userLicenses = parseFloat(cleanedValue) || 0;
            }
          } else if (typeof rawValue === "number") {
            result.userLicenses = rawValue;
          }

          log(
            LOG_LEVEL.INFO,
            `Deal ${itemId}: Parsed userLicenses value: ${result.userLicenses}`
          );
        }

        // Leaver licenses
        const leaverLicensesColumn = findColumn(item, ["Leavers_Licenses__c"]);
        if (
          leaverLicensesColumn &&
          item[leaverLicensesColumn] !== undefined &&
          item[leaverLicensesColumn] !== null
        ) {
          const rawValue = item[leaverLicensesColumn];
          if (typeof rawValue === "string") {
            const cleanedValue = rawValue.replace(/[^0-9.]/g, "");
            if (cleanedValue) {
              result.leaverLicenses = parseFloat(cleanedValue) || 0;
            }
          } else if (typeof rawValue === "number") {
            result.leaverLicenses = rawValue;
          }
        }

        // Timesheet licenses
        const timesheetLicensesColumn = findColumn(item, [
          "Time_Submission_Licenses__c",
          "Time_Tracking_Licenses__c",
        ]);
        if (
          timesheetLicensesColumn &&
          item[timesheetLicensesColumn] !== undefined &&
          item[timesheetLicensesColumn] !== null
        ) {
          const rawValue = item[timesheetLicensesColumn];
          if (typeof rawValue === "string") {
            const cleanedValue = rawValue.replace(/[^0-9.]/g, "");
            if (cleanedValue) {
              result.timesheetLicenses = parseFloat(cleanedValue) || 0;
            }
          } else if (typeof rawValue === "number") {
            result.timesheetLicenses = rawValue;
          }
        }

        // Directory licenses
        const directoryLicensesColumn = findColumn(item, [
          "Directory_Licenses__c",
        ]);
        if (
          directoryLicensesColumn &&
          item[directoryLicensesColumn] !== undefined &&
          item[directoryLicensesColumn] !== null
        ) {
          const rawValue = item[directoryLicensesColumn];
          if (typeof rawValue === "string") {
            const cleanedValue = rawValue.replace(/[^0-9.]/g, "");
            if (cleanedValue) {
              result.directoryLicenses = parseFloat(cleanedValue) || 0;
            }
          } else if (typeof rawValue === "number") {
            result.directoryLicenses = rawValue;
          }
        }

        // Workflow licenses
        const workflowLicensesColumn = findColumn(item, [
          "Workflow_Builder_Pro_Licenses__c",
        ]);
        if (
          workflowLicensesColumn &&
          item[workflowLicensesColumn] !== undefined &&
          item[workflowLicensesColumn] !== null
        ) {
          const rawValue = item[workflowLicensesColumn];
          if (typeof rawValue === "string") {
            const cleanedValue = rawValue.replace(/[^0-9.]/g, "");
            if (cleanedValue) {
              result.workflowLicenses = parseFloat(cleanedValue) || 0;
            }
          } else if (typeof rawValue === "number") {
            result.workflowLicenses = rawValue;
          }
        }

        return result;
      };

      // Function to calculate number of modules sold per deal (explicit module list)
      const getTotalModules = (item: any) => {
        const parseCount = (raw: any) => {
          if (typeof raw === "number") return raw;
          if (typeof raw === "string") {
            const cleaned = raw.replace(/[^0-9.]/g, "");
            return parseFloat(cleaned) || 0;
          }
          return 0;
        };
        let count = 0;
        // edays Absence (User + Leaver)
        const ulCol = findColumn(item, ["User_licenses1__c"]);
        const ultCol = findColumn(item, ["User_Licenses_Total__c"]);
        const llCol = findColumn(item, ["Leavers_Licenses__c"]);
        const userVal =
          (ulCol && item[ulCol] != null ? parseCount(item[ulCol]) : 0) +
          (ultCol && item[ultCol] != null ? parseCount(item[ultCol]) : 0);
        const leaverVal =
          llCol && item[llCol] != null ? parseCount(item[llCol]) : 0;
        if (userVal + leaverVal > 0) count++;
        // edays People Insights
        const piCol = findColumn(item, ["People_Insights_Licenses__c"]);
        if (piCol && parseCount(item[piCol]) > 0) count++;
        // Core HR (Directory)
        const dirCol = findColumn(item, ["Directory_Licenses__c"]);
        if (dirCol && parseCount(item[dirCol]) > 0) count++;
        // Time Submission
        const subCol = findColumn(item, ["Time_Submission_Licenses__c"]);
        if (subCol && parseCount(item[subCol]) > 0) count++;
        // Time Tracking
        const trackCol = findColumn(item, ["Time_Tracking_Licenses__c"]);
        if (trackCol && parseCount(item[trackCol]) > 0) count++;
        // third party EAP
        const eapCol = findColumn(item, ["EAP_Licenses__c"]);
        if (eapCol && parseCount(item[eapCol]) > 0) count++;
        // Workflow Builder
        const wfCol = findColumn(item, ["Workflow_Builder_Pro_Licenses__c"]);
        if (wfCol && parseCount(item[wfCol]) > 0) count++;
        // Grosvenor
        const grosCol = findColumn(item, ["Grosvenor_Licenses__c"]);
        if (grosCol && parseCount(item[grosCol]) > 0) count++;
        // ELMO Core HR
        const elmoCoreCol = findColumn(item, ["ELMO_Core_HR_Licenses__c"]);
        if (elmoCoreCol && parseCount(item[elmoCoreCol]) > 0) count++;
        // ELMO Onboarding
        const elmoOnboardCol = findColumn(item, [
          "ELMO_Onboarding_Licenses__c",
        ]);
        if (elmoOnboardCol && parseCount(item[elmoOnboardCol]) > 0) count++;
        return count;
      };

      // Initialize counters for different sales categories
      let newDirectCount = 0;
      let newPartnerCount = 0;
      let existingClientCount = 0;
      let existingPartnerCount = 0;
      let selfServiceCount = 0;
      let unknownCategoryCount = 0;

      salesforceData.forEach((item, index) => {
        try {
          if (!item[dateColumn]) {
            log(LOG_LEVEL.WARN, `Missing date in sales row ${index}`);
            return;
          }

          const date = parseDate(item[dateColumn]);
          if (!date) {
            log(
              LOG_LEVEL.WARN,
              `Invalid date in sales data: ${item[dateColumn]}`
            );
            return;
          }

          // Create month key (YYYY-MM)
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;

          if (!dataByMonth.has(monthKey)) {
            dataByMonth.set(monthKey, {
              // Categories
              newDirect: [],
              newPartner: [],
              existingClient: [],
              existingPartner: [],
              selfService: [],
              unknown: [],

              // License types
              licenseTypes: {
                userLicenses: 0,
                leaverLicenses: 0,
                timesheetLicenses: 0,
                directoryLicenses: 0,
                workflowLicenses: 0,
                otherLicenses: 0,
              },
            });
          }

          // Get values
          const amount = parseFloat(item[amountColumn]) || 0;
          const modules = getTotalModules(item);

          // Add to appropriate category based on Channel__c
          const salesCategory = getSalesCategory(item);
          switch (salesCategory) {
            case "new-direct":
              dataByMonth.get(monthKey).newDirect.push({ amount, modules });
              newDirectCount++;
              break;
            case "new-partner":
              dataByMonth.get(monthKey).newPartner.push({ amount, modules });
              newPartnerCount++;
              break;
            case "existing-client":
              dataByMonth
                .get(monthKey)
                .existingClient.push({ amount, modules });
              existingClientCount++;
              break;
            case "existing-partner":
              dataByMonth
                .get(monthKey)
                .existingPartner.push({ amount, modules });
              existingPartnerCount++;
              break;
            case "self-service":
              dataByMonth.get(monthKey).selfService.push({ amount, modules });
              selfServiceCount++;
              break;
            default:
              dataByMonth.get(monthKey).unknown.push({ amount, modules });
              unknownCategoryCount++;
          }

          // Count license types
          const licenseTypes = getLicenseTypes(item);
          const monthData = dataByMonth.get(monthKey);
          monthData.licenseTypes.userLicenses += licenseTypes.userLicenses;
          monthData.licenseTypes.leaverLicenses += licenseTypes.leaverLicenses;
          monthData.licenseTypes.timesheetLicenses +=
            licenseTypes.timesheetLicenses;
          monthData.licenseTypes.directoryLicenses +=
            licenseTypes.directoryLicenses;
          monthData.licenseTypes.workflowLicenses +=
            licenseTypes.workflowLicenses;
          monthData.licenseTypes.otherLicenses += licenseTypes.otherLicenses;
        } catch (error: unknown) {
          let errorMessage = "Unknown error";
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          }
          log(
            LOG_LEVEL.ERROR,
            `Error processing sales row ${index}: ${errorMessage}`
          );
        }
      });

      // Log sales breakdown
      log(
        LOG_LEVEL.INFO,
        `Channel-based Sales breakdown - New Direct: ${newDirectCount}, New Partner: ${newPartnerCount}, Existing Client: ${existingClientCount}, Existing Partner: ${existingPartnerCount}, Self-service: ${selfServiceCount}, Unknown: ${unknownCategoryCount}`
      );

      // Calculate metrics for each month
      const processedData: SalesDataPoint[] = [];
      let previousMonthTotalARR = 0;

      Array.from(dataByMonth.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, data]) => {
          const {
            // Categories
            newDirect,
            newPartner,
            existingClient,
            existingPartner,
            selfService,
            unknown,
            // License types
            licenseTypes,
          } = data;

          // Calculate metrics for each category
          const newDirectTotalValue = newDirect.reduce(
            (sum: number, deal: { amount: number; modules: number }) =>
              sum + deal.amount,
            0
          );
          const newPartnerTotalValue = newPartner.reduce(
            (sum: number, deal: { amount: number; modules: number }) =>
              sum + deal.amount,
            0
          );
          const existingClientTotalValue = existingClient.reduce(
            (sum: number, deal: { amount: number; modules: number }) =>
              sum + deal.amount,
            0
          );
          const existingPartnerTotalValue = existingPartner.reduce(
            (sum: number, deal: { amount: number; modules: number }) =>
              sum + deal.amount,
            0
          );
          const selfServiceTotalValue = selfService.reduce(
            (sum: number, deal: { amount: number; modules: number }) =>
              sum + deal.amount,
            0
          );
          const unknownTotalValue = unknown.reduce(
            (sum: number, deal: { amount: number; modules: number }) =>
              sum + deal.amount,
            0
          );

          // Calculate combined metrics
          const totalValue =
            newDirectTotalValue +
            newPartnerTotalValue +
            existingClientTotalValue +
            existingPartnerTotalValue +
            selfServiceTotalValue +
            unknownTotalValue;

          const totalCount =
            newDirect.length +
            newPartner.length +
            existingClient.length +
            existingPartner.length +
            selfService.length +
            unknown.length;

          // For average modules calculation, consider new prospect and partner deals
          const totalModulesNewDeals =
            newDirect.reduce(
              (sum: number, deal: { modules: number }) =>
                sum + (deal.modules || 0),
              0
            ) +
            newPartner.reduce(
              (sum: number, deal: { modules: number }) =>
                sum + (deal.modules || 0),
              0
            );
          const modulesCountNewDeals = newDirect.length + newPartner.length;

          // Calculate overall ARPA
          const avgRevenuePerAccount =
            totalCount > 0 ? totalValue / totalCount : 0;

          // Calculate ARR and ARR growth
          const currentMonthTotalARR = totalValue * 12;
          const arrGrowth =
            previousMonthTotalARR > 0
              ? ((currentMonthTotalARR - previousMonthTotalARR) /
                  previousMonthTotalARR) *
                100
              : 0;

          previousMonthTotalARR = currentMonthTotalARR;

          // Store ARR values for trailing calculations
          const arrValues =
            processedData.length > 0
              ? [
                  ...processedData[processedData.length - 1].arrValues.slice(
                    -2
                  ),
                  arrGrowth,
                ]
              : [0, 0, arrGrowth];

          // Calculate 3-month trailing average for ARR growth (smoother trend)
          const arrGrowthSmoothed =
            (arrValues[0] + arrValues[1] + arrValues[2]) / 3;

          processedData.push({
            date: month,
            // New channel-based metrics
            newDirectSalesCount: newDirect.length,
            newDirectSalesValue: newDirectTotalValue,
            newPartnerSalesCount: newPartner.length,
            newPartnerSalesValue: newPartnerTotalValue,
            existingClientUpsellCount: existingClient.length,
            existingClientUpsellValue: existingClientTotalValue,
            existingPartnerClientCount: existingPartner.length,
            existingPartnerClientValue: existingPartnerTotalValue,
            selfServiceCount: selfService.length,
            selfServiceValue: selfServiceTotalValue,

            // License type metrics
            userLicensesCount: licenseTypes.userLicenses,
            leaverLicensesCount: licenseTypes.leaverLicenses,
            timesheetLicensesCount: licenseTypes.timesheetLicenses,
            directoryLicensesCount: licenseTypes.directoryLicenses,
            workflowLicensesCount: licenseTypes.workflowLicenses,
            otherLicensesCount: licenseTypes.otherLicenses,

            // Combined metrics
            totalSalesCount: totalCount,
            averageOrderValue: totalCount > 0 ? totalValue / totalCount : 0,
            averageModulesPerClient:
              modulesCountNewDeals > 0
                ? totalModulesNewDeals / modulesCountNewDeals
                : 0,
            avgRevenuePerAccount,
            arrGrowth,
            arrGrowthSmoothed,
            arrValues,
            _synthetic: {
              data: false, // This is real data
            },
          });
        });

      log(
        LOG_LEVEL.INFO,
        `Processed ${processedData.length} sales data points`
      );
      return processedData;
    }

    return [];
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    log(LOG_LEVEL.ERROR, `Sales data processing failed: ${errorMessage}`);
    return [];
  }
}
