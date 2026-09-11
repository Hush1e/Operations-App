import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { Users, Plus, Mail, BookOpen, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FacultyWorkloadProps {
  onOpenRecordModal: (module: string, record?: any, prefill?: any) => void;
}

export const FacultyWorkload: React.FC<FacultyWorkloadProps> = ({ onOpenRecordModal }) => {
  const { activeProgramId, instructors, assignments, tasks, courses } = useData();

  const programInstructors = instructors.filter(i => i['Program ID'] === activeProgramId);
  const programAssignments = assignments.filter(
    a => a['Program ID'] === activeProgramId && a.Status !== 'Cancelled'
  );
  const programTasks = tasks.filter(
    t => t['Program ID'] === activeProgramId && t.Archived !== true && t.Archived !== 'true'
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Faculty Roster & Instructional Workload</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty profiles, section allocations, part-time/full-time caps, and assigned operational work.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenRecordModal('instructors', null, { 'Program ID': activeProgramId, Active: true })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </button>
        </div>
      </div>

      {/* Instructor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programInstructors.map((inst, idx) => {
          const instKey = inst['Instructor ID'] || `inst-${idx}`;
          const instAssignments = programAssignments.filter(
            a => a['Instructor Email']?.toLowerCase() === inst['Instructor Email']?.toLowerCase()
          );
          const instTasks = programTasks.filter(
            t => t['Owner Email']?.toLowerCase() === inst['Instructor Email']?.toLowerCase()
          );
          const overdueTasks = instTasks.filter(
            t => t['Due Date'] && new Date(t['Due Date']) < new Date() && t.Status !== 'COMPLETE'
          );

          // Calculate total credits teaching
          const totalCredits = instAssignments.reduce((sum, a) => {
            const c = (courses || []).find(course => course['Course ID'] === a['Course ID']);
            return sum + (Number(c?.Credits) || 3);
          }, 0);

          return (
            <div
              key={instKey}
              id={`instructor-card-${instKey}`}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {inst.Type || 'Adjunct / Part-Time'}
                  </span>
                  <button
                    id={`instructor-edit-${instKey}`}
                    onClick={() => onOpenRecordModal('instructors', inst)}
                    className="text-xs text-indigo-600 font-semibold cursor-pointer hover:text-indigo-800"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{inst['Instructor Name']}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{inst['Instructor Email']}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <b>Target Load:</b> {inst['Target Load'] || 12} credits (Max: {inst['Max Load'] || 15})
                  </div>
                  <div>
                    <b>Current Scheduled:</b> {totalCredits} credits ({instAssignments.length} sections)
                  </div>
                  {inst.Credentials && (
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      <b>Quals:</b> {inst.Credentials}
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Summary */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  <b>{instTasks.length}</b> Assigned Tasks
                </span>
                {overdueTasks.length > 0 ? (
                  <span className="text-rose-600 font-bold">{overdueTasks.length} Overdue</span>
                ) : (
                  <span className="text-emerald-600 font-medium">On Schedule</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
