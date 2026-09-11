import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import {
  Database,
  X,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Link2,
} from 'lucide-react';

interface SpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpreadsheetModal: React.FC<SpreadsheetModalProps> = ({ isOpen, onClose }) => {
  const {
    spreadsheetId,
    spreadsheetTitle,
    isLiveConnected,
    connectExistingSheet,
    createNewSpreadsheetDatabase,
    disconnectSheet,
    refreshFromSheet,
    user,
    signIn,
  } = useData();

  const [inputUrlOrId, setInputUrlOrId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!inputUrlOrId.trim()) {
      setStatusMessage('Please enter a Google Sheet URL or ID.');
      return;
    }
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      await connectExistingSheet(inputUrlOrId.trim());
      setStatusMessage('Connected successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage(`Connection failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateNew = async () => {
    if (!user) {
      alert('Please connect your Google account first so the sheet can be created in your Drive.');
      await signIn();
      return;
    }
    setIsProcessing(true);
    setStatusMessage('Creating all 28 relational tabs in Google Drive and seeding data...');
    try {
      const newId = await createNewSpreadsheetDatabase('Academic Operations Database');
      setStatusMessage('Created and connected successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage(`Creation error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Google Sheets Backend Database</h2>
              <p className="text-xs text-slate-300">Direct REST API integration without Apps Script latency.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs text-slate-600">
          {/* Current Status Card */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isLiveConnected
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="space-y-0.5">
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isLiveConnected ? 'Connected to Google Sheets' : 'Local Demo Storage'}
              </div>
              <div className="text-[11px] text-slate-600">
                {isLiveConnected
                  ? `${spreadsheetTitle} (28 schema tabs linked)`
                  : 'Operating with local browser cache. Connect or create a Sheet to sync directly.'}
              </div>
            </div>

            {isLiveConnected && spreadsheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-semibold shadow-2xs hover:bg-emerald-50"
              >
                <span>Open Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Option 1: Connect Existing Sheet */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Option A: Connect Existing Google Sheet
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Paste the URL or ID of your existing Program Operations spreadsheet:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/... or Sheet ID"
                value={inputUrlOrId}
                onChange={e => setInputUrlOrId(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleConnect}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition disabled:opacity-50"
              >
                Connect
              </button>
            </div>
          </div>

          {/* Option 2: 1-Click Create New Database Sheet */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Option B: Create Fresh Academic Database in Google Drive
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Instantly create a brand new Google Sheet in your Google Drive configured with all 28 relational database tabs, formatted headers, and initial program data.
            </p>
            <button
              onClick={handleCreateNew}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold shadow transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>1-Click Create Academic Database Sheet in Drive</span>
            </button>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium ${
                statusMessage.includes('error') || statusMessage.includes('failed')
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Footer Controls */}
          {isLiveConnected && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={disconnectSheet}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                Disconnect and switch to Local Demo Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  refreshFromSheet();
                  onClose();
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Force Sync Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
