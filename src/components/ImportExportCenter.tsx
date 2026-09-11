import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle, Database } from 'lucide-react';
import { parseCSV, recordsToCSV } from '../services/sheetsService';

export const ImportExportCenter: React.FC = () => {
  const dataContext = useData();
  const { activeProgramId, isLiveConnected, saveRecord } = dataContext;

  const [selectedModule, setSelectedModule] = useState<string>('courses');
  const [csvText, setCsvText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  const MODULES: { id: string; label: string; sample: Record<string, any> }[] = [
    {
      id: 'courses',
      label: 'Courses Catalog',
      sample: {
        'Program ID': activeProgramId,
        'Course ID': 'CRS_NEW_01',
        'Course Code': 'CS 101',
        'Course Title': 'Introduction to Computing',
        Credits: 3,
        'Length Weeks': 8,
        'Term Placement': 'Semester 1',
        Description: 'Foundations of computational thinking.',
        Active: true,
      },
    },
    {
      id: 'instructors',
      label: 'Faculty & Instructors',
      sample: {
        'Program ID': activeProgramId,
        'Instructor ID': 'INS_NEW_01',
        'Instructor Name': 'Dr. Jane Smith',
        'Instructor Email': 'jsmith@institution.edu',
        Type: 'Full-Time',
        'Target Load': 12,
        'Max Load': 15,
        Credentials: 'Ph.D. Computer Science',
        Active: true,
      },
    },
    {
      id: 'tasks',
      label: 'Operational Tasks',
      sample: {
        'Program ID': activeProgramId,
        'Task ID': 'TSK_NEW_01',
        Title: 'Verify course syllabus standards',
        'Task Scope': 'Course',
        'Course ID': 'CRS_NEW_01',
        'Owner Email': 'jsmith@institution.edu',
        'Due Date': '2026-10-15',
        Status: 'READY',
        Priority: 'Normal',
        Archived: false,
      },
    },
    {
      id: 'plos',
      label: 'Program Learning Outcomes (PLOs)',
      sample: {
        'Program ID': activeProgramId,
        'PLO ID': 'PLO_NEW_01',
        'PLO Number': 'PLO 1',
        'PLO Title': 'Algorithmic Problem Solving',
        'PLO Statement': 'Students apply algorithms to resolve real-world computational bottlenecks.',
        Active: true,
      },
    },
    {
      id: 'advisees',
      label: 'Student Advisees',
      sample: {
        'Program ID': activeProgramId,
        'Advisee ID': 'ADV_NEW_01',
        'Student ID': 'STU99901',
        'Student Name': 'Alex Rivera',
        'Student Email': 'arivera@student.edu',
        'Advisor Name': 'Dr. Jane Smith',
        'Credits Earned': 24,
        GPA: 3.45,
        'Risk Flag': 'None',
        'Graduation Target': 'Spring 2027',
      },
    },
  ];

  const currentMod = MODULES.find(m => m.id === selectedModule) || MODULES[0];

  const handleDownloadTemplate = () => {
    const csvContent = recordsToCSV([currentMod.sample]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentMod.id}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParsePreview = () => {
    try {
      if (!csvText.trim()) {
        setImportStatus('Please paste CSV text or select a file first.');
        return;
      }
      const parsed = parseCSV(csvText);
      if (parsed.length === 0) {
        setImportStatus('No data rows found in CSV.');
        return;
      }
      setParsedRows(parsed);
      setImportStatus(`Successfully parsed ${parsed.length} row(s). Review below before committing.`);
    } catch (err: any) {
      setImportStatus(`Parse error: ${err.message}`);
    }
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0) return;
    try {
      setImportStatus('Importing records into application and Google Sheets...');
      for (const row of parsedRows) {
        // Ensure Program ID is attached
        const recordToSave = {
          ...row,
          'Program ID': row['Program ID'] || activeProgramId,
        };
        await saveRecord(selectedModule, recordToSave);
      }
      setImportStatus(`Successfully committed ${parsedRows.length} record(s)!`);
      setParsedRows([]);
      setCsvText('');
    } catch (err: any) {
      setImportStatus(`Import failed: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      setCsvText(content || '');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
          <span>Import & CSV Management Center</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Bulk import catalog courses, faculty rosters, outcome matrices, and student records via standard CSV.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Module Selection & Template */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">1. Select Target Module</h3>

          <div className="space-y-1.5">
            {MODULES.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModule(m.id);
                  setParsedRows([]);
                  setImportStatus(null);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition text-left ${
                  selectedModule === m.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>{m.label}</span>
                <span className="text-[10px] uppercase text-slate-400 font-bold">{m.id}</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">CSV Template</h4>
            <p className="text-[11px] text-slate-500">
              Download pre-formatted template with verified column headers and data types.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {currentMod.label} Template</span>
            </button>
          </div>
        </div>

        {/* Right: Paste or Upload CSV */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">2. Upload or Paste CSV Data</h3>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose .csv File</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="Paste raw CSV text here, or select a file above..."
            rows={7}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleParsePreview}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              Parse & Preview Rows
            </button>

            {parsedRows.length > 0 && (
              <button
                onClick={handleCommitImport}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
              >
                Commit {parsedRows.length} Rows to Database
              </button>
            )}
          </div>

          {importStatus && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                importStatus.includes('error') || importStatus.includes('failed')
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {importStatus}
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800">Preview Parsed Records ({parsedRows.length})</h4>
              <div className="max-h-60 overflow-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      {Object.keys(parsedRows[0]).map(h => (
                        <th key={h} className="p-2 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="p-2 whitespace-nowrap text-slate-600">
                            {String(val ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
