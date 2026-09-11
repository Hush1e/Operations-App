import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import {
  Target,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  LayoutGrid,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AssessmentCenterProps {
  onOpenRecordModal: (module: string, record?: any, prefill?: any) => void;
}

export const AssessmentCenter: React.FC<AssessmentCenterProps> = ({ onOpenRecordModal }) => {
  const {
    activeProgramId,
    plos,
    clos,
    coursePloMaps,
    cloAssessmentMaps,
    assessments,
    courses,
    improvements,
  } = useData();

  const [activeTab, setActiveTab] = useState<'PLOS' | 'ALIGNMENT' | 'MATRIX' | 'MEASURES' | 'GAPS'>('PLOS');
  const [selectedPloFilter, setSelectedPloFilter] = useState<string>('ALL');
  const [selectedIndicatorFilter, setSelectedIndicatorFilter] = useState<string>('ALL');

  const programPlos = plos.filter(p => p['Program ID'] === activeProgramId && p.Active !== false && p.Active !== 'false');
  const programCourses = courses.filter(c => c['Program ID'] === activeProgramId && c.Active !== false && c.Active !== 'false');
  const programMaps = coursePloMaps.filter(m => m['Program ID'] === activeProgramId);
  const programAssessments = assessments.filter(a => a['Program ID'] === activeProgramId);

  // Helper to format I/R/F/S notation
  const getIrfsCode = (mapRecord: any) => {
    const parts: string[] = [];
    const level = (mapRecord['Development Level'] || '').toUpperCase().trim();
    const role = (mapRecord['Assessment Role'] || '').toUpperCase().trim();
    if (level === 'I' || level === 'R') parts.push(level);
    if (role === 'F' || role === 'S') parts.push(role);
    return parts.join('/');
  };

  // Assessment Gaps logic
  const gaps: { ploNumber: string; ploTitle: string; reason: string; item?: any }[] = [];
  programPlos.forEach(p => {
    const pAssessments = programAssessments.filter(a => a['PLO ID'] === p['PLO ID']);
    if (pAssessments.length === 0) {
      gaps.push({
        ploNumber: p['PLO Number'],
        ploTitle: p['PLO Title'],
        reason: 'No assessment measure tied to this program outcome.',
      });
    } else {
      pAssessments.forEach(a => {
        const missing: string[] = [];
        if (!a.Measure) missing.push('Measure specification');
        if (!a.Benchmark) missing.push('Benchmark criterion');
        if (!a.Result) missing.push('Evaluation results');
        if (!a['Evidence URL']) missing.push('Artifact evidence URL');
        if (missing.length > 0) {
          gaps.push({
            ploNumber: p['PLO Number'],
            ploTitle: p['PLO Title'],
            reason: `Missing required components: ${missing.join(', ')}`,
            item: a,
          });
        }
      });
    }
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            <span>Assessment & Learning Outcomes</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curriculum outcome mapping, developmental levels (I/R), assessment roles (F/S), and evidence benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenRecordModal('plos', null, { 'Program ID': activeProgramId, Active: true })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add PLO</span>
          </button>
          <button
            onClick={() =>
              onOpenRecordModal('courseplos', null, { 'Program ID': activeProgramId })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add Alignment</span>
          </button>
          <button
            onClick={() =>
              onOpenRecordModal('assessments', null, { 'Program ID': activeProgramId })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add Measure</span>
          </button>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        {[
          { id: 'PLOS', label: `Program Learning Outcomes (${programPlos.length})` },
          { id: 'ALIGNMENT', label: `Course Alignment Cards (${programMaps.length})` },
          { id: 'MATRIX', label: 'Curriculum Cross-Matrix' },
          { id: 'MEASURES', label: `Assessment Measures (${programAssessments.length})` },
          {
            id: 'GAPS',
            label: `Assessment Gaps (${gaps.length})`,
            alert: gaps.length > 0,
          },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.alert && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: PLOS LIST */}
      {activeTab === 'PLOS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programPlos.map(plo => {
              const mappedCourses = programMaps.filter(m => m['PLO ID'] === plo['PLO ID']);
              const measures = programAssessments.filter(a => a['PLO ID'] === plo['PLO ID']);

              return (
                <div
                  key={plo['PLO ID']}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {plo['PLO Number']}
                      </span>
                      <button
                        onClick={() => onOpenRecordModal('plos', plo)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Edit
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{plo['PLO Title']}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{plo['PLO Statement']}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>
                      <b>{mappedCourses.length}</b> Courses Aligned
                    </span>
                    <span>
                      <b>{measures.length}</b> Measures Configured
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COURSE ALIGNMENT CARDS */}
      {activeTab === 'ALIGNMENT' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            <select
              value={selectedPloFilter}
              onChange={e => setSelectedPloFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="ALL">All PLOs</option>
              {programPlos.map(p => (
                <option key={p['PLO ID']} value={p['PLO ID']}>
                  {p['PLO Number']} — {p['PLO Title']}
                </option>
              ))}
            </select>

            <select
              value={selectedIndicatorFilter}
              onChange={e => setSelectedIndicatorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="ALL">All Indicators</option>
              <option value="I">Introduced (I)</option>
              <option value="R">Reinforced (R)</option>
              <option value="F">Formative (F)</option>
              <option value="S">Summative (S)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programCourses.map(c => {
              let courseMaps = programMaps.filter(m => m['Course ID'] === c['Course ID']);
              if (selectedPloFilter !== 'ALL') {
                courseMaps = courseMaps.filter(m => m['PLO ID'] === selectedPloFilter);
              }
              if (selectedIndicatorFilter !== 'ALL') {
                courseMaps = courseMaps.filter(m => {
                  const code = getIrfsCode(m);
                  return code.includes(selectedIndicatorFilter);
                });
              }

              if (courseMaps.length === 0 && (selectedPloFilter !== 'ALL' || selectedIndicatorFilter !== 'ALL')) {
                return null;
              }

              return (
                <div key={c['Course ID']} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{c['Course Code']}</span>
                      <span className="text-xs text-slate-500 ml-1.5">— {c['Course Title']}</span>
                    </div>
                    <button
                      onClick={() =>
                        onOpenRecordModal('courseplos', null, {
                          'Program ID': activeProgramId,
                          'Course ID': c['Course ID'],
                        })
                      }
                      className="text-xs text-indigo-600 font-semibold"
                    >
                      + Align PLO
                    </button>
                  </div>

                  <div className="space-y-2 pt-1">
                    {courseMaps.length === 0 ? (
                      <div className="text-xs text-slate-400 py-2">No PLO alignment documented yet.</div>
                    ) : (
                      courseMaps.map(m => {
                        const plo = (programPlos || []).find(p => p['PLO ID'] === m['PLO ID']);
                        const code = getIrfsCode(m);
                        return (
                          <div
                            key={m['Mapping ID']}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800">
                                {plo ? plo['PLO Number'] : m['PLO ID']}
                              </span>
                              <div className="text-[11px] text-slate-500">{plo?.['PLO Title']}</div>
                              {m.Notes && <div className="text-[10px] text-slate-400">{m.Notes}</div>}
                            </div>
                            <span className="font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {code || 'Not classified'}
                            </span>
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
      )}

      {/* TAB 3: CURRICULUM CROSS-MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="p-3 bg-slate-50/80 border-b border-slate-200 text-xs text-slate-600">
            <b>Assessment Notation:</b> I = Introduced · R = Reinforced · F = Formative Assessment · S = Summative Assessment. Only one summative (S) is permitted per PLO across the entire curriculum.
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Course Code & Title</th>
                {programPlos.map(p => (
                  <th key={p['PLO ID']} className="p-3 text-center min-w-[110px]" title={p['PLO Statement']}>
                    {p['PLO Number']}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programCourses.map(course => (
                <tr key={course['Course ID']} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-800">
                    {course['Course Code']} <span className="font-normal text-slate-500">— {course['Course Title']}</span>
                  </td>
                  {programPlos.map(plo => {
                    const match = (programMaps || []).find(
                      m => m['Course ID'] === course['Course ID'] && m['PLO ID'] === plo['PLO ID']
                    );
                    const code = match ? getIrfsCode(match) : null;
                    const isSummative = code?.includes('S');

                    return (
                      <td key={plo['PLO ID']} className="p-3 text-center">
                        {code ? (
                          <span
                            className={`font-bold px-2 py-1 rounded-md text-[11px] ${
                              isSummative
                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {code}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: MEASURES & BENCHMARKS */}
      {activeTab === 'MEASURES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programAssessments.map(asm => {
              const plo = (programPlos || []).find(p => p['PLO ID'] === asm['PLO ID']);
              const course = (programCourses || []).find(c => c['Course ID'] === asm['Course ID']);

              return (
                <div key={asm['Assessment ID']} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {plo?.['PLO Number']} {course ? `• ${course['Course Code']}` : ''}
                    </span>
                    <button
                      onClick={() => onOpenRecordModal('assessments', asm)}
                      className="text-xs text-indigo-600 font-semibold"
                    >
                      Edit Measure
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{asm.Measure}</h3>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div><b>Benchmark:</b> {asm.Benchmark}</div>
                    <div><b>Result:</b> {asm.Result || 'Not yet recorded for current cycle.'}</div>
                    {asm.Finding && <div><b>Finding:</b> {asm.Finding}</div>}
                    {asm['Action Needed'] && (
                      <div className="text-amber-800 font-medium"><b>Action Needed:</b> {asm['Action Needed']}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ASSESSMENT GAPS */}
      {activeTab === 'GAPS' && (
        <div className="space-y-4">
          {gaps.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-emerald-800 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-sm">No Assessment Gaps Detected!</div>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                All active Program Learning Outcomes have active direct measures, clear benchmarks, recorded results, and supporting artifact evidence URLs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                The following {gaps.length} gap(s) require attention before accreditation or academic quality reviews:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gaps.map((gap, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border border-rose-200 bg-rose-50/20 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="font-bold text-xs text-slate-900">
                        {gap.ploNumber}: {gap.ploTitle}
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 font-medium">{gap.reason}</p>
                    <div className="pt-2">
                      <button
                        onClick={() =>
                          gap.item
                            ? onOpenRecordModal('assessments', gap.item)
                            : onOpenRecordModal('assessments', null, { 'Program ID': activeProgramId })
                        }
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        {gap.item ? 'Resolve Assessment Gap →' : 'Add Measure for this PLO →'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
