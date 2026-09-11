import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import {
  ShieldCheck,
  Plus,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface AccreditationEvidenceProps {
  onOpenRecordModal: (module: string, record?: any, prefill?: any) => void;
}

export const AccreditationEvidence: React.FC<AccreditationEvidenceProps> = ({ onOpenRecordModal }) => {
  const { activeProgramId, bodies, accreditationEvidence, courses } = useData();

  const [selectedBodyFilter, setSelectedBodyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const programBodies = bodies.filter(b => b['Program ID'] === activeProgramId);
  const programEvidence = accreditationEvidence.filter(e => e['Program ID'] === activeProgramId);

  const filteredEvidence = programEvidence.filter(e => {
    if (selectedBodyFilter !== 'ALL') {
      const match = e['Bodies / Frameworks']?.toLowerCase().includes(selectedBodyFilter.toLowerCase());
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && e.Status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        e.Title?.toLowerCase().includes(q) ||
        e['Requirement / Standard']?.toLowerCase().includes(q) ||
        e['Report Tags']?.toLowerCase().includes(q)
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
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>Accreditation & Compliance Portfolio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct evidence collection mapped against Higher Learning Commission (HLC) and specialized programmatic bodies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenRecordModal('bodies', null, { 'Program ID': activeProgramId, Status: 'Active' })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Oversight Body</span>
          </button>
          <button
            onClick={() =>
              onOpenRecordModal('accreditation', null, {
                'Program ID': activeProgramId,
                Status: 'Current',
                'Due Date': new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Evidence Item</span>
          </button>
        </div>
      </div>

      {/* Oversight Bodies Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programBodies.map(body => {
          const bodyEvidence = programEvidence.filter(e =>
            e['Bodies / Frameworks']?.toLowerCase().includes(body['Body / Framework']?.toLowerCase())
          );

          return (
            <div
              key={body['Body ID']}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {body.Type || 'Accreditation Framework'}
                  </span>
                  <button
                    onClick={() => onOpenRecordModal('bodies', body)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{body['Body / Framework']}</h3>
                <p className="text-xs text-slate-500">{body.Notes || 'No notes provided.'}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Next Review: <b>{body['Next Review Date'] || 'Pending'}</b>
                </span>
                <span className="font-semibold text-indigo-600">{bodyEvidence.length} Evidence Items</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evidence Filter & Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search evidence or criteria..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedBodyFilter}
            onChange={e => setSelectedBodyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="ALL">All Bodies / Frameworks</option>
            {programBodies.map(b => (
              <option key={b['Body ID']} value={b['Body / Framework']}>
                {b['Body / Framework']}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Approved / Current">Approved / Current</option>
            <option value="Under Review">Under Review</option>
            <option value="Needs Refresh">Needs Refresh</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing {filteredEvidence.length} of {programEvidence.length} items
        </div>
      </div>

      {/* Evidence Catalog List */}
      <div className="space-y-3">
        {filteredEvidence.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-xs text-slate-400">
            No accreditation evidence items match the search filters.
          </div>
        ) : (
          filteredEvidence.map(item => (
            <div
              key={item['Evidence ID']}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 shadow-2xs space-y-2.5 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {item['Bodies / Frameworks']}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.Status || 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {item['Evidence URL'] && (
                    <a
                      href={item['Evidence URL']}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      <span>Drive Artifact</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => onOpenRecordModal('accreditation', item)}
                    className="text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.Title}</h4>
                <div className="text-xs font-medium text-slate-600 mt-0.5">
                  <b>Requirement / Criterion:</b> {item['Requirement / Standard']}
                </div>
              </div>

              {item.Description && (
                <p className="text-xs text-slate-500 leading-relaxed">{item.Description}</p>
              )}

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <div>
                  Owner: <span className="text-slate-600 font-medium">{item['Owner Email']}</span>
                </div>
                <div>
                  Tags: <span className="text-slate-600 font-medium">{item['Report Tags'] || 'None'}</span>
                </div>
                <div>
                  Due: <span className="text-slate-600 font-medium">{item['Due Date']}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
