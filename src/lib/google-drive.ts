import { google } from "googleapis";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

const GOG_KEYRING_PASSWORD = process.env.GOG_KEYRING_PASSWORD || "";
const GOG_ACCOUNT = "info@shesellsaustin.com";
const TEAM_DRIVE_ID = "0AEyW9Bf-LAibUk9PVA"; // Team E-Rae Realty

export interface DriveFile {
  id: string;
  name: string;
  type: string; // 'spreadsheet', 'document', 'other'
  mimeType?: string;
  size?: string;
  modified?: string;
}

export interface SheetData {
  [key: string]: any;
}

export interface SheetSection {
  title: string;
  data: SheetData[];
}

let sheetsClient: any = null;
let credentials: any = null;

function loadCredentials() {
  if (!credentials) {
    const credPath = path.join(
      process.env.HOME || "/Users/rosiejetson",
      ".credentials",
      "google-calendar.json"
    );
    const credContent = fs.readFileSync(credPath, "utf-8");
    credentials = JSON.parse(credContent);
  }
  return credentials;
}

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const creds = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

async function getDriveClient() {
  const creds = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: [
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  return google.drive({ version: "v3", auth });
}

/**
 * Search for documents in Google Drive by name or content.
 * Intelligently determines file type (spreadsheet vs document).
 * Searches in both Team Drive and personal Drive.
 * Uses gog drive get to fetch MIME types for accurate type detection.
 */
export async function searchGoogleDrive(query: string): Promise<DriveFile[]> {
  try {
    const cmd = `export PATH="/opt/homebrew/bin:$PATH" && export GOG_KEYRING_PASSWORD="${GOG_KEYRING_PASSWORD}" && /opt/homebrew/bin/gog drive search "${query}" --account=${GOG_ACCOUNT} --json`;
    const { stdout } = await execAsync(cmd);

    const data = JSON.parse(stdout || "{}");
    const files = data.files || [];
    
    if (files.length === 0) {
      console.log(`[GoogleDrive] Search for "${query}" returned no results`);
      return [];
    }

    // Process files with type detection
    const processedFiles: DriveFile[] = files.map((file: any) => {
      let fileType = "other";
      const mimeType = file.mimeType || "";
      
      // Determine type from MIME type
      if (mimeType.includes("spreadsheet")) {
        fileType = "spreadsheet";
      } else if (mimeType.includes("document")) {
        fileType = "document";
      } else if (mimeType.includes("sheet")) {
        fileType = "spreadsheet";
      }
      
      return {
        id: file.id,
        name: file.name,
        type: fileType,
        mimeType: file.mimeType,
        size: file.size,
        modified: file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : file.modifiedTime,
      };
    });

    // Log search results for debugging
    console.log(`[GoogleDrive] Search for "${query}" returned ${processedFiles.length} results`);
    processedFiles.forEach(f => console.log(`  - ${f.name} (${f.type})`));

    return processedFiles;
  } catch (error) {
    console.error("Error searching Google Drive:", error);
    return [];
  }
}

export async function getGoogleSheetData(fileId: string): Promise<SheetData[]> {
  try {
    const sheets = await getSheetsClient();
    
    // Get all values from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: fileId,
      range: "Sheet1!A:Z",
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    // Use first row as headers
    const headers = rows[0];
    const data: SheetData[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const dataRow: SheetData = {};
      headers.forEach((header: string, index: number) => {
        dataRow[header] = row[index] || "";
      });
      if (Object.values(dataRow).some((v) => v)) {
        data.push(dataRow);
      }
    }

    return data;
  } catch (error) {
    console.error("Error getting Google Sheet data:", error);
    return [];
  }
}

/**
 * Get all sheet sections from a Google Sheets file.
 * Uses gog CLI to export sheet data as CSV (more reliable for Team Drive access).
 * Returns empty array if file is not a Google Sheet or accessible.
 * 
 * @param fileId - The Google Sheets file ID
 * @returns Array of sheet sections with data rows
 */
export async function getAllSheetSections(fileId: string): Promise<SheetSection[]> {
  try {
    // Use gog CLI to list and export sheets from the file
    // First, try to get the file info and detect if it's a sheet
    const listCmd = `export PATH="/opt/homebrew/bin:$PATH" && export GOG_KEYRING_PASSWORD="${GOG_KEYRING_PASSWORD}" && /opt/homebrew/bin/gog drive info "${fileId}" --account=${GOG_ACCOUNT} --json 2>/dev/null || echo "{}"`;
    
    try {
      const { stdout: infoOutput } = await execAsync(listCmd);
      const fileInfo = JSON.parse(infoOutput || "{}");
      
      // Check if it's actually a sheet file by looking at MIME type
      if (fileInfo.mimeType && !fileInfo.mimeType.includes('spreadsheet')) {
        console.log(`[GoogleDrive] File ${fileId} is not a Google Sheet (mimeType: ${fileInfo.mimeType})`);
        return [];
      }
    } catch (e) {
      console.log(`[GoogleDrive] Could not get file info for ${fileId}, continuing with sheet export attempt`);
    }

    // Try to export sheets data using gog
    // Note: gog doesn't directly export sheets, so we use Google Sheets API but with better error handling
    const sheets = await getSheetsClient();
    
    let spreadsheet;
    try {
      spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: fileId,
      });
    } catch (error: any) {
      const errorMsg = error.message || error.toString();
      const code = error.code || 0;
      
      // Check for common errors that indicate it's not a sheet
      if (code === 400 || code === 403 || code === 404 || 
          errorMsg.includes('not found') || 
          errorMsg.includes('Invalid Spreadsheet ID') ||
          errorMsg.includes('This operation is not supported')) {
        console.log(`[GoogleDrive] File ${fileId} is not a readable Google Sheet (${code}: ${errorMsg.split('\n')[0]})`);
        return [];
      }
      
      // For permission errors, log but return empty
      if (errorMsg.includes('permission') || errorMsg.includes('insufficient')) {
        console.log(`[GoogleDrive] Permission denied accessing spreadsheet ${fileId}`);
        return [];
      }
      
      console.error(`[GoogleDrive] Error accessing spreadsheet ${fileId}:`, errorMsg);
      return [];
    }

    const sheetNames = spreadsheet.data.sheets?.map((s: any) => s.properties.title) || [];
    const sections: SheetSection[] = [];

    // Fetch data from each sheet
    for (const sheetName of sheetNames) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: fileId,
          range: `${sheetName}!A:Z`,
        });

        const rows = response.data.values || [];
        if (rows.length === 0) continue;

        const headers = rows[0];
        const data: SheetData[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] || [];
          const dataRow: SheetData = {};
          headers.forEach((header: string, index: number) => {
            dataRow[header] = row[index] || "";
          });
          if (Object.values(dataRow).some((v) => v)) {
            data.push(dataRow);
          }
        }

        if (data.length > 0) {
          sections.push({
            title: sheetName,
            data,
          });
        }
      } catch (sheetError: any) {
        const sheetErrorMsg = (sheetError as any).message || String(sheetError);
        console.warn(`[GoogleDrive] Warning reading sheet ${sheetName}: ${sheetErrorMsg.split('\n')[0]}`);
        continue;
      }
    }

    console.log(`[GoogleDrive] Retrieved ${sections.length} sections from spreadsheet ${fileId}`);
    return sections;
  } catch (error) {
    console.error("[GoogleDrive] Error getting sheet sections:", error);
    return [];
  }
}

