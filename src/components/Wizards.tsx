import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import {
  Sparkles,
  X,
  Check,
  Calendar,
  Repeat,
  FileCheck2,
  User,
  Layers,
  ArrowRight,
  FolderPlus,
  FileText,
  Download,
  CalendarPlus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Priority, TaskScope } from '../types';
import { generateICalendarFile } from '../services/calendarService';

export type WizardType =
  | 'HUB'
  | 'PREPARE_TERM'
  | 'TASK_TEMPLATE'
  | 'RECURRING_WORK'
  | 'CALENDAR_SYNC'
  | null;

interface WizardModalProps {
  type: WizardType;
  onClose: () => void;
  onSelectWizard?: (type: WizardType) => void;
  onOpenProgramManager?: () => void;
  onOpenFirstTimeSetup?: () => void;
  onOpenHlcReports?: () => void;
}

export const Wizards: React.FC<WizardModalProps> = ({
  type,
  onClose,
  onSelectWizard,
  onOpenProgramManager,
  onOpenFirstTimeSetup,
  onOpenHlcReports,
}) => {
  const {
    activeProgramId,
    courses,
    instructors,
    assignments,
    prepareCoursesForTerm,
    generateRecurringTasks,
    saveRecord,
    recurringTasks,
    calendarEvents,
    importAcademicTermPresets,
    importGoogleCalendar,
    programs,
    isLiveConnected,
    signIn,
  } = useData();

  const [currentWizard, setCurrentWizard] = useState<WizardType>(type);

  // Sync state if prop changes
  React.useEffect(() => {
    setCurrentWizard(type);
  }, [type]);

  const [termId, setTermId] = useState('FA26');
  const [partOfTerm, setPartOfTerm] = useState('Full Term');
  const [termStartDate, setTermStartDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [selectedTasks, setSelectedTasks] = useState<string[]>([
    'Verify syllabus meets institutional standards and CLOs',
    'Verify LMS course shell published & gradebook verified',
    'Post welcome announcement & introductory discussion',
    'Confirm course materials & textbook zero-cost options',
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState('SYLLABUS_AUDIT');
  const [templateOwner, setTemplateOwner] = useState('');
  const [templateDueDate, setTemplateDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  // Recurring state
  const [recurThroughDate, setRecurThroughDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );

  // Calendar state
  const [selectedCalTerm, setSelectedCalTerm] = useState<'Fall 2026' | 'Spring 2027'>('Fall 2026');

  if (!currentWizard) return null;

  const handlePrepareTerm = async () => {
    setIsProcessing(true);
    setResultMsg(null);
    try {
      const res = await prepareCoursesForTerm({
        termId,
        partOfTerm,
        startDate: termStartDate,
        taskTitles: selectedTasks,
      });
      setResultMsg(
        `Successfully generated ${res.created} operational startup tasks across ${res.coursesCount} active courses.`
      );
    } catch (e: any) {
      setResultMsg(`Error preparing term: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyTemplate = async () => {
    setIsProcessing(true);
    setResultMsg(null);
    try {
      let title = 'Standard Syllabus Audit';
      let desc = 'Review syllabus for required institutional policies, CLO alignments, and grading rubrics.';
      let priority: Priority = 'High';
      let scope: TaskScope = 'Course';

      if (selectedTemplate === 'RETENTION_CHECK') {
        title = 'Midterm Grade & Retention Early Warning Verification';
        desc = 'Submit midterm grade indicators in SIS and issue academic retention alerts for students below 70%.';
        priority = 'Critical';
        scope = 'Program';
      } else if (selectedTemplate === 'ADVISORY_MINUTES') {
        title = 'Fall Industry Advisory Committee Minutes Documentation';
        desc = 'Transcribe and upload verified minutes, attendee roster, and workforce curriculum recommendations.';
        priority = 'Normal';
        scope = 'Program';
      } else if (selectedTemplate === 'CLOSING_THE_LOOP') {
        title = 'HLC Criterion 4.C Continuous Improvement Action Follow-Up';
        desc = 'Evaluate efficacy of instructional changes implemented from previous cycle assessment findings.';
        priority = 'High';
        scope = 'Program';
      }

      await saveRecord('tasks', {
        'Program ID': activeProgramId,
        Title: title,
        Description: desc,
        Status: 'TODO',
        Priority: priority,
        'Due Date': templateDueDate,
        'Assigned To': templateOwner || 'Faculty Team',
        'Owner Email': templateOwner ? `${templateOwner.toLowerCase().replace(/\s+/g, '')}@hocking.edu` : 'lead@hocking.edu',
        'Task Scope': scope,
        Category: 'Academic Operations',
      });

      setResultMsg(`Created operational task "${title}" assigned to ${templateOwner || 'Faculty Team'}.`);
    } catch (e: any) {
      setResultMsg(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunRecurring = async () => {
    setIsProcessing(true);
    setResultMsg(null);
    try {
      const res = await generateRecurringTasks(recurThroughDate);
      setResultMsg(`Generated ${res.added} recurring compliance cards (${res.skipped} already scheduled).`);
    } catch (e: any) {
      setResultMsg(`Error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportCalendarMilestones = async () => {
    setIsProcessing(true);
    setResultMsg(null);
    try {
      const count = await importAcademicTermPresets(selectedCalTerm);
      setResultMsg(`Imported ${count} official academic milestones for ${selectedCalTerm} into your program calendar.`);
    } catch (e: any) {
      setResultMsg(`Import notice: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleCalendarSync = async () => {
    setIsProcessing(true);
    setResultMsg(null);
    try {
      const count = await importGoogleCalendar();
      setResultMsg(`Successfully synchronized ${count} events from Google Calendar.`);
    } catch (e: any) {
      setResultMsg(`Notice: ${e.message}. You can connect Google Calendar in header or import institutional milestones.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportIcs = () => {
    const prog = (programs || []).find(p => p['Program ID'] === activeProgramId);
    const progEvents = (calendarEvents || []).filter(e => e['Program ID'] === activeProgramId || e.Scope === 'GLOBAL');
    const icsContent = generateICalendarFile(progEvents, `${prog?.['Program Name'] || 'Academic'} Operations Calendar`);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_calendar_${prog?.['Program Code'] || 'CYBER'}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {currentWizard === 'HUB' && 'Guided Wizards for Non-Technical Users'}
                {currentWizard === 'PREPARE_TERM' && 'Semester Startup Preparation Wizard'}
                {currentWizard === 'TASK_TEMPLATE' && 'Operational Task Generator Wizard'}
                {currentWizard === 'RECURRING_WORK' && 'Recurring Compliance Rules Wizard'}
                {currentWizard === 'CALENDAR_SYNC' && 'Google Calendar & Academic Dates Wizard'}
              </h2>
              <p className="text-xs text-slate-400">
                {currentWizard === 'HUB'
                  ? 'Step-by-step guided assistants for programs, Drive folders, calendars, and HLC reports.'
                  : 'Automate complex operational workflows without writing code or editing raw tables.'}
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

        {/* Wizard Hub Navigation sub-bar when inside a sub-wizard */}
        {currentWizard !== 'HUB' && (
          <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
            <button
              onClick={() => {
                setResultMsg(null);
                setCurrentWizard('HUB');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              ← Back to All Wizards
            </button>
            <span className="text-slate-400 font-medium">Non-Technical Assistant</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* =========================================================================
              VIEW: WIZARD HUB
              ========================================================================= */}
          {currentWizard === 'HUB' && (
            <div className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Choose an automated assistant below. Each wizard simplifies a key academic operations duty without requiring technical database knowledge:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. First-Time Setup Wizard */}
                <div
                  onClick={() => {
                    onClose();
                    if (onOpenFirstTimeSetup) onOpenFirstTimeSetup();
                  }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <FolderPlus className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                      Google Drive & Sheet Setup
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Auto-create organized Drive folders (Syllabi, HLC, Evidence) and initialize the 28-sheet database template.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-bold text-indigo-600 text-[11px]">
                    <span>Run Setup Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>

                {/* 2. Program Management Wizard */}
                <div
                  onClick={() => {
                    onClose();
                    if (onOpenProgramManager) onOpenProgramManager();
                  }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                      Add / Manage Programs
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Easily add, modify, or remove degree and certificate programs for leads overseeing multiple programs.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-bold text-indigo-600 text-[11px]">
                    <span>Manage Programs ({(programs || []).length})</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>

                {/* 3. HLC Accreditation Reports Wizard */}
                <div
                  onClick={() => {
                    onClose();
                    if (onOpenHlcReports) onOpenHlcReports();
                  }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                      HLC Accreditation Reports
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Build assurance documents for Criterion 3 & 4 with live curriculum maps, benchmarks, and Word/Google Doc export.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-bold text-indigo-600 text-[11px]">
                    <span>Generate HLC Report</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>

                {/* 4. Google & Academic Calendar Sync */}
                <div
                  onClick={() => {
                    setResultMsg(null);
                    setCurrentWizard('CALENDAR_SYNC');
                  }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                      Calendar & Term Deadlines
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Import semester start, census, midterm, and final grade deadlines, or sync with your Google Calendar.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-bold text-indigo-600 text-[11px]">
                    <span>Sync Academic Dates</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>

                {/* 5. Semester Startup Wizard */}
                <div
                  onClick={() => {
                    setResultMsg(null);
                    setCurrentWizard('PREPARE_TERM');
                  }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <CalendarPlus className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                      Semester Startup Wizard
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Automatically generate syllabus review, LMS publishing, and gradebook setup tasks for all course sections.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-bold text-indigo-600 text-[11px]">
                    <span>Start Term Preparation</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>

                {/* 6. Recurring Work Rules */}
                <div
                  onClick={() => {
                    setResultMsg(null);
                    setCurrentWizard('RECURRING_WORK');
                  }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                      <Repeat className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-700 transition">
                      Recurring Compliance Rules
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Automate periodic duties like bi-weekly attendance checks, monthly advisory logs, and state compliance.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between font-bold text-indigo-600 text-[11px]">
                    <span>Generate Recurring Work</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW: CALENDAR SYNC WIZARD
              ========================================================================= */}
          {currentWizard === 'CALENDAR_SYNC' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Connect your academic milestones to keep track of semester launch, census locks, midterm grade deadlines, and commencement.
              </p>

              {/* Option A: Institutional Presets */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Import Standard Term Milestones</span>
                  </div>
                  <select
                    value={selectedCalTerm}
                    onChange={e => setSelectedCalTerm(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
                  >
                    <option value="Fall 2026">Fall 2026 Term</option>
                    <option value="Spring 2027">Spring 2027 Term</option>
                  </select>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  Includes: Faculty in-service, first day of class, 14-day census certification, midterm warnings, final exam week, and grade lock dates.
                </div>

                <button
                  onClick={handleImportCalendarMilestones}
                  disabled={isProcessing}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarPlus className="w-3.5 h-3.5" />}
                  <span>Import {selectedCalTerm} Deadlines</span>
                </button>
              </div>

              {/* Option B: Google Calendar Direct Sync & .ICS Export */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Google Calendar Direct</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Fetch upcoming meetings & academic appointments from your primary Google account.
                    </p>
                  </div>
                  <button
                    onClick={handleGoogleCalendarSync}
                    disabled={isProcessing}
                    className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition disabled:opacity-50"
                  >
                    Sync Google Calendar
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Download .ICS Calendar File</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Export all program deadlines for 1-click import into Google Calendar or Outlook.
                    </p>
                  </div>
                  <button
                    onClick={handleExportIcs}
                    className="w-full py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download iCal (.ics)</span>
                  </button>
                </div>
              </div>

              {resultMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resultMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW: SEMESTER STARTUP PREPARATION
              ========================================================================= */}
          {currentWizard === 'PREPARE_TERM' && (
            <div className="space-y-4">
              <p className="text-slate-500 leading-relaxed">
                Automatically generate required semester startup tasks (e.g. syllabus verification, LMS publishing, gradebook setup) for all courses in this program.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Select Academic Term</label>
                  <select
                    value={termId}
                    onChange={e => setTermId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  >
                    <option value="FA26">Fall 2026 (FA26)</option>
                    <option value="SP27">Spring 2027 (SP27)</option>
                    <option value="SU27">Summer 2027 (SU27)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Part of Term</label>
                  <select
                    value={partOfTerm}
                    onChange={e => setPartOfTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  >
                    <option value="Full Term">Full Term (16 Weeks)</option>
                    <option value="1st 8-Week">1st 8-Week Session</option>
                    <option value="2nd 8-Week">2nd 8-Week Session</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Term Classes Begin Date</label>
                <input
                  type="date"
                  value={termStartDate}
                  onChange={e => setTermStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">Startup Checklist Items to Generate</label>
                <div className="space-y-1.5">
                  {[
                    'Verify syllabus meets institutional standards and CLOs',
                    'Verify LMS course shell published & gradebook verified',
                    'Post welcome announcement & introductory discussion',
                    'Confirm course materials & textbook zero-cost options',
                    'Submit 14-day census enrollment certification',
                  ].map(title => (
                    <label
                      key={title}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(title)}
                        onChange={e => {
                          if (e.target.checked) setSelectedTasks([...selectedTasks, title]);
                          else setSelectedTasks(selectedTasks.filter(t => t !== title));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 font-medium">{title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePrepareTerm}
                disabled={isProcessing || selectedTasks.length === 0}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50"
              >
                {isProcessing ? 'Generating Operational Cards...' : 'Generate Term Startup Tasks'}
              </button>

              {resultMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {resultMsg}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW: TASK TEMPLATE WIZARD
              ========================================================================= */}
          {currentWizard === 'TASK_TEMPLATE' && (
            <div className="space-y-4">
              <p className="text-slate-500 leading-relaxed">
                Select an institutional best-practice task template to rapidly generate actionable cards on your Work Board.
              </p>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Template</label>
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="SYLLABUS_AUDIT">Standard Course Syllabus & CLO Audit</option>
                  <option value="RETENTION_CHECK">Midterm Grade & Retention Early Warning</option>
                  <option value="ADVISORY_MINUTES">Industry Advisory Committee Minutes Log</option>
                  <option value="CLOSING_THE_LOOP">HLC Criterion 4.C Continuous Improvement Action</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assignee</label>
                  <select
                    value={templateOwner}
                    onChange={e => setTemplateOwner(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  >
                    <option value="">Select Instructor...</option>
                    {(instructors || []).map(i => (
                      <option key={i['Instructor ID']} value={i['Instructor Name']}>
                        {i['Instructor Name']} ({i.Type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={templateDueDate}
                    onChange={e => setTemplateDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyTemplate}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50"
              >
                Create Task from Template
              </button>

              {resultMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {resultMsg}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW: RECURRING COMPLIANCE WORK
              ========================================================================= */}
          {currentWizard === 'RECURRING_WORK' && (
            <div className="space-y-4">
              <p className="text-slate-500 leading-relaxed">
                Rules define periodic obligations (e.g. bi-weekly attendance checks, monthly advisory logs, census submissions).
              </p>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Generate Cards Through Date</label>
                <input
                  type="date"
                  value={recurThroughDate}
                  onChange={e => setRecurThroughDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-700">Existing Recurring Rules ({(recurringTasks || []).length})</div>
                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {(recurringTasks || []).map((r, rIdx) => (
                    <div key={r['Rule ID'] || `recur-rule-${rIdx}`} className="p-2 bg-slate-50 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-800">{r['Base Title']}</div>
                        <div className="text-[10px] text-slate-500">{r.Cadence} • {r['Task Scope']}</div>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {r.Priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRunRecurring}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50"
              >
                Generate Due Cards
              </button>

              {resultMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {resultMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
