import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { FileText, Plus, Search, Filter, Layers, Calendar, User } from 'lucide-react';

interface CourseAssignmentsProps {
  onOpenRecordModal: (module: string, record?: any, prefill?: any) => void;
}

export const CourseAssignments: React.FC<CourseAssignmentsProps> = ({ onOpenRecordModal }) => {
  const { activeProgramId, assignments, courses, instructors } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [termFilter, setTermFilter] = useState('ALL');

  const programAssignments = assignments.filter(
    a => a['Program ID'] === activeProgramId && a.Status !== 'Cancelled'
  );
  const terms = Array.from(new Set(programAssignments.map(a => a['Term ID']).filter(Boolean)));

  const courseMap = new Map(courses.map(c => [c['Course ID'], c]));
  const instructorMap = new Map(instructors.map(i => [i['Instructor Email']?.toLowerCase(), i['Instructor Name']]));

  const filtered = programAssignments.filter(a => {
    if (termFilter !== 'ALL' && a['Term ID'] !== termFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const course = courseMap.get(a['Course ID']);
      return (
        course?.['Course Code']?.toLowerCase().includes(q) ||
        course?.['Course Title']?.toLowerCase().includes(q) ||
        a['Instructor Email']?.toLowerCase().includes(q) ||
        a.Section?.toLowerCase().includes(q)
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
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Course Section Assignments</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational schedule of term course offerings, sections, delivery modalities, and instructor loads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenRecordModal('assignments', null, {
                'Program ID': activeProgramId,
                'Term ID': 'FA26',
                'Part of Term': 'Full Term',
                Modality: 'Online',
                Status: 'Scheduled',
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
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
              placeholder="Search course code, title, instructor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={termFilter}
            onChange={e => setTermFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="ALL">All Academic Terms</option>
            {terms.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {programAssignments.length} assignments
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">Term & Section</th>
              <th className="p-3">Course</th>
              <th className="p-3">Modality</th>
              <th className="p-3">Part of Term</th>
              <th className="p-3">Instructor</th>
              <th className="p-3">Dates</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((a, aIdx) => {
              const asgKey = a['Assignment ID'] || `asg-${aIdx}`;
              const course = courseMap.get(a['Course ID']);
              const instructorName = a['Instructor Email']
                ? instructorMap.get(a['Instructor Email'].toLowerCase()) || a['Instructor Email']
                : 'Unassigned';

              return (
                <tr key={asgKey} id={`assignment-row-${asgKey}`} className="hover:bg-slate-50/60">
                  <td className="p-3 font-semibold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 mr-1.5">{a['Term ID']}</span>
                    Sec {a.Section}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900">{course?.['Course Code']}</span>
                    <span className="text-slate-500 ml-1.5">— {course?.['Course Title']}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {a.Modality}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{a['Part of Term']}</td>
                  <td className="p-3 font-medium text-slate-800">{instructorName}</td>
                  <td className="p-3 text-slate-500">
                    {a['Start Date']} → {a['End Date']}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      id={`assignment-edit-${asgKey}`}
                      onClick={() => onOpenRecordModal('assignments', a)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