export async function findSellerDocuments(
  sellerName: string,
  address?: string
): Promise<DriveFile[]> {
  let results: DriveFile[] = [];

  // Search by seller name
  if (sellerName) {
    const nameResults = await searchGoogleDrive(sellerName);
    results = [...results, ...nameResults];
  }

  // Search by address if provided
  if (address) {
    const addressResults = await searchGoogleDrive(address);
    results = [...results, ...addressResults];
  }

  // Remove duplicates by ID
  const uniqueIds = new Set<string>();
  return results.filter((file) => {
    if (uniqueIds.has(file.id)) return false;
    uniqueIds.add(file.id);
    return true;
  });
}

export async function parseSectionFromSheet(
  data: SheetData[],
  sectionName: string
): Promise<SheetData[]> {
  // Find section start by looking for a row with section name
  const sectionStart = data.findIndex((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(sectionName.toLowerCase())
    )
  );

  if (sectionStart === -1) return [];

  // Extract section data (from section header until next section or end)
  const sectionData: SheetData[] = [];
  for (let i = sectionStart; i < data.length; i++) {
    const row = data[i];
    // Check if this is another section header (marked differently)
    const firstCol = Object.values(row)[0];
    if (
      i > sectionStart &&
      firstCol &&
      String(firstCol).match(/^[A-Z][a-zA-Z\s]+:?$/)
    ) {
      break; // Hit next section
    }
    sectionData.push(row);
  }

  return sectionData;
}
