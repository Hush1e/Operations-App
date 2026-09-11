import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { ProgramRecord } from '../types';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Building,
  GraduationCap,
  Mail,
  Hash,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface ProgramManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgramManagerModal: React.FC<ProgramManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    programs,
    activeProgramId,
    setActiveProgramId,
    addProgram,
    updateProgram,
    deleteProgram,
    courses,
    instructors,
  } = useData();

  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [selectedProgram, setSelectedProgram] = useState<ProgramRecord | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDivision, setFormDivision] = useState('School of Technology & Applied Science');
  const [formCip, setFormCip] = useState('11.1003');
  const [formDeanEmail, setFormDeanEmail] = useState('depriestn@hocking.edu');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormDivision('School of Technology & Applied Science');
    setFormCip('11.1003');
    setFormDeanEmail('depriestn@hocking.edu');
    setFormStatus('Active');
    setSelectedProgram(null);
    setStatusMessage(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setActiveTab('CREATE');
  };

  const handleStartEdit = (prog: ProgramRecord) => {
    setSelectedProgram(prog);
    setFormCode(prog['Program Code'] || '');
    setFormName(prog['Program Name'] || '');
    setFormDivision(prog.Division || 'School of Technology & Applied Science');
    setFormCip(prog.CIP || '');
    setFormDeanEmail(prog['Dean Email'] || '');
    setFormStatus(prog.Status === 'Inactive' ? 'Inactive' : 'Active');
    setStatusMessage(null);
    setActiveTab('EDIT');
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) {
      setStatusMessage('Please enter both Program Code and Program Name.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const newId = await addProgram({
        'Program Code': formCode.trim().toUpperCase(),
        'Program Name': formName.trim(),
        Division: formDivision.trim(),
        CIP: formCip.trim(),
        'Dean Email': formDeanEmail.trim(),
        Status: formStatus,
      });

      setStatusMessage(`Program "${formName}" created and set as active!`);
      setTimeout(() => {
        resetForm();
        setActiveTab('LIST');
      }, 800);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      await updateProgram(selectedProgram['Program ID'], {
        'Program Code': formCode.trim().toUpperCase(),
        'Program Name': formName.trim(),
        Division: formDivision.trim(),
        CIP: formCip.trim(),
        'Dean Email': formDeanEmail.trim(),
        Status: formStatus,
      });

      setStatusMessage('Program updated successfully!');
      setTimeout(() => {
        resetForm();
        setActiveTab('LIST');
      }, 600);
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (prog: ProgramRecord) => {
    if (programs.length <= 1) {
      alert('You must retain at least one program in the system.');
      return;
    }

    const confirmDel = window.confirm(
      `Are you sure you want to remove the program "${prog['Program Name']}" (${prog['Program Code']})?`
    );
    if (!confirmDel) return;

    try {
      await deleteProgram(prog['Program ID']);
      setStatusMessage(`Removed ${prog['Program Code']}.`);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Academic Program Portfolio Manager</h2>
              <p className="text-xs text-slate-300">
                Manage degrees, certificates, and multi-program leadership portfolios.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Sub-Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-2.5 bg-slate-50 shrink-0">
          <div className="flex gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('LIST')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'LIST'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              My Programs ({(programs || []).length})
            </button>
            <button
              onClick={handleStartCreate}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'CREATE'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Program</span>
            </button>
          </div>

          {activeTab !== 'LIST' && (
            <button
              onClick={() => {
                resetForm();
                setActiveTab('LIST');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Back to List
            </button>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mx-5 mt-3 p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB 1: LIST OF PROGRAMS */}
          {activeTab === 'LIST' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Switch between the degree or certificate programs you lead, or add additional programs to your portfolio.
              </p>

              <div className="grid grid-cols-1 gap-3">
                {(programs || []).map(prog => {
                  const isActive = prog['Program ID'] === activeProgramId;
                  const progCoursesCount = courses.filter(c => c['Program ID'] === prog['Program ID']).length;
                  const progFacultyCount = instructors.filter(i => i['Program ID'] === prog['Program ID']).length;

                  return (
                    <div
                      key={prog['Program ID']}
                      className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-indigo-50/60 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{prog['Program Name']}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700">
                            {prog['Program Code']}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active Workspace
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            {prog.Division || 'Division'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="w-3.5 h-3.5 text-slate-400" />
                            CIP: {prog.CIP || 'N/A'}
                          </span>
                          <span className="text-slate-400">
                            {progCoursesCount} Courses · {progFacultyCount} Faculty
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                        {!isActive ? (
                          <button
                            onClick={() => {
                              setActiveProgramId(prog['Program ID']);
                              setStatusMessage(`Switched active workspace to ${prog['Program Name']}.`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                          >
                            Switch To
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-indigo-700 px-2 py-1 bg-indigo-100/70 rounded-md">
                            Current
                          </span>
                        )}

                        <button
                          onClick={() => handleStartEdit(prog)}
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Edit Program Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(prog)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Remove Program"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Program</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2 & 3: CREATE / EDIT FORM */}
          {(activeTab === 'CREATE' || activeTab === 'EDIT') && (
            <form
              onSubmit={activeTab === 'CREATE' ? handleSaveCreate : handleSaveEdit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Program Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CYBER or HIM"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">Unique abbreviation (3-8 uppercase characters)</p>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Official Program Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cybersecurity & Network Systems Administration"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">Full institutional degree or certificate title</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Academic Division / School</label>
                  <input
                    type="text"
                    value={formDivision}
                    onChange={e => setFormDivision(e.target.value)}
                    placeholder="e.g. School of Technology & Applied Science"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">CIP Code (Classification of Instructional Programs)</label>
                  <input
                    type="text"
                    value={formCip}
                    onChange={e => setFormCip(e.target.value)}
                    placeholder="e.g. 11.1003 or 51.0706"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Program Lead / Dean Email</label>
                  <input
                    type="email"
                    value={formDeanEmail}
                    onChange={e => setFormDeanEmail(e.target.value)}
                    placeholder="depriestn@hocking.edu"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Program Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active (In Current Catalog)</option>
                    <option value="Inactive">Inactive / Teach-Out</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Creating or selecting this program gives you a dedicated workspace with its own curriculum, courses, accreditation artifacts, advisory minutes, and HLC reports.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('LIST');
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isProcessing
                    ? 'Saving...'
                    : activeTab === 'CREATE'
                    ? 'Create & Activate Program'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
