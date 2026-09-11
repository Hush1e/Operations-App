/**
 * Multi-Sheet Document Fetcher & Parser
 * Handles retrieving multiple sheets from:
 * 1. Google Sheets URL or ID (via Google Sheets API or Google Sheets XLSX export)
 * 2. Uploaded Excel files (.xlsx, .xls)
 * 3. Sample multi-sheet academic workbook
 */

import * as XLSX from 'xlsx';
import { extractSpreadsheetId, fetchSpreadsheetMetadata, batchFetchAllSheets } from './sheetsService';
import { getAccessToken } from './authService';
import { SAMPLE_MULTI_SHEET_WORKBOOK, RawWorkbookSheet } from './sampleMultiSheetDocument';

export interface FetchResult {
  sourceTitle: string;
  sourceType: 'google_sheets' | 'excel_upload' | 'sample_data';
  sheets: RawWorkbookSheet[];
}

/**
 * Parses an ArrayBuffer (from Google Sheets XLSX export or file upload) using XLSX
 */
export function parseWorkbookBuffer(buffer: ArrayBuffer, sourceTitle: string): FetchResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheets: RawWorkbookSheet[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    if (!rawData || rawData.length === 0) continue;

    const headerRow = rawData[0] || [];
    const headers: string[] = headerRow.map((h: any) => String(h || '').trim()).filter((h: string) => h.length > 0);

    if (headers.length === 0) continue;

    const dataRows = rawData.slice(1);
    const rows: Record<string, any>[] = [];

    for (const r of dataRows) {
      if (!Array.isArray(r)) continue;
      const rowObj: Record<string, any> = {};
      let hasAnyValue = false;

      headers.forEach((hdr, colIdx) => {
        const val = r[colIdx];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          rowObj[hdr] = val;
          hasAnyValue = true;
        } else {
          rowObj[hdr] = '';
        }
      });

      if (hasAnyValue) {
        rows.push(rowObj);
      }
    }

    sheets.push({
      sheetName,
      headers,
      rows,
    });
  }

  return {
    sourceTitle,
    sourceType: 'excel_upload',
    sheets,
  };
}

/**
 * Fetches and parses a Google Spreadsheet at a given URL or ID.
 * Tries Google Sheets authenticated API first, falls back to Google Docs public export,
 * and if neither works (e.g. offline/cors), gives a descriptive instruction.
 */
export async function fetchGoogleSpreadsheetMultiSheets(urlOrId: string): Promise<FetchResult> {
  const cleanId = extractSpreadsheetId(urlOrId);
  if (!cleanId) {
    throw new Error('Please enter a valid Google Sheets URL or Spreadsheet ID.');
  }

  const token = await getAccessToken();

  // Method A: If user has an active Google OAuth token, use the official Sheets API v4
  if (token) {
    try {
      const metadata = await fetchSpreadsheetMetadata(cleanId, token);
      const batchData = await batchFetchAllSheets(cleanId, token, metadata.tabs);

      const sheets: RawWorkbookSheet[] = metadata.tabs.map(tabName => {
        const rows = batchData[tabName] || [];
        const headersSet = new Set<string>();
        rows.forEach(r => Object.keys(r).forEach(k => headersSet.add(k)));
        return {
          sheetName: tabName,
          headers: Array.from(headersSet),
          rows,
        };
      });

      return {
        sourceTitle: metadata.title || 'Google Spreadsheet',
        sourceType: 'google_sheets',
        sheets: sheets.filter(s => s.headers.length > 0 || s.rows.length > 0),
      };
    } catch (apiErr) {
      console.warn('Google Sheets API token attempt failed, attempting direct export fallback...', apiErr);
    }
  }

  // Method B: Public Google Sheets XLSX export download endpoint
  // Works when the user set sharing to "Anyone with the link can view"
  const exportUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/export?format=xlsx`;
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(exportUrl, { headers });
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const parsed = parseWorkbookBuffer(arrayBuffer, `Google Spreadsheet (${cleanId.substring(0, 8)}...)`);
      parsed.sourceType = 'google_sheets';
      if (parsed.sheets.length > 0) {
        return parsed;
      }
    }
  } catch (exportErr) {
    console.warn('Google Sheets export endpoint fetch error:', exportErr);
  }

  throw new Error(
    'Unable to access this Google Sheet automatically. Please ensure either:\n' +
    '1. The Google Sheet sharing is set to "Anyone with the link can view", OR\n' +
    '2. You have signed in with your Google Workspace account via the top-right button, OR\n' +
    '3. Download the Google Sheet as an Excel (.xlsx) file and upload it directly.'
  );
}

/**
 * Loads the built-in demo sample workbook
 */
export function loadSampleWorkbook(): FetchResult {
  return {
    sourceTitle: 'Hocking College — Cybersecurity Academic Master Tracker (Demo)',
    sourceType: 'sample_data',
    sheets: SAMPLE_MULTI_SHEET_WORKBOOK,
  };
}
