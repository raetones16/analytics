import { promises as fs } from "fs";
import path from "path";
import Papa from "papaparse";
import xlsx from "xlsx";
import getConfig from "next/config";
import { log, LOG_LEVEL } from "../api/data/utils/logging";

// Get server-side config
const { serverRuntimeConfig } = getConfig() || { serverRuntimeConfig: {} };
const dataDirectories = serverRuntimeConfig.dataDirectories || {
  customer: process.env.CUSTOMER_DATA_DIR || "",
  sales: process.env.SALES_DATA_DIR || "",
  support: process.env.SUPPORT_DATA_DIR || "",
};

/**
 * Reads a CSV file and returns the parsed data
 */
export async function readCSVFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return Papa.parse(content, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error reading CSV file: ${filePath}`, error);
    return { data: [] };
  }
}

/**
 * Reads an Excel file and returns the parsed data
 */
export async function readExcelFile(
  filePath: string,
  sheetName: string | number = 0
) {
  try {
    const buffer = await fs.readFile(filePath);
    const workbook = xlsx.read(buffer);

    // Use provided sheet name or default to first sheet
    const sheetNameToUse =
      typeof sheetName === "string" && workbook.SheetNames.includes(sheetName)
        ? sheetName
        : workbook.SheetNames[Number(sheetName) || 0];

    const sheet = workbook.Sheets[sheetNameToUse];
    return xlsx.utils.sheet_to_json(sheet);
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error reading Excel file: ${filePath}`, error);
    return [];
  }
}

/**
 * Lists all files in a directory
 */
export async function listFiles(dirPath: string) {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Error listing files in directory: ${dirPath}`, error);
    return [];
  }
}

/**
 * Gets paths to customer data files
 */
export async function getCustomerDataFiles() {
  try {
    const dir = dataDirectories.customer;
    const files = await listFiles(dir);
    return files.map((file) => path.join(dir, file));
  } catch (error) {
    log(LOG_LEVEL.ERROR, "Error getting customer data files:", error);
    return [];
  }
}

/**
 * Gets paths to sales data files
 */
export async function getSalesDataFiles() {
  try {
    const dir = dataDirectories.sales;
    const files = await listFiles(dir);
    return files.map((file) => path.join(dir, file));
  } catch (error) {
    log(LOG_LEVEL.ERROR, "Error getting sales data files:", error);
    return [];
  }
}

/**
 * Gets paths to support data files
 */
export async function getSupportDataFiles() {
  try {
    const dir = dataDirectories.support;
    const files = await listFiles(dir);
    return files.map((file) => path.join(dir, file));
  } catch (error) {
    log(LOG_LEVEL.ERROR, "Error getting support data files:", error);
    return [];
  }
}
