import React from 'react';
import { useData } from '../services/dataContext';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Calendar,
  Layers,
  KanbanSquare,
  Sparkles,
  Database,
  ExternalLink,
} from 'lucide-react';
import { AppRoute } from './Sidebar';

interface HomeOverviewProps {
  onNavigate: (route: AppRoute) => void;
  onOpenSpreadsheetModal: () => void;
  onOpenProgramManager?: () => void;
  onOpenWizardsHub?: () => void;
  onOpenCalendarSync?: () => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onNavigate,
  onOpenSpreadsheetModal,
  onOpenProgramManager,
  onOpenWizardsHub,
  onOpenCalendarSync,
}) => {
  const {
    activeProgramId,
    programs,
    courses,
    instructors,
    assignments,
    tasks,
    plos,
    assessments,
    bodies,
    accreditationEvidence,
    advisees,
    credentials,
    improvements,
    spreadsheetId,
    spreadsheetTitle,
    isLiveConnected,
  } = useData();

  const program = (programs || []).find(p => p['Program ID'] === activeProgramId) || programs?.[0];
  const programCourses = courses.filter(c => c['Program ID'] === activeProgramId && c.Active !== false && c.Active !== 'false');
  const programAssignments = assignments.filter(a => a['Program ID'] === activeProgramId && a.Status !== 'Cancelled');
  const assignedCourseIds = new Set(programAssignments.map(a => a['Course ID']));

  const programTasks = tasks.filter(t => t['Program ID'] === activeProgramId && t.Archived !== true && t.Archived !== 'true');
  const openTasks = programTasks.filter(t => t.Status !== 'COMPLETE');
  const overdueTasks = openTasks.filter(t => t['Due Date'] && new Date(t['Due Date']) < new Date());

  const programPlos = plos.filter(p => p['Program ID'] === activeProgramId && p.Active !== false && p.Active !== 'false');
  const measuredPloIds = new Set(assessments.filter(a => a['Program ID'] === activeProgramId && a.Measure).map(a => a['PLO ID']));

  const programEvidence = accreditationEvidence.filter(e => e['Program ID'] === activeProgramId);
  const programBodies = bodies.filter(b => b['Program ID'] === activeProgramId);

  const openImprovements = improvements.filter(
    i => i['Program ID'] === activeProgramId && i.Status !== 'Complete' && i.Status !== 'Resolved'
  );

  // Health Items Calculation
  const healthCards = [
    {
      key: 'courses',
      label: 'Course Coverage',
      status: programCourses.length && assignedCourseIds.size >= programCourses.length ? 'Good' : assignedCourseIds.size ? 'Needs Attention' : 'Setup Needed',
      value: `${assignedCourseIds.size} / ${programCourses.length} Courses Assigned`,
      why: 'Active catalog courses with at least one current instructional assignment.',
      action: 'Review course assignments',
      route: 'assignments' as AppRoute,
    },
    {
      key: 'work',
      label: 'Work Board Velocity',
      status: overdueTasks.length ? 'Needs Attention' : 'Good',
      value: `${openTasks.length} Open · ${overdueTasks.length} Overdue`,
      why: 'Current program, course, and faculty operational tasks.',
      action: 'Open Work Board',
      route: 'workboard' as AppRoute,
    },
    {
      key: 'assessment',
      label: 'Assessment Readiness',
      status: programPlos.length && measuredPloIds.size >= programPlos.length ? 'Good' : programPlos.length ? 'Needs Attention' : 'Setup Needed',
      value: `${measuredPloIds.size} / ${programPlos.length} PLOs Measured`,
      why: 'Program Learning Outcomes with active direct assessment measures.',
      action: 'Review Assessment Matrix',
      route: 'assessment' as AppRoute,
    },
    {
      key: 'accreditation',
      label: 'Accreditation Portfolio',
      status: programBodies.length && programEvidence.length >= programBodies.length ? 'Good' : 'Needs Attention',
      value: `${programEvidence.length} Evidence Items · ${programBodies.length} Bodies`,
      why: 'Verified documentation cataloged against HLC and specialized frameworks.',
      action: 'Review Evidence Catalog',
      route: 'accreditation' as AppRoute,
    },
    {
      key: 'advising',
      label: 'Student Advising',
      status: 'Info',
      value: `${advisees.filter(a => a['Program ID'] === activeProgramId).length} Advisees Tracked`,
      why: 'Students monitored for academic retention, milestone pacing, and risk flags.',
      action: 'Open Advising Roster',
      route: 'advising' as AppRoute,
    },
    {
      key: 'improvement',
      label: 'Continuous Improvement',
      status: openImprovements.length ? 'Needs Attention' : 'Good',
      value: `${openImprovements.length} Open Action Items`,
      why: 'Closing-the-loop action plans resulting from outcome findings.',
      action: 'View Improvement Plans',
      route: 'improvement' as AppRoute,
    },
  ];

  // Snapshot Bar Charts data
  const statusCounts = [
    { label: 'TO DO', val: programTasks.filter(t => t.Status === 'TO DO').length, color: 'bg-slate-400' },
    { label: 'READY', val: programTasks.filter(t => t.Status === 'READY').length, color: 'bg-blue-500' },
    { label: 'IN PROGRESS', val: programTasks.filter(t => t.Status === 'IN PROGRESS').length, color: 'bg-amber-500' },
    { label: 'BLOCKED', val: programTasks.filter(t => t.Status === 'WAITING/BLOCKED').length, color: 'bg-rose-500' },
    { label: 'REVIEW', val: programTasks.filter(t => t.Status === 'REVIEW NEEDED').length, color: 'bg-purple-500' },
    { label: 'COMPLETE', val: programTasks.filter(t => t.Status === 'COMPLETE').length, color: 'bg-emerald-500' },
  ];
  const maxStatus = Math.max(1, ...statusCounts.map(s => s.val));

  const scopeCounts = [
    { label: 'Program Level', val: openTasks.filter(t => t['Task Scope'] === 'Program').length },
    { label: 'Course Level', val: openTasks.filter(t => t['Task Scope'] === 'Course').length },
    { label: 'Instructor Level', val: openTasks.filter(t => t['Task Scope'] === 'Instructor').length },
  ];
  const maxScope = Math.max(1, ...scopeCounts.map(s => s.val));

  const programDataCounts: Array<{ label: string; val: number; route: AppRoute }> = [
    { label: 'Courses in Catalog', val: programCourses.length, route: 'courses' },
    { label: 'Faculty Instructors', val: instructors.filter(i => i['Program ID'] === activeProgramId).length, route: 'faculty' },
    { label: 'Course Assignments', val: programAssignments.length, route: 'assignments' },
    { label: 'Accreditation Evidence', val: programEvidence.length, route: 'accreditation' },
    { label: 'Industry Credentials', val: credentials.filter(c => c['Program ID'] === activeProgramId).length, route: 'credentials' },
  ];
  const maxData = Math.max(1, ...programDataCounts.map(d => d.val));

  const setupChecklist = [
    {
      label: 'Program profile configured & active',
      done: Boolean(program),
      onClick: () => (onOpenProgramManager ? onOpenProgramManager() : onNavigate('settings')),
      actionLabel: 'Manage',
    },
    {
      label: 'Academic catalog courses loaded',
      done: programCourses.length > 0,
      onClick: () => onNavigate('courses'),
      actionLabel: 'View',
    },
    {
      label: 'Faculty roster & emails registered',
      done: instructors.filter(i => i['Program ID'] === activeProgramId).length > 0,
      onClick: () => onNavigate('faculty'),
      actionLabel: 'Manage',
    },
    {
      label: 'Course term assignments configured',
      done: programAssignments.length > 0,
      onClick: () => onNavigate('assignments'),
      actionLabel: 'Assign',
    },
    {
      label: 'Program Learning Outcomes (PLOs) defined',
      done: programPlos.length > 0,
      onClick: () => onNavigate('assessment'),
      actionLabel: 'Matrix',
    },
    {
      label: 'Accreditation oversight bodies linked',
      done: programBodies.length > 0,
      onClick: () => onNavigate('accreditation'),
      actionLabel: 'Evidence',
    },
    {
      label: 'Google Sheets direct database connected',
      done: isLiveConnected,
      onClick: () => onOpenSpreadsheetModal(),
      actionLabel: 'Connect',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Program Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {program?.['Program Code'] || 'PROG'}
              </span>
              <span className="text-xs text-slate-300">CIP {program?.CIP || '00.0000'}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-300">{program?.Division || 'Academic Division'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSpreadsheetModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium border border-white/10 transition backdrop-blur-sm"
              >
                <Database className="w-3.5 h-3.5 text-indigo-300" />
                <span>{isLiveConnected ? 'Spreadsheet Backend' : 'Configure Google Sheet'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {program?.['Program Name'] || 'Academic Program Operations'}
          </h1>
          <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
            Real-time academic management, learning outcome matrices, faculty operations, and continuous accreditation readiness—synchronized directly with your Google Sheets database.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-white/10">
            <button
              onClick={() => onNavigate('courses')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Courses</span>
            </button>
            <button
              onClick={() => onNavigate('workboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span>Work Board</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HLC Reports</span>
            </button>
            <button
              onClick={() => onNavigate('assessment')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Assessment</span>
            </button>
            <button
              onClick={() => onNavigate('accreditation')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accreditation Evidence</span>
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Academic Calendar</span>
            </button>
            {onOpenProgramManager && (
              <button
                onClick={onOpenProgramManager}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-300" />
                <span>Programs</span>
              </button>
            )}
            {onOpenWizardsHub && (
              <button
                onClick={onOpenWizardsHub}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 text-xs font-medium transition ml-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Wizards Hub</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Program Health Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Program Health & Oversight</h2>
            <p className="text-xs text-slate-500">Live operational diagnostic indicators derived from backend tables.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthCards.map(card => {
            const isGood = card.status === 'Good';
            const isWarn = card.status === 'Needs Attention';
            return (
              <div
                key={card.key}
                onClick={() => onNavigate(card.route)}
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isGood
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isWarn
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-1">{card.value}</div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{card.why}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                  <span>{card.action}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Snapshot Analytical Graphs */}
      <div>
        <div className="mb-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Program Operational Snapshot</h2>
          <p className="text-xs text-slate-500">Real-time breakdown of workload, task statuses, and institutional assets. Click any card to explore.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Work by Status */}
          <div
            onClick={() => onNavigate('workboard')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">Work by Workflow Stage</h3>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-xs text-slate-500 mb-4">Distribution of active tasks across Kanban stages.</p>
              <div className="space-y-2.5">
                {statusCounts.map(st => (
                  <div key={st.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>{st.label}</span>
                      <span className="font-bold text-slate-900">{st.val}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${st.color} transition-all duration-500`}
                        style={{ width: `${Math.max(4, (st.val / maxStatus) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-indigo-600 flex items-center justify-between">
              <span>Open Work Board</span>
              <span>→</span>
            </div>
          </div>

          {/* Open Work by Scope */}
          <div
            onClick={() => onNavigate('workboard')}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">Open Work by Scope</h3>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-xs text-slate-500 mb-4">Allocation between programmatic, course, and faculty tasks.</p>
              <div className="space-y-3 pt-2">
                {scopeCounts.map(sc => (
                  <div key={sc.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>{sc.label}</span>
                      <span className="font-bold text-slate-900">{sc.val}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${Math.max(4, (sc.val / maxScope) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] font-bold text-indigo-600 flex items-center justify-between">
              <span>Filter Work Board</span>
              <span>→</span>
            </div>
          </div>

          {/* Data Assets */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900">Institutional Record Volume</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Click to View</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">Live records stored in the program operations database.</p>
              <div className="space-y-2">
                {programDataCounts.map(d => (
                  <div
                    key={d.label}
                    onClick={() => onNavigate(d.route)}
                    className="p-1.5 -mx-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer group/row space-y-1"
                  >
                    <div className="flex justify-between text-xs font-medium text-slate-700 group-hover/row:text-indigo-600 transition">
                      <span className="truncate">{d.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{d.val}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover/row:text-indigo-600 group-hover/row:translate-x-0.5 transition" />
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 group-hover/row:bg-indigo-600 transition-all duration-300"
                        style={{ width: `${Math.max(4, (d.val / maxData) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started & Readiness Checklist */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900">Setup & Readiness Checklist</h3>
          <span className="text-xs text-slate-500">
            {setupChecklist.filter(i => i.done).length} of {setupChecklist.length} completed
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Key steps to achieve full academic operational maturity. Click any step to open its configuration or wizard.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {setupChecklist.map((item, idx) => (
            <div
              key={idx}
              onClick={item.onClick}
              className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer group hover:shadow-xs ${
                item.done
                  ? 'bg-emerald-50/50 border-emerald-200/70 text-slate-800 hover:border-emerald-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    item.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition'
                  }`}
                >
                  {item.done ? '✓' : idx + 1}
                </div>
                <span className="text-xs font-medium truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[11px] font-bold text-indigo-600 group-hover:underline">
                  {item.actionLabel}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
