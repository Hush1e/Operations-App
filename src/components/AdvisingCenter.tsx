import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { GraduationCap, Plus, AlertTriangle, CheckCircle2, Search, Filter, Mail, Calendar } from 'lucide-react';

interface AdvisingCenterProps {
  onOpenRecordModal: (module: string, record?: any, prefill?: any) => void;
}

export const AdvisingCenter: React.FC<AdvisingCenterProps> = ({ onOpenRecordModal }) => {
  const { activeProgramId, advisees } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const programAdvisees = advisees.filter(a => a['Program ID'] === activeProgramId);

  const filteredAdvisees = programAdvisees.filter(a => {
    if (riskFilter === 'AT_RISK') {
      if (!a['Risk Flag'] || a['Risk Flag'] === 'Normal' || a['Risk Flag'] === 'None') return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a['Student Name']?.toLowerCase().includes(q) ||
        a['Student ID']?.toLowerCase().includes(q) ||
        a['Student Email']?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>Students & Academic Advising Roster</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cohort retention tracking, degree milestone completion, academic alert flags, and advising notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenRecordModal('advisees', null, {
                'Program ID': activeProgramId,
                'Risk Flag': 'None',
                Status: 'Active',
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Advisee</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="ALL">All Students ({programAdvisees.length})</option>
            <option value="AT_RISK">Needs Follow-Up / Academic Alert</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing {filteredAdvisees.length} of {programAdvisees.length} advisees
        </div>
      </div>

      {/* Advisees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdvisees.map((adv, index) => {
          const isAlert =
            adv['Risk Flag'] &&
            adv['Risk Flag'] !== 'None' &&
            adv['Risk Flag'] !== 'Normal' &&
            adv['Risk Flag'] !== 'Good Standing';

          const itemKey = adv['Student ID'] || (adv as any)['Advisee ID'] || `adv-${index}`;

          return (
            <div
              key={itemKey}
              id={`advisee-card-${itemKey}`}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    ID: {adv['Student ID']}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAlert
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isAlert ? adv['Risk Flag'] : 'In Good Standing'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{adv['Student Name']}</h3>
                  <div className="text-xs text-slate-500">{adv['Student Email']}</div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span><b>Status:</b> {adv.Status || 'Enrolled'}</span>
                    <span><b>Grad:</b> {adv['Expected Graduation'] || (adv as any)['Graduation Target'] || '—'}</span>
                  </div>
                  {(adv.Notes || (adv as any)['Advising Notes']) && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 line-clamp-2">
                      "{adv.Notes || (adv as any)['Advising Notes']}"
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Next Follow-Up: <b>{adv['Next Follow-Up'] || 'None'}</b></span>
                <button
                  id={`advisee-edit-${itemKey}`}
                  onClick={() => onOpenRecordModal('advisees', adv)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Edit / Log Note →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
