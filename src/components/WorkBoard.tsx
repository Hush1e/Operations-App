import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { TaskRecord, TaskStatus, TaskScope, Priority } from '../types';
import {
  Plus,
  Filter,
  KanbanSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  User,
  Repeat,
  FileCheck2,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';

interface WorkBoardProps {
  onOpenTaskModal: (task?: TaskRecord) => void;
  onOpenPrepareWizard: () => void;
  onOpenTemplateWizard: () => void;
  onOpenRecurringWizard: () => void;
  onOpenAssignInstructorWizard: () => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string }[] = [
  { id: 'TO DO', label: 'To Do', color: 'border-slate-300 text-slate-700', bg: 'bg-slate-100/60' },
  { id: 'READY', label: 'Ready', color: 'border-blue-300 text-blue-800', bg: 'bg-blue-50/50' },
  { id: 'IN PROGRESS', label: 'In Progress', color: 'border-amber-300 text-amber-800', bg: 'bg-amber-50/50' },
  { id: 'WAITING/BLOCKED', label: 'Blocked / Waiting', color: 'border-rose-300 text-rose-800', bg: 'bg-rose-50/50' },
  { id: 'REVIEW NEEDED', label: 'Review Needed', color: 'border-purple-300 text-purple-800', bg: 'bg-purple-50/50' },
  { id: 'COMPLETE', label: 'Complete', color: 'border-emerald-300 text-emerald-800', bg: 'bg-emerald-50/50' },
];

const PRIORITY_BADGES: Record<Priority, string> = {
  Critical: 'bg-rose-100 text-rose-800 border-rose-200',
  High: 'bg-amber-100 text-amber-800 border-amber-200',
  Normal: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const WorkBoard: React.FC<WorkBoardProps> = ({
  onOpenTaskModal,
  onOpenPrepareWizard,
  onOpenTemplateWizard,
  onOpenRecurringWizard,
  onOpenAssignInstructorWizard,
}) => {
  const {
    activeProgramId,
    tasks,
    courses,
    instructors,
    updateTaskStatus,
    generateRecurringTasks,
  } = useData();

  const [scopeFilter, setScopeFilter] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [quickFilter, setQuickFilter] = useState<'ALL' | 'OVERDUE' | 'BLOCKED' | 'MINE'>('ALL');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const programTasks = tasks.filter(
    t => t['Program ID'] === activeProgramId && t.Archived !== true && t.Archived !== 'true'
  );

  const programCourses = courses.filter(c => c['Program ID'] === activeProgramId);
  const courseMap = new Map(programCourses.map(c => [c['Course ID'], c['Course Code']]));

  const programInstructors = instructors.filter(i => i['Program ID'] === activeProgramId);
  const instructorMap = new Map(programInstructors.map(i => [i['Instructor Email'].toLowerCase(), i['Instructor Name']]));

  // Filtering
  const filteredTasks = programTasks.filter(task => {
    if (scopeFilter !== 'ALL' && task['Task Scope'] !== scopeFilter) return false;
    if (ownerFilter !== 'ALL' && task['Owner Email']?.toLowerCase() !== ownerFilter.toLowerCase()) return false;
    if (courseFilter !== 'ALL' && task['Course ID'] !== courseFilter) return false;

    if (quickFilter === 'OVERDUE') {
      if (!task['Due Date'] || task.Status === 'COMPLETE') return false;
      return new Date(task['Due Date']) < new Date();
    }
    if (quickFilter === 'BLOCKED') {
      return task.Status === 'WAITING/BLOCKED';
    }

    return true;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      updateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  const handleGenerateRecurring = async () => {
    const defaultDate = new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0];
    const dateInput = window.prompt('Generate recurring task cards through date (YYYY-MM-DD):', defaultDate);
    if (dateInput) {
      const res = await generateRecurringTasks(dateInput);
      alert(`Created ${res.added} recurring task card(s). Skipped ${res.skipped} existing occurrences.`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Wizards Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <KanbanSquare className="w-6 h-6 text-indigo-600" />
            <span>Academic Work Board</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive drag-and-drop workflow tracking program, course, and faculty obligations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenTaskModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
          <button
            onClick={onOpenPrepareWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Prepare Term Courses</span>
          </button>
          <button
            onClick={onOpenTemplateWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Use Template</span>
          </button>
          <button
            onClick={onOpenRecurringWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition"
          >
            <Repeat className="w-3.5 h-3.5 text-slate-500" />
            <span>Recurring Rules</span>
          </button>
          <button
            onClick={handleGenerateRecurring}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Generate Due Tasks</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-500 uppercase tracking-wider text-[11px] pr-2 border-r border-slate-200">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </div>

          {/* Scope Selector */}
          <select
            value={scopeFilter}
            onChange={e => setScopeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Scopes</option>
            <option value="Program">Program Scope</option>
            <option value="Course">Course Scope</option>
            <option value="Instructor">Instructor Scope</option>
          </select>

          {/* Owner Selector */}
          <select
            value={ownerFilter}
            onChange={e => setOwnerFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 max-w-[160px] truncate"
          >
            <option value="ALL">All Owners</option>
            {programInstructors.map(i => (
              <option key={i['Instructor ID']} value={i['Instructor Email']}>
                {i['Instructor Name']}
              </option>
            ))}
          </select>

          {/* Course Selector */}
          <select
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 max-w-[160px] truncate"
          >
            <option value="ALL">All Courses</option>
            {programCourses.map(c => (
              <option key={c['Course ID']} value={c['Course ID']}>
                {c['Course Code']}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setQuickFilter('ALL')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              quickFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({programTasks.length})
          </button>
          <button
            onClick={() => setQuickFilter('OVERDUE')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              quickFilter === 'OVERDUE' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setQuickFilter('BLOCKED')}
            className={`px-2.5 py-1 rounded-full font-medium transition ${
              quickFilter === 'BLOCKED' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Blocked
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 min-h-[550px]">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.Status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              className={`rounded-xl border border-slate-200 p-3 flex flex-col ${col.bg} transition`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                <span className="font-bold text-xs text-slate-800 tracking-tight">{col.label}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[700px] pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-300/80 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">
                    Drop cards here
                  </div>
                ) : (
                  colTasks.map((task, idx) => {
                    const taskKey = task['Task ID'] || `tsk-${col.id}-${idx}`;
                    const courseCode = task['Course ID'] ? courseMap.get(task['Course ID']) : null;
                    const ownerName = task['Owner Email']
                      ? instructorMap.get(task['Owner Email'].toLowerCase()) || task['Owner Email'].split('@')[0]
                      : 'Unassigned';

                    const isOverdue =
                      task['Due Date'] && new Date(task['Due Date']) < new Date() && task.Status !== 'COMPLETE';

                    return (
                      <div
                        key={taskKey}
                        id={`task-card-${taskKey}`}
                        draggable
                        onDragStart={e => handleDragStart(e, task['Task ID'])}
                        onClick={() => onOpenTaskModal(task)}
                        className="bg-white rounded-xl p-3 border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md transition cursor-grab active:cursor-grabbing group space-y-2 select-none"
                      >
                        {/* Scope & Course badges */}
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {task['Task Scope']}
                          </span>
                          {courseCode && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 truncate max-w-[90px]">
                              {courseCode}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ml-auto ${
                              PRIORITY_BADGES[task.Priority || 'Normal']
                            }`}
                          >
                            {task.Priority || 'Normal'}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                          {task.Title}
                        </div>

                        {/* Blocked notice if any */}
                        {task.Status === 'WAITING/BLOCKED' && task['Blocked Reason'] && (
                          <div className="text-[11px] bg-rose-50 text-rose-700 p-1.5 rounded border border-rose-200 font-medium">
                            ⚠️ {task['Blocked Reason']}
                          </div>
                        )}

                        {/* Footer: Owner & Due date */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="truncate max-w-[100px] font-medium text-slate-600">{ownerName}</span>
                          {task['Due Date'] && (
                            <span
                              className={`flex items-center gap-1 font-semibold ${
                                isOverdue ? 'text-rose-600' : 'text-slate-500'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {task['Due Date'].slice(5)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
