import React from 'react';
import { useData } from '../services/dataContext';
import {
  Database,
  ExternalLink,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Sparkles,
  Shield,
  Layers,
  LogOut,
  LogIn,
  Plus,
  Calendar,
} from 'lucide-react';
import { GlobalRole } from '../types';

interface HeaderProps {
  onOpenSpreadsheetModal: () => void;
  onOpenProgramManager?: () => void;
  onOpenWizardsHub?: () => void;
  onOpenCalendarSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSpreadsheetModal,
  onOpenProgramManager,
  onOpenWizardsHub,
  onOpenCalendarSync,
}) => {
  const {
    user,
    currentUserEmail,
    currentRole,
    setCurrentRole,
    programs,
    activeProgramId,
    setActiveProgramId,
    spreadsheetId,
    spreadsheetTitle,
    isLiveConnected,
    isSyncing,
    lastSyncTime,
    refreshFromSheet,
    signIn,
    signOut,
  } = useData();

  const activeProgram = (programs || []).find(p => p['Program ID'] === activeProgramId) || programs?.[0];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md">
      <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand and Program Switcher */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100 tracking-tight text-sm sm:text-base leading-none">
                  Program Operations
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cloud Sheets DB
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Academic Quality & Accreditation Architecture
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Program Switcher */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <select
                value={activeProgramId}
                onChange={e => setActiveProgramId(e.target.value)}
                className="appearance-none bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs sm:text-sm rounded-lg pl-3 pr-8 py-1.5 font-medium transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[180px] sm:max-w-[260px] truncate"
              >
                {(programs || []).map(p => (
                  <option key={p['Program ID']} value={p['Program ID']}>
                    {p['Program Code']} — {p['Program Name']}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {onOpenProgramManager && (
              <button
                onClick={onOpenProgramManager}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
                title="Add, Modify, or Remove Degree & Certificate Programs"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xl:inline">Manage Programs</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Database Connection Status, Role Switcher, Auth */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Guided Wizards Hub Button */}
          {onOpenWizardsHub && (
            <button
              onClick={onOpenWizardsHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs"
              title="Open step-by-step guided wizards for non-technical users"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden sm:inline">Guided Wizards</span>
            </button>
          )}

          {/* Google Sheets Connection Pill */}
          <button
            onClick={onOpenSpreadsheetModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              isLiveConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
            title="Click to view or connect Google Sheet"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline max-w-[130px] truncate">
              {isLiveConnected ? spreadsheetTitle : 'Local / Demo Mode'}
            </span>
            <span className="md:hidden">{isLiveConnected ? 'Connected' : 'Demo'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Direct link to open connected Sheet */}
          {spreadsheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              title="Open Spreadsheet in Google Sheets"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Sync Button */}
          {spreadsheetId && (
            <button
              onClick={refreshFromSheet}
              disabled={isSyncing}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
              title={lastSyncTime ? `Last synced ${lastSyncTime.toLocaleTimeString()}` : 'Sync with Google Sheet'}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          )}

          {/* Role Preview Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Role:</span>
            <select
              value={currentRole}
              onChange={e => setCurrentRole(e.target.value as GlobalRole)}
              className="bg-transparent text-slate-200 font-semibold cursor-pointer focus:outline-none"
            >
              <option value="ADMIN" className="bg-slate-800 text-slate-200">Admin</option>
              <option value="DEAN" className="bg-slate-800 text-slate-200">Dean</option>
              <option value="DIRECTOR_MANAGER" className="bg-slate-800 text-slate-200">Director / Manager</option>
              <option value="INSTRUCTOR" className="bg-slate-800 text-slate-200">Instructor</option>
            </select>
          </div>

          {/* Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right leading-tight">
                <div className="text-xs font-medium text-slate-200 truncate max-w-[130px]">
                  {user.displayName || currentUserEmail}
                </div>
                <div className="text-[10px] text-slate-400">{currentRole}</div>
              </div>
              <button
                onClick={signOut}
                className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                title="Sign out of Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition focus:ring-2 focus:ring-indigo-400"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Connect Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
