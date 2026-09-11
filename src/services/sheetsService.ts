import { SheetModule } from '../types';

export const SHEETS_MAP: Record<SheetModule, string> = {
  users: 'USERS',
  programs: 'PROGRAMS',
  access: 'PROGRAM_ACCESS',
  terms: 'TERMS',
  courses: 'COURSES',
  instructors: 'INSTRUCTOR_ROSTER',
  assignments: 'COURSE_ASSIGNMENTS',
  components: 'ASSIGNMENT_COMPONENTS',
  calendar: 'ACADEMIC_CALENDAR',
  tasks: 'TASKS',
  tasktemplates: 'TASK_TEMPLATES',
  recurring: 'RECURRING_TASK_RULES',
  advisees: 'ADVISEES',
  advising: 'ADVISING_NOTES',
  plos: 'PLOS',
  clos: 'COURSE_CLOS',
  courseplos: 'COURSE_PLO_MAP',
  cloassessments: 'CLO_ASSESSMENT_MAP',
  activities: 'COURSE_ACTIVITIES',
  assessments: 'ASSESSMENTS',
  improvement: 'CONTINUOUS_IMPROVEMENT',
  improvements: 'CONTINUOUS_IMPROVEMENT',
  bodies: 'ACCREDITATION_BODIES',
  accreditation: 'ACCREDITATION_EVIDENCE',
  credentials: 'CREDENTIALS',
  portfolio: 'PORTFOLIO_PLAYBOOK',
  workforce: 'WORKFORCE_ADVISORY',
  features: 'PROGRAM_FEATURES',
};

