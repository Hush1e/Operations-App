import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { Settings, Save, Database, Shield, CheckCircle2, Sliders, ExternalLink } from 'lucide-react';

export const ProgramSettings: React.FC = () => {
  const {
    activeProgramId,
    programs,
    programFeatures,
    saveRecord,
    isLiveConnected,
    spreadsheetId,
    spreadsheetTitle,
    disconnectSheet,
  } = useData();

  const program = (programs || []).find(p => p['Program ID'] === activeProgramId) || programs?.[0];
  const features = (programFeatures || []).find(f => f['Program ID'] === activeProgramId);

  const [formData, setFormData] = useState({
    'Program Code': program?.['Program Code'] || '',
    'Program Name': program?.['Program Name'] || '',
    CIP: program?.CIP || '',
    Division: program?.Division || '',
    Status: program?.Status || 'Active',
  });

  const [featureToggles, setFeatureToggles] = useState({
    'Enable Course Assignments': features?.['Enable Course Assignments'] ?? true,
    'Enable Accreditation Evidence': features?.['Enable Accreditation Evidence'] ?? true,
    'Enable Advisory Committee': features?.['Enable Advisory Committee'] ?? true,
    'Enable Advising & Retention': features?.['Enable Advising & Retention'] ?? true,
    'Enable Industry Credentials': features?.['Enable Industry Credentials'] ?? true,
    'Enable Applied AI Integration': features?.['Enable Applied AI Integration'] ?? true,
    'Enable Task Board': features?.['Enable Task Board'] ?? true,
    'Enable Continuous Improvement': features?.['Enable Continuous Improvement'] ?? true,
  });

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;
    try {
      await saveRecord('programs', {
        ...program,
        ...formData,
      });

      if (features) {
        await saveRecord('features', {
          ...features,
          ...featureToggles,
        });
      }

      setSaveMessage('Program properties and feature settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage(`Error saving settings: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Program Configuration & Modular Features</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Program identity metadata, academic catalog alignment, and modular feature toggles.
        </p>
      </div>

      <form onSubmit={handleSaveProgram} className="space-y-6">
        {/* Program Identity */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Program Identity</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Program Code</label>
              <input
                type="text"
                value={formData['Program Code']}
                onChange={e => setFormData({ ...formData, 'Program Code': e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CIP Code</label>
              <input
                type="text"
                value={formData.CIP}
                onChange={e => setFormData({ ...formData, CIP: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Program Name</label>
              <input
                type="text"
                value={formData['Program Name']}
                onChange={e => setFormData({ ...formData, 'Program Name': e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Division</label>
              <input
                type="text"
                value={formData.Division}
                onChange={e => setFormData({ ...formData, Division: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.Status}
                onChange={e => setFormData({ ...formData, Status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
                <option value="Archived / Teach-out">Archived / Teach-out</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Modular Feature Controls</h3>
          <p className="text-xs text-slate-500">
            Activate or deactivate specific functional capabilities for this academic program.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(featureToggles).map(([featKey, enabled]) => (
              <label
                key={featKey}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none"
              >
                <span className="text-xs font-medium text-slate-800">{featKey.replace('Enable ', '')}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={e =>
                    setFeatureToggles({
                      ...featureToggles,
                      [featKey]: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
          {saveMessage && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {saveMessage}
            </span>
          )}
        </div>
      </form>

      {/* Database Connection Status & Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Google Sheets Database Connection</span>
        </h3>

        <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <b>Status:</b> {isLiveConnected ? 'Connected to Live Google Sheet' : 'Local Demo Storage Mode'}
          </div>
          {spreadsheetId && (
            <>
              <div>
                <b>Spreadsheet Title:</b> {spreadsheetTitle}
              </div>
              <div>
                <b>Spreadsheet ID:</b> <span className="font-mono text-[11px]">{spreadsheetId}</span>
              </div>
            </>
          )}
        </div>

        {spreadsheetId && (
          <div className="flex items-center gap-3 pt-2">
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={disconnectSheet}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800"
            >
              Disconnect Sheet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
