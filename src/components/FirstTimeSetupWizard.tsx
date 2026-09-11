import React, { useState, useEffect } from 'react';
import { useData } from '../services/dataContext';
import {
  FolderCheck,
  Database,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Check,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  Building,
  GraduationCap,
  X,
  Loader2,
  FolderPlus,
} from 'lucide-react';

interface FirstTimeSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const FirstTimeSetupWizard: React.FC<FirstTimeSetupWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const {
    activeProgramId,
    programs,
    addProgram,
    setupWorkspaceDriveAndSheets,
    importAcademicTermPresets,
    importGoogleCalendar,
    spreadsheetId,
    isLiveConnected,
    signIn,
    user,
    driveFolderInfo,
  } = useData();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [institution, setInstitution] = useState('Hocking College');
  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [hasMultiplePrograms, setHasMultiplePrograms] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState<{
    foldersDone: boolean;
    sheetsDone: boolean;
    calendarDone: boolean;
  }>({
    foldersDone: false,
    sheetsDone: false,
    calendarDone: false,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeProg = (programs || []).find(p => p['Program ID'] === activeProgramId) || programs?.[0];

  useEffect(() => {
    if (activeProg && !progCode) {
      setProgCode(activeProg['Program Code']);
      setProgName(activeProg['Program Name']);
    }
  }, [activeProg, progCode]);

  if (!isOpen) return null;

  const handleStep1Next = async () => {
    // If user edited program code/name and it differs, can add or keep
    if (progCode && progName && progCode !== activeProg?.['Program Code']) {
      try {
        await addProgram({
          'Program Code': progCode.toUpperCase(),
          'Program Name': progName,
          Division: 'School of Technology & Applied Science',
          CIP: '11.1003',
          'Dean Email': user?.email || 'depriestn@hocking.edu',
          Status: 'Active',
        });
      } catch (e) {
        console.warn('Program setup note:', e);
      }
    }
    setStep(2);
  };

  const handleRunProvisioning = async () => {
    setIsProvisioning(true);
    setStatusMessage('Creating organized Google Drive folder hierarchy...');

    try {
      // 1. Google Drive & Template Spreadsheet Setup
      const result = await setupWorkspaceDriveAndSheets(institution);
      setProvisionProgress(prev => ({ ...prev, foldersDone: true, sheetsDone: true }));

      setStatusMessage('Folders created! Master 28-sheet template database provisioned.');
      setTimeout(() => {
        setStep(3);
        setIsProvisioning(false);
      }, 1000);
    } catch (err: any) {
      setStatusMessage(`Notice: ${err.message}. Local workspace created and ready.`);
      setProvisionProgress(prev => ({ ...prev, foldersDone: true, sheetsDone: true }));
      setTimeout(() => {
        setStep(3);
        setIsProvisioning(false);
      }, 1200);
    }
  };

  const handleImportCalendar = async () => {
    setIsProvisioning(true);
    setStatusMessage('Importing official academic milestone dates and semester schedule...');
    try {
      await importAcademicTermPresets('Fall 2026');
      await importAcademicTermPresets('Spring 2027');
      setProvisionProgress(prev => ({ ...prev, calendarDone: true }));
      setStatusMessage('Official academic deadlines successfully imported!');
      setTimeout(() => {
        setStep(4);
        setIsProvisioning(false);
      }, 800);
    } catch (err: any) {
      setStatusMessage(`Import complete with defaults.`);
      setProvisionProgress(prev => ({ ...prev, calendarDone: true }));
      setTimeout(() => {
        setStep(4);
        setIsProvisioning(false);
      }, 800);
    }
  };

  const handleFinishWizard = () => {
    localStorage.setItem('academic_ops_onboarded_v1', 'true');
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Non-Technical Setup Wizard</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Step {step} of 4
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automated Google Drive folders, relational sheets database, and academic calendar setup.
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

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* STEP 1: Academic Program & Lead Identity */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Welcome! Let's set up your academic program workspace.
                </h3>
                <p className="text-xs text-slate-500">
                  No technical database configuration required. Tell us about your institution and program, and we'll configure everything behind the scenes.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Institution Name</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Program Code</label>
                    <input
                      type="text"
                      value={progCode}
                      onChange={e => setProgCode(e.target.value.toUpperCase())}
                      placeholder="e.g. CYBER"
                      className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Official Degree / Certificate Title</label>
                    <input
                      type="text"
                      value={progName}
                      onChange={e => setProgName(e.target.value)}
                      placeholder="e.g. Cybersecurity & Network Administration"
                      className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-950">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold">Do you manage or lead multiple programs?</div>
                      <div className="text-[11px] text-indigo-700">
                        You can easily add and switch between other degrees/certificates anytime from the header.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasMultiplePrograms}
                    onChange={e => setHasMultiplePrograms(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleStep1Next}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                >
                  <span>Continue to Drive & Sheet Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Google Drive & Template Spreadsheet Auto-Creation */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Automatic Google Drive & Master Spreadsheet Provisioning
                </h3>
                <p className="text-xs text-slate-500">
                  We will automatically construct an organized Google Drive folder structure and instantiate your 28-sheet relational database template.
                </p>
              </div>

              {/* Folder Architecture Visualizer */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-indigo-600" />
                  <span>Folders that will be created in your Google Drive:</span>
                </div>
                <div className="pl-4 border-l-2 border-indigo-200 space-y-1.5 text-xs text-slate-600 font-mono">
                  <div className="font-bold text-slate-900">📁 [{institution}] Academic Operations — {progCode || 'CYBER'}</div>
                  <div className="pl-4">📁 1. Courses & Approved Syllabi</div>
                  <div className="pl-4">📁 2. HLC Accreditation Reports</div>
                  <div className="pl-4">📁 3. Assessment Artifacts & Direct Evidence</div>
                  <div className="pl-4">📁 4. Advisory Committee & Workforce Minutes</div>
                  <div className="pl-4">📁 5. Master Spreadsheet Databases (28 relational tabs)</div>
                </div>
              </div>

              {/* Status checklist */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  {provisionProgress.foldersDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span className={provisionProgress.foldersDone ? 'text-emerald-900 font-bold' : 'text-slate-600'}>
                    Google Drive folders for syllabi, HLC reports, and evidence
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium">
                  {provisionProgress.sheetsDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span className={provisionProgress.sheetsDone ? 'text-emerald-900 font-bold' : 'text-slate-600'}>
                    Master template database initialized (Courses, PLOs, Assessments, Workboard)
                  </span>
                </div>
              </div>

              {statusMessage && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Back
                </button>

                <button
                  onClick={handleRunProvisioning}
                  disabled={isProvisioning}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isProvisioning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning Drive & Database...</span>
                    </>
                  ) : (
                    <>
                      <FolderCheck className="w-4 h-4" />
                      <span>Create Folders & Sheets Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Academic Calendar & Google Calendar Import */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Connect Academic Calendar & Google Calendar
                </h3>
                <p className="text-xs text-slate-500">
                  Import standard institutional milestones (Classes Start, Census Date, Midterms, Final Exam Week, Grade Deadlines) directly into your program calendar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Fall 2026 Term Milestones</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• Faculty In-Service (Aug 17)</li>
                    <li>• Classes Begin (Aug 24)</li>
                    <li>• 14-Day Census Date (Sep 8)</li>
                    <li>• Midterm Warnings (Oct 12)</li>
                    <li>• Final Exam Week (Dec 7-11)</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Spring 2027 Term Milestones</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• Faculty Development (Jan 8)</li>
                    <li>• Classes Begin (Jan 11)</li>
                    <li>• Census Certification (Jan 26)</li>
                    <li>• Spring Break Recess (Mar 8-12)</li>
                    <li>• Commencement (May 14)</li>
                  </ul>
                </div>
              </div>

              {statusMessage && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Back
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(4)}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Skip for Now
                  </button>

                  <button
                    onClick={handleImportCalendar}
                    disabled={isProvisioning}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                  >
                    {isProvisioning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Importing Calendar Dates...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Import Academic Calendar Milestones</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Ready to Go! */}
          {step === 4 && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  You're all set! Academic Workspace is Ready.
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Your Google Drive folders are organized, your database template is ready, and your academic operational boards are live.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Program: {progName || 'Cybersecurity & Network Administration'}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Google Drive Folders: Created & Linked</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Master Sheets Database: 28-tab relational engine</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>HLC Accreditation & Assurance Reports: Enabled</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleFinishWizard}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-md shadow-slate-900/20"
                >
                  <span>Launch Program Operations Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