export const SCHEMAS: Record<string, string[]> = {
  USERS: ['User ID', 'Email', 'Display Name', 'Global Role', 'Active', 'Created At', 'Updated At'],
  PROGRAMS: ['Program ID', 'Program Name', 'Program Code', 'Division', 'CIP', 'Status', 'Dean Email', 'Created At', 'Updated At'],
  PROGRAM_ACCESS: ['Access ID', 'Program ID', 'User Email', 'Program Role', 'Default Program', 'Active', 'Created At', 'Updated At'],
  TERMS: ['Term ID', 'Term Name', 'Academic Year', 'Start Date', 'End Date', 'Status'],
  COURSES: ['Course ID', 'Program ID', 'Course Code', 'Course Title', 'Credits', 'Term Placement', 'Length Weeks', 'Description', 'Active', 'Created At', 'Updated At'],
  INSTRUCTOR_ROSTER: ['Instructor ID', 'Program ID', 'Instructor Name', 'Instructor Email', 'Active', 'Notes', 'Created At', 'Updated At'],
  COURSE_ASSIGNMENTS: ['Assignment ID', 'Program ID', 'Term ID', 'Course ID', 'Section', 'Delivery Label', 'Modality', 'Part of Term', 'Instructor Email', 'Start Date', 'End Date', 'Status', 'Created At', 'Updated At'],
  ASSIGNMENT_COMPONENTS: ['Component ID', 'Assignment ID', 'Program ID', 'Component Type', 'Instructor Email', 'Modality', 'Meeting Details', 'Active', 'Created At', 'Updated At'],
  ACADEMIC_CALENDAR: ['Calendar ID', 'Program ID', 'Scope', 'Title', 'Category', 'Start Date', 'End Date', 'All Day', 'Description', 'Source', 'Status', 'Created At', 'Updated At'],
  TASKS: ['Task ID', 'Program ID', 'Term ID', 'Course ID', 'Assignment ID', 'Owner Email', 'Task Scope', 'Task Type', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Evidence URL', 'Blocked Reason', 'Generated', 'Archived', 'Recurring Rule ID', 'Recurrence Date', 'Template ID', 'Created At', 'Updated At'],
  TASK_TEMPLATES: ['Template ID', 'Program ID', 'Template Name', 'Task Scope', 'Task Type', 'Title', 'Description', 'Default Priority', 'Repeat Type', 'Default Day', 'Applies To', 'Part of Term', 'Active', 'Created At', 'Updated At'],
  RECURRING_TASK_RULES: ['Rule ID', 'Program ID', 'Task Scope', 'Term ID', 'Course ID', 'Owner Email', 'Template ID', 'Title', 'Description', 'Frequency', 'Interval', 'Day of Week', 'Start Date', 'End Date', 'Priority', 'Status', 'Active', 'Last Generated Through', 'Created At', 'Updated At'],
  ADVISEES: ['Student ID', 'Program ID', 'Student Name', 'Student Email', 'Status', 'Expected Graduation', 'Risk Flag', 'Next Follow-Up', 'Notes', 'Created At', 'Updated At'],
  ADVISING_NOTES: ['Note ID', 'Program ID', 'Student ID', 'Date', 'Author Email', 'Topic', 'Summary', 'Action Plan', 'Follow-Up Date', 'Sensitivity', 'Created At', 'Updated At'],
  PLOS: ['PLO ID', 'Program ID', 'PLO Number', 'PLO Title', 'PLO Statement', 'Active', 'Created At', 'Updated At'],
  COURSE_CLOS: ['CLO ID', 'Program ID', 'Course ID', 'CLO Number', 'CLO Statement', 'Assessment Method', 'Source / Approval', 'Status', 'Created At', 'Updated At'],
  COURSE_PLO_MAP: ['Mapping ID', 'Program ID', 'Course ID', 'PLO ID', 'Development Level', 'Assessment Role', 'Notes', 'Created At', 'Updated At'],
  CLO_ASSESSMENT_MAP: ['Mapping ID', 'Program ID', 'Course ID', 'CLO ID', 'Assessment Name', 'Development Level', 'Assessment Role', 'Assessment Type', 'Evidence URL', 'Notes', 'Active', 'Created At', 'Updated At'],
  COURSE_ACTIVITIES: ['Activity ID', 'Program ID', 'Course ID', 'Week', 'Activity Name', 'Category', 'Grade Category', 'Grade Weight', 'Graded', 'Individual/Group', 'Major/Minor', 'CLOs Supported', 'Applied AI', 'Portfolio Artifact', 'Credential Connection', 'Assessment Use', 'Evidence Available', 'Notes', 'Active', 'Created At', 'Updated At'],
  ASSESSMENTS: ['Assessment ID', 'Program ID', 'Course ID', 'PLO ID', 'Measure', 'Benchmark', 'Result', 'Finding', 'Action Needed', 'Status', 'Rubric URL', 'Evidence URL', 'Created At', 'Updated At'],
  CONTINUOUS_IMPROVEMENT: ['Improvement ID', 'Program ID', 'Source ID', 'Issue/Finding', 'Action', 'Owner Email', 'Target Date', 'Status', 'Evidence URL', 'Created At', 'Updated At'],
  ACCREDITATION_BODIES: ['Body ID', 'Program ID', 'Body / Framework', 'Type', 'Required', 'Review Cycle', 'Next Review Date', 'Standards URL', 'Primary Contact', 'Status', 'Notes', 'Created At', 'Updated At'],
  ACCREDITATION_EVIDENCE: ['Evidence ID', 'Program ID', 'Course ID', 'Bodies / Frameworks', 'Requirement / Standard', 'Evidence Type', 'Title', 'Description', 'Owner Email', 'Due Date', 'Status', 'Evidence URL', 'Review Date', 'Report Tags', 'Created At', 'Updated At'],
  CREDENTIALS: ['Credential ID', 'Program ID', 'Course ID', 'Credential Name', 'Family', 'Provider', 'Classification', 'Required/Optional', 'Cost', 'Status', 'URL', 'Created At', 'Updated At'],
  PORTFOLIO_PLAYBOOK: ['Artifact ID', 'Program ID', 'Course ID', 'Artifact Title', 'Knowledge Area', 'Crosscutting Concepts', 'Artifact URL', 'Credential Evidence', 'AI Evidence', 'Status', 'Created At', 'Updated At'],
  WORKFORCE_ADVISORY: ['Record ID', 'Program ID', 'Type', 'Organization / Source', 'Title', 'Date', 'Finding / Recommendation', 'Action', 'Owner Email', 'Status', 'Evidence URL', 'Created At', 'Updated At'],
  PROGRAM_FEATURES: ['Feature ID', 'Program ID', 'Feature Key', 'Feature Label', 'Enabled', 'Notes', 'Created At', 'Updated At'],
};

export const ID_PREFIXES: Record<string, string> = {
  users: 'USR',
  programs: 'PRG',
  access: 'ACC',
  terms: 'TRM',
  courses: 'CRS',
  instructors: 'INS',
  assignments: 'ASN',
  components: 'CMP',
  calendar: 'CAL',
  tasks: 'TSK',
  tasktemplates: 'TPL',
  recurring: 'RCR',
  advisees: 'ADV',
  advising: 'ADN',
  plos: 'PLO',
  clos: 'CLO',
  courseplos: 'CPM',
  cloassessments: 'CAM',
  activities: 'ACT',
  assessments: 'ASM',
  improvement: 'CIP',
  bodies: 'ACB',
  accreditation: 'ACE',
  credentials: 'CRD',
  portfolio: 'ART',
  workforce: 'WFA',
  features: 'FTR',
};

export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export interface SheetMetadata {
  id: string;
  title: string;
  tabs: string[];
}

export async function fetchSpreadsheetMetadata(spreadsheetId: string, accessToken: string): Promise<SheetMetadata> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties.title`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to access Google Sheet (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  const tabs = (data.sheets || []).map((s: { properties: { title: string } }) => s.properties.title);
  return {
    id: data.spreadsheetId,
    title: data.properties?.title || 'Academic Operations Spreadsheet',
    tabs,
  };
}

export async function batchFetchAllSheets(
  spreadsheetId: string,
  accessToken: string,
  tabNames: string[]
): Promise<Record<string, Record<string, any>[]>> {
  if (!tabNames.length) return {};

  const rangeParams = tabNames.map(name => `ranges=${encodeURIComponent(`${name}!A1:Z`)}`).join('&');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangeParams}&majorDimension=ROWS`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to batch fetch sheets: ${res.statusText}`);
  }

  const result = await res.json();
  const output: Record<string, Record<string, any>[]> = {};

  (result.valueRanges || []).forEach((vr: { range: string; values?: any[][] }, idx: number) => {
    const tabName = tabNames[idx] || vr.range.split('!')[0].replace(/'/g, '');
    const values = vr.values || [];
    if (values.length < 2) {
      output[tabName] = [];
      return;
    }

    const headers: string[] = values[0].map((h: any) => String(h || '').trim());
    const rows = values.slice(1).map(rowValues => {
      const obj: Record<string, any> = {};
      headers.forEach((h, colIdx) => {
        if (h) {
          obj[h] = rowValues[colIdx] !== undefined ? rowValues[colIdx] : '';
        }
      });
      return obj;
    }).filter(r => Object.values(r).some(v => v !== ''));

    output[tabName] = rows;
  });

  return output;
}

export async function createNewSpreadsheet(
  title: string,
  accessToken: string,
  initialDataMap?: Record<string, Record<string, any>[]>
): Promise<{ id: string; url: string }> {
  // 1. Create spreadsheet with all required tabs
  const sheetsPayload = Object.entries(SCHEMAS).map(([sheetName]) => ({
    properties: {
      title: sheetName,
      gridProperties: {
        frozenRowCount: 1,
      },
    },
  }));

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: title || 'Program Operations & Academic Quality Database' },
      sheets: sheetsPayload,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Google Spreadsheet: ${err}`);
  }

  const created = await res.json();
  const spreadsheetId = created.spreadsheetId;

  // 2. Populate headers and any initial seed data via batchUpdate values
  const dataPayload = Object.entries(SCHEMAS).map(([sheetName, headers]) => {
    const rows = initialDataMap?.[sheetName] || [];
    const tableData: any[][] = [headers];
    rows.forEach(r => {
      tableData.push(headers.map(h => r[h] !== undefined ? r[h] : ''));
    });

    return {
      range: `${sheetName}!A1`,
      values: tableData,
    };
  });

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: dataPayload,
    }),
  });

  return {
    id: spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}

