/**
 * Smart Spreadsheet Sifter & Multi-Sheet Importer Modal
 * Enables program directors to point to an existing Google Spreadsheet or Excel workbook
 * with multiple unrelated sheets, automatically sifts what goes where, maps columns,
 * previews records, and imports everything into the program with 1 click.
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Upload,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Check,
  X,
  FileCheck,
  FolderSync,
  HelpCircle
} from 'lucide-react';
import { useData } from '../services/dataContext';
import { SheetModule } from '../types';
import {
  SIFT_PROFILES,
  SiftedTab,
  siftSingleSheet,
  transformSiftedRecords
} from '../services/smartSheetSifter';
import {
  fetchGoogleSpreadsheetMultiSheets,
  parseWorkbookBuffer,
  loadSampleWorkbook
} from '../services/multiSheetFetcher';

interface SmartSpreadsheetSifterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSpreadsheetUrl?: string;
}

type Step = 'CONNECT' | 'REVIEW' | 'IMPORTING' | 'SUCCESS';

export const SmartSpreadsheetSifterModal: React.FC<SmartSpreadsheetSifterModalProps> = ({
  isOpen,
  onClose,
  initialSpreadsheetUrl = '',
}) => {
  const {
    programs,
    activeProgramId,
    batchImportSiftedData,
    user,
    signIn
  } = useData();

  const [step, setStep] = useState<Step>('CONNECT');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(initialSpreadsheetUrl);
  const [targetProgramId, setTargetProgramId] = useState(activeProgramId);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sifted data state
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [siftedTabs, setSiftedTabs] = useState<SiftedTab[]>([]);
  const [expandedTabIdx, setExpandedTabIdx] = useState<number | null>(0);

  // Import completion stats
  const [importStats, setImportStats] = useState<{
    totalAdded: number;
    breakdown: Record<string, number>;
  } | null>(null);

  if (!isOpen) return null;

  // Handle Scanning Document
  const handleScanDocument = async (customUrl?: string) => {
    const urlToUse = (customUrl !== undefined ? customUrl : spreadsheetUrl).trim();
    if (!urlToUse) {
      setErrorMessage('Please enter a Google Spreadsheet URL or document ID.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await fetchGoogleSpreadsheetMultiSheets(urlToUse);
      processFetchedSheets(result.sourceTitle, result.sheets);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read Google Spreadsheet.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load Built-in Demo Sample Document
  const handleLoadSampleData = () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const sampleResult = loadSampleWorkbook();
      processFetchedSheets(sampleResult.sourceTitle, sampleResult.sheets);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load sample multi-sheet document.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Excel File Upload (.xlsx / .xls)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseWorkbookBuffer(buffer, file.name);
      if (parsed.sheets.length === 0) {
        throw new Error('No valid sheets or tables found in the uploaded file.');
      }
      processFetchedSheets(parsed.sourceTitle, parsed.sheets);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse Excel file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process and Sift Fetched Sheets
  const processFetchedSheets = (title: string, rawSheets: { sheetName: string; headers: string[]; rows: Record<string, any>[] }[]) => {
    const sifted: SiftedTab[] = rawSheets.map(s => siftSingleSheet(s.sheetName, s.headers, s.rows));
    setDocumentTitle(title);
    setSiftedTabs(sifted);
    setStep('REVIEW');
    setExpandedTabIdx(0);
  };

  // Tab classification change handler
  const handleClassificationChange = (tabIdx: number, newModule: SheetModule | 'ignore') => {
    setSiftedTabs(prev => {
      const updated = [...prev];
      const targetTab = { ...updated[tabIdx] };
      targetTab.detectedModule = newModule;

      if (newModule === 'ignore') {
        targetTab.enabled = false;
      } else {
        targetTab.enabled = true;
        // Re-sift columns for newly selected module
        const profile = SIFT_PROFILES.find(p => p.module === newModule);
        if (profile) {
          const newMappings: Record<string, string> = {};
          profile.columns.forEach(colDef => {
            const match = targetTab.rawHeaders.find(h =>
              colDef.synonyms.some(s => h.toLowerCase().includes(s.toLowerCase()))
            );
            if (match) newMappings[colDef.field] = match;
          });
          targetTab.columnMappings = newMappings;
        }
      }

      updated[tabIdx] = targetTab;
      return updated;
    });
  };

  // Column mapping change handler
  const handleColumnMappingChange = (tabIdx: number, destField: string, srcCol: string) => {
    setSiftedTabs(prev => {
      const updated = [...prev];
      const targetTab = { ...updated[tabIdx] };
      targetTab.columnMappings = {
        ...targetTab.columnMappings,
        [destField]: srcCol,
      };
      updated[tabIdx] = targetTab;
      return updated;
    });
  };

  // Toggle Tab Enabled
  const handleToggleTabEnabled = (tabIdx: number) => {
    setSiftedTabs(prev => {
      const updated = [...prev];
      updated[tabIdx] = {
        ...updated[tabIdx],
        enabled: !updated[tabIdx].enabled,
      };
      return updated;
    });
  };

  // Commit & Execute Import
  const handleExecuteImport = async () => {
    const enabledTabs = siftedTabs.filter(t => t.enabled && t.detectedModule !== 'ignore');
    if (enabledTabs.length === 0) {
      setErrorMessage('Please select at least one sheet tab to import.');
      return;
    }

    setStep('IMPORTING');
    setIsLoading(true);

    try {
      const payloads = enabledTabs.map(tab => transformSiftedRecords(tab, targetProgramId));
      const stats = await batchImportSiftedData(payloads);
      setImportStats(stats);
      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete import process.');
      setStep('REVIEW');
    } finally {
      setIsLoading(false);
    }
  };

  const activeProgram = programs.find(p => p['Program ID'] === targetProgramId) || programs[0];
  const enabledCount = siftedTabs.filter(t => t.enabled && t.detectedModule !== 'ignore').length;
  const totalRowsReady = siftedTabs
    .filter(t => t.enabled && t.detectedModule !== 'ignore')
    .reduce((acc, t) => acc + t.totalRows, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="smart-sifter-modal"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-400/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold tracking-tight">Smart Spreadsheet Sifter & Importer</h2>
                <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-medium border border-indigo-400/30">
                  Automated Multi-Tab Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Point to an existing multi-sheet Google Doc or Excel file — we intuitively classify what goes where.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between max-w-xl mx-auto px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs font-semibold text-slate-500">
            <div className={`flex items-center space-x-1.5 ${step === 'CONNECT' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'CONNECT' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                1
              </div>
              <span>Provide Location</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <div className={`flex items-center space-x-1.5 ${step === 'REVIEW' ? 'text-indigo-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'REVIEW' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                2
              </div>
              <span>Review Sifted Tabs</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <div className={`flex items-center space-x-1.5 ${step === 'SUCCESS' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === 'SUCCESS' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                3
              </div>
              <span>Populate Program</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 whitespace-pre-line">{errorMessage}</div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 1: CONNECT DOCUMENT */}
          {step === 'CONNECT' && (
            <div className="space-y-6">
              {/* Main Google Sheet Input Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center space-x-3 text-slate-900 font-semibold">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Google Sheets Document Location</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paste the link or document ID of your department's existing Google Sheet. Our system will scan every tab, detect headers, and map them to curriculum, faculty, schedules, PLOs, and tasks.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Google Spreadsheet URL or ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={spreadsheetUrl}
                      onChange={e => setSpreadsheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden font-mono"
                    />
                    <button
                      onClick={() => handleScanDocument()}
                      disabled={isLoading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-semibold flex items-center space-x-2 transition-colors shadow-2xs"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sifting Tabs...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Scan & Sift</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Google Account Status Badge */}
                <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>
                      {user ? (
                        <>Signed in as <strong className="text-slate-700">{user.email}</strong></>
                      ) : (
                        <>Public links supported • Or sign in to access private domain sheets</>
                      )}
                    </span>
                  </div>
                  {!user && (
                    <button
                      onClick={() => signIn()}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
                    >
                      Sign In with Google
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Action Alternatives Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Try Sample Workbook Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2 text-indigo-700 font-semibold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Try Demo Multi-Sheet Workbook</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Don't have an external Google Sheet right now? Test the engine with an authentic 6-tab departmental workbook (Course Catalog, Faculty Roster, Fall Schedule, PLOs, Advisees, and Action Items).
                    </p>
                  </div>
                  <button
                    onClick={handleLoadSampleData}
                    disabled={isLoading}
                    className="mt-4 w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors border border-indigo-200"
                  >
                    <span>Load Demo Academic Workbook</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Upload Excel Workbook (.xlsx) Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2 text-emerald-700 font-semibold text-sm">
                      <Upload className="w-4 h-4" />
                      <span>Upload Local Excel (.xlsx / .xls)</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Have a local Excel workbook with multiple tabs on your computer? Upload it directly and the sifter will analyze and classify all sheets instantly.
                    </p>
                  </div>
                  <label className="mt-4 w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors border border-emerald-200 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Multi-Sheet Excel File</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-950">How Does Intelligent Sifting Work?</p>
                  <p className="text-amber-800 leading-relaxed">
                    You do not need to rename your tabs or columns. The engine uses semantic heuristics to look at tab titles, header synonyms, and sample data values (e.g. course numbers, credit hours, email addresses, and due dates). You will be able to review and customize all mappings before anything is imported.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW SIFTED TABS & MAPPINGS */}
          {step === 'REVIEW' && (
            <div className="space-y-5">
              {/* Document Summary & Target Program Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">{documentTitle}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Found <strong>{siftedTabs.length}</strong> sheets • <strong>{enabledCount}</strong> active for import ({totalRowsReady} total rows)
                  </p>
                </div>

                {/* Target Program Selector */}
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-600 shrink-0">
                    Import Into Program:
                  </label>
                  <select
                    value={targetProgramId}
                    onChange={e => setTargetProgramId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    {programs.map(p => (
                      <option key={p['Program ID']} value={p['Program ID']}>
                        {p['Program Name']} ({p['Program Code']})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sifted Tabs List */}
              <div className="space-y-3">
                {siftedTabs.map((tab, idx) => {
                  const isExpanded = expandedTabIdx === idx;
                  const profile = SIFT_PROFILES.find(p => p.module === tab.detectedModule);

                  return (
                    <div
                      key={tab.sheetName}
                      className={`bg-white rounded-xl border transition-all shadow-2xs overflow-hidden ${
                        tab.enabled ? 'border-slate-300' : 'border-slate-200 opacity-60 bg-slate-50/50'
                      }`}
                    >
                      {/* Tab Header Row */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left: Checkbox + Name + Badge */}
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={tab.enabled}
                            onChange={() => handleToggleTabEnabled(idx)}
                            className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {tab.sheetName}
                              </span>
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                                {tab.totalRows} {tab.totalRows === 1 ? 'row' : 'rows'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1.5">
                              <span>{tab.reasoning}</span>
                            </p>
                          </div>
                        </div>

                        {/* Right: Detected Module Selector + Expand toggle */}
                        <div className="flex items-center space-x-3 self-end sm:self-center">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs text-slate-400 font-medium">Classify as:</span>
                            <select
                              value={tab.detectedModule}
                              onChange={e => handleClassificationChange(idx, e.target.value as SheetModule | 'ignore')}
                              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-hidden ${
                                tab.detectedModule === 'ignore'
                                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              }`}
                            >
                              <option value="ignore">— Skip This Tab —</option>
                              {SIFT_PROFILES.map(p => (
                                <option key={p.module} value={p.module}>
                                  {p.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => setExpandedTabIdx(isExpanded ? null : idx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Inspect column mappings and sample data"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section: Column Mappings & Sample Rows */}
                      {isExpanded && tab.detectedModule !== 'ignore' && profile && (
                        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 space-y-4 text-xs">
                          {/* Column Mapping Matrix */}
                          <div>
                            <div className="font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Column Header Sifting & Alignment:</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                              {profile.columns.map(colDef => {
                                const mappedSrc = tab.columnMappings[colDef.field] || '';
                                return (
                                  <div
                                    key={colDef.field}
                                    className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between text-slate-700 font-semibold">
                                      <span>{colDef.label}</span>
                                      {colDef.required && (
                                        <span className="text-[10px] text-rose-600 bg-rose-50 px-1 rounded-sm">
                                          Required
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                      <span className="text-slate-400">mapped to:</span>
                                      <select
                                        value={mappedSrc}
                                        onChange={e => handleColumnMappingChange(idx, colDef.field, e.target.value)}
                                        className="flex-1 bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-slate-800 font-medium"
                                      >
                                        <option value="">— Not Mapped (Use Default) —</option>
                                        {tab.rawHeaders.map(hdr => (
                                          <option key={hdr} value={hdr}>
                                            "{hdr}"
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Sample Rows Data Preview */}
                          {tab.sampleRows.length > 0 && (
                            <div>
                              <div className="font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Sample Rows (Source Data Preview):</span>
                              </div>
                              <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                                <table className="w-full text-left border-collapse text-[11px]">
                                  <thead>
                                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                                      {tab.rawHeaders.slice(0, 6).map(h => (
                                        <th key={h} className="p-2 border-r border-slate-200 last:border-r-0">
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tab.sampleRows.slice(0, 3).map((r, rIdx) => (
                                      <tr key={rIdx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                                        {tab.rawHeaders.slice(0, 6).map(h => (
                                          <td key={h} className="p-2 border-r border-slate-100 last:border-r-0 text-slate-800 max-w-[200px] truncate">
                                            {String(r[h] || '—')}
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: IMPORTING STATE */}
          {step === 'IMPORTING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Transforming & Importing Data...</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Synthesizing primary keys, applying column alignments, and associating records with {activeProgram['Program Name']}.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 'SUCCESS' && importStats && (
            <div className="py-8 space-y-6 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Multi-Sheet Import Complete!</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Successfully imported <strong>{importStats.totalAdded} total records</strong> into{' '}
                  <span className="font-semibold text-indigo-600">{activeProgram['Program Name']}</span>.
                </p>
              </div>

              {/* Breakdown Grid */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs text-left">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
                  Imported Record Breakdown:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(importStats.breakdown).map(([mod, count]) => {
                    const prof = SIFT_PROFILES.find(p => p.module === mod);
                    return (
                      <div key={mod} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                        <span className="text-slate-700 font-medium">{prof?.label || mod}:</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          +{count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-2xs"
                >
                  Return to Workspaces
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          {step === 'CONNECT' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleScanDocument()}
                disabled={isLoading || !spreadsheetUrl.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-lg flex items-center space-x-2 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'REVIEW' && (
            <>
              <button
                onClick={() => setStep('CONNECT')}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isLoading || enabledCount === 0}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-2xs"
              >
                <Check className="w-4 h-4" />
                <span>Import Sifted Data ({enabledCount} Sheets, {totalRowsReady} Rows)</span>
              </button>
            </>
          )}

          {step === 'SUCCESS' && (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
