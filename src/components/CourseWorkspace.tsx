import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { CourseRecord } from '../types';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowLeft,
  Award,
  ShieldCheck,
  FileSpreadsheet,
  Target,
  FileCheck,
  ListTodo,
  Sparkles,
} from 'lucide-react';

interface CourseWorkspaceProps {
  onOpenRecordModal: (module: string, record?: any, prefill?: any) => void;
}

export const CourseWorkspace: React.FC<CourseWorkspaceProps> = ({ onOpenRecordModal }) => {
  const {
    activeProgramId,
    courses,
    assignments,
    components,
    clos,
    coursePloMaps,
    cloAssessmentMaps,
    activities,
    assessments,
    credentials,
    tasks,
    accreditationEvidence,
    plos,
  } = useData();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const programCourses = courses.filter(
    c => c['Program ID'] === activeProgramId && c.Active !== false && c.Active !== 'false'
  );

  const filteredCourses = programCourses.filter(c => {
    const q = searchTerm.toLowerCase();
    return c['Course Code']?.toLowerCase().includes(q) || c['Course Title']?.toLowerCase().includes(q);
  });

  const selectedCourse = (programCourses || []).find(c => c['Course ID'] === selectedCourseId);

  // If viewing a specific course workspace:
  if (selectedCourse) {
    const courseAssignments = assignments.filter(
      a => a['Program ID'] === activeProgramId && a['Course ID'] === selectedCourse['Course ID'] && a.Status !== 'Cancelled'
    );
    const courseClos = clos.filter(
      c => c['Program ID'] === activeProgramId && c['Course ID'] === selectedCourse['Course ID']
    );
    const coursePloAlignments = coursePloMaps.filter(
      m => m['Program ID'] === activeProgramId && m['Course ID'] === selectedCourse['Course ID']
    );
    const courseCloMaps = cloAssessmentMaps.filter(
      m => m['Program ID'] === activeProgramId && m['Course ID'] === selectedCourse['Course ID']
    );
    const courseActivities = activities.filter(
      a => a['Program ID'] === activeProgramId && a['Course ID'] === selectedCourse['Course ID']
    );
    const courseAssessments = assessments.filter(
      a => a['Program ID'] === activeProgramId && a['Course ID'] === selectedCourse['Course ID']
    );
    const courseCredentials = credentials.filter(
      c => c['Program ID'] === activeProgramId && c['Course ID'] === selectedCourse['Course ID']
    );
    const courseTasks = tasks.filter(
      t => t['Program ID'] === activeProgramId && t['Course ID'] === selectedCourse['Course ID'] && t.Archived !== true && t.Archived !== 'true'
    );
    const courseEvidence = accreditationEvidence.filter(
      e => e['Program ID'] === activeProgramId && e['Course ID'] === selectedCourse['Course ID']
    );

    // Matrix calculations
    const cloIdsWithSummative = new Set(
      courseCloMaps.filter(m => m['Assessment Role'] === 'S').map(m => m['CLO ID'])
    );

    return (
      <div className="space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelectedCourseId(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenRecordModal('courses', selectedCourse)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              Edit Course Properties
            </button>
          </div>
        </div>

        {/* Course Header Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedCourse['Course Code']}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {selectedCourse.Credits} Credit Hours
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {selectedCourse['Length Weeks'] || 8} Weeks Duration
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {selectedCourse['Term Placement'] || 'Core Sequence'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedCourse['Course Title']}</h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
            {selectedCourse.Description || 'No formal course catalog description provided.'}
          </p>
        </div>

        {/* Quick KPI Bar for Course */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Sections</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{courseAssignments.length}</div>
            <div className="text-[11px] text-slate-400">Current terms</div>
          </div>
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course Outcomes</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{courseClos.length} CLOs</div>
            <div className="text-[11px] text-slate-400">Approved statements</div>
          </div>
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Summative Validation</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {cloIdsWithSummative.size} / {courseClos.length || 0}
            </div>
            <div className="text-[11px] text-slate-400">CLOs with formal 'S'</div>
          </div>
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignments & Labs</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{courseActivities.length}</div>
            <div className="text-[11px] text-slate-400">Inventoried tasks</div>
          </div>
        </div>

        {/* Sections & Instructors */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Instructional Assignments</h3>
              <p className="text-xs text-slate-500">Sections, delivery modalities, parts of term, and lead instructors.</p>
            </div>
            <button
              onClick={() =>
                onOpenRecordModal('assignments', null, {
                  'Program ID': activeProgramId,
                  'Course ID': selectedCourse['Course ID'],
                })
              }
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Assignment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courseAssignments.length === 0 ? (
              <div className="col-span-2 text-xs text-slate-400 py-3 text-center border border-dashed rounded-lg">
                No course assignments currently scheduled for this course.
              </div>
            ) : (
              courseAssignments.map(a => {
                const comps = components.filter(c => c['Assignment ID'] === a['Assignment ID']);
                return (
                  <div key={a['Assignment ID']} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Section {a.Section} ({a['Term ID']})
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {a['Part of Term']}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div>
                        <b>Modality:</b> {a.Modality} {a['Delivery Label'] ? `(${a['Delivery Label']})` : ''}
                      </div>
                      <div>
                        <b>Instructor:</b> {a['Instructor Email'] || 'Unassigned'}
                      </div>
                      <div>
                        <b>Dates:</b> {a['Start Date']} → {a['End Date']}
                      </div>
                    </div>

                    {comps.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Components:</div>
                        {comps.map((comp, compIdx) => (
                          <div key={comp['Component ID'] || `comp-${compIdx}`} className="text-xs text-slate-700 flex justify-between bg-white p-1.5 rounded border border-slate-200">
                            <span>{comp['Component Type']} ({comp.Modality})</span>
                            <span className="text-slate-500">{comp['Instructor Email']}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Course Learning Outcomes (CLOs) & CLO Assessment Mapping */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Course Learning Outcomes (CLOs)</h3>
              <p className="text-xs text-slate-500">
                Approved outcomes and direct assessment mapping (I = Introduced, R = Reinforced, F = Formative, S = Summative).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  onOpenRecordModal('clos', null, {
                    'Program ID': activeProgramId,
                    'Course ID': selectedCourse['Course ID'],
                  })
                }
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add CLO</span>
              </button>
              <button
                onClick={() =>
                  onOpenRecordModal('cloassessments', null, {
                    'Program ID': activeProgramId,
                    'Course ID': selectedCourse['Course ID'],
                  })
                }
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Map Assessment</span>
              </button>
            </div>
          </div>

          {/* CLOs List */}
          <div className="space-y-2">
            {courseClos.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center border border-dashed rounded-lg">
                No course learning outcomes defined yet. Click "+ Add CLO" to create approved outcome statements.
              </div>
            ) : (
              courseClos.map((clo, cloIdx) => {
                const mappings = courseCloMaps.filter(m => m['CLO ID'] === clo['CLO ID']);
                const hasSummative = mappings.some(m => m['Assessment Role'] === 'S');
                const cloKey = clo['CLO ID'] || `clo-${cloIdx}`;

                return (
                  <div key={cloKey} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {clo['CLO Number']}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            hasSummative
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {hasSummative ? 'Summative S Assigned' : 'Needs Summative S'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{clo['Source / Approval']}</span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">{clo['CLO Statement']}</p>

                    {mappings.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
                        {mappings.map((m, mapIdx) => (
                          <span
                            key={m['Mapping ID'] || `map-${mapIdx}`}
                            className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md bg-white border border-slate-200 shadow-2xs"
                          >
                            <span className="font-bold text-slate-900">{m['Assessment Name']}</span>
                            <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                              {m['Development Level']}/{m['Assessment Role']}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Assignments & Hands-on Activities Inventory */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Assignments & Learning Activities Inventory</h3>
              <p className="text-xs text-slate-500">
                Detailed audit of what students actually complete, category classifications, and assessment usage.
              </p>
            </div>
            <button
              onClick={() =>
                onOpenRecordModal('activities', null, {
                  'Program ID': activeProgramId,
                  'Course ID': selectedCourse['Course ID'],
                })
              }
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Activity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courseActivities.length === 0 ? (
              <div className="col-span-full text-xs text-slate-400 py-4 text-center border border-dashed rounded-lg">
                No assignments or activities inventoried yet. Documenting activities helps differentiate practice vs formal assessment.
              </div>
            ) : (
              courseActivities.map((act, actIdx) => (
                <div key={act['Activity ID'] || `act-${actIdx}`} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      Week {act.Week}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        act['Assessment Use'] === 'Summative'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : act['Assessment Use'] === 'Formative'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {act['Assessment Use'] || 'Practice Only'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{act['Activity Name']}</h4>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>Category: {act.Category} ({act['Grade Weight'] || 'Graded'})</div>
                    {act['Credential Connection'] && (
                      <div className="text-indigo-600 font-medium">🏅 {act['Credential Connection']}</div>
                    )}
                    {act['Applied AI'] && (
                      <div className="text-slate-600">AI: {act['Applied AI']}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Catalog view listing all courses
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Academic Course Catalog & Workspaces</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any course to open its dedicated workspace, outcome matrices, and assignment inventories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenRecordModal('courses', null, { 'Program ID': activeProgramId })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by course code or title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredCourses.length} of {programCourses.length} courses
        </div>
      </div>

      {/* Course Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course, crsIdx) => {
          const courseKey = course['Course ID'] || `crs-${crsIdx}`;
          const courseAssignments = assignments.filter(
            a => a['Program ID'] === activeProgramId && a['Course ID'] === course['Course ID'] && a.Status !== 'Cancelled'
          );
          const courseClos = clos.filter(
            c => c['Program ID'] === activeProgramId && c['Course ID'] === course['Course ID']
          );
          const courseActivities = activities.filter(
            a => a['Program ID'] === activeProgramId && a['Course ID'] === course['Course ID']
          );

          return (
            <div
              key={courseKey}
              id={`course-card-${courseKey}`}
              onClick={() => setSelectedCourseId(course['Course ID'])}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {course['Course Code']}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {course.Credits} Credits • {course['Length Weeks'] || 8} Wks
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition">
                  {course['Course Title']}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {course.Description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span><b>{courseAssignments.length}</b> Sections</span>
                  <span>•</span>
                  <span><b>{courseClos.length}</b> CLOs</span>
                  <span>•</span>
                  <span><b>{courseActivities.length}</b> Activities</span>
                </div>
                <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition">
                  Open →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