export async function appendRow(
  spreadsheetId: string,
  sheetName: string,
  rowObj: Record<string, any>,
  accessToken: string
): Promise<void> {
  const schema = SCHEMAS[sheetName] || Object.keys(rowObj);
  const rowValues = schema.map(k => rowObj[k] !== undefined ? rowObj[k] : '');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to append row to ${sheetName}: ${res.statusText}`);
  }
}

export async function updateRow(
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number, // 1-based index including header (so row 2 is index 2)
  rowObj: Record<string, any>,
  accessToken: string
): Promise<void> {
  const schema = SCHEMAS[sheetName] || Object.keys(rowObj);
  const rowValues = schema.map(k => rowObj[k] !== undefined ? rowObj[k] : '');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A${rowIndex}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to update row in ${sheetName}: ${res.statusText}`);
  }
}

export async function deleteRow(
  spreadsheetId: string,
  sheetIdNum: number,
  rowIndex0Based: number,
  accessToken: string
): Promise<void> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetIdNum,
              dimension: 'ROWS',
              startIndex: rowIndex0Based,
              endIndex: rowIndex0Based + 1,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to delete row in sheet: ${res.statusText}`);
  }
}

/**
 * Robust CSV parser that handles quotes, commas, and multiline values.
 */
export function parseCSV(csvText: string): Record<string, any>[] {
  const lines: string[] = [];
  let currentLine = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = '';
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++;
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  if (lines.length === 0) return [];

  const splitLine = (line: string): string[] => {
    const fields: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        if (inQuote && line[j + 1] === '"') {
          cur += '"';
          j++;
        } else {
          inQuote = !inQuote;
        }
      } else if (c === ',' && !inQuote) {
        fields.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    fields.push(cur.trim());
    return fields;
  };

  const headers = splitLine(lines[0]);
  const records: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    if (cols.length === 0 || cols.every(c => c === '')) continue;
    const rec: Record<string, any> = {};
    headers.forEach((h, idx) => {
      let val: any = cols[idx] !== undefined ? cols[idx] : '';
      if (val === 'true') val = true;
      if (val === 'false') val = false;
      rec[h] = val;
    });
    records.push(rec);
  }

  return records;
}

/**
 * Serializes records to standard comma-separated values CSV format.
 */
export function recordsToCSV(records: Record<string, any>[]): string {
  if (!records || records.length === 0) return '';
  const headers = Object.keys(records[0]);
  const rows = [headers.join(',')];

  records.forEach(r => {
    const vals = headers.map(h => {
      let v = r[h];
      if (v === undefined || v === null) v = '';
      const str = String(v);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    rows.push(vals.join(','));
  });

  return rows.join('\n');
}
