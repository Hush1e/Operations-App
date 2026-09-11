import React from 'react';
import { useData } from '../services/dataContext';
import { TrendingUp, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ContinuousImprovementProps {
  onOpenRecordModal: (module: string, record?: any, prefill?: any) => void;
}

export const ContinuousImprovement: React.FC<ContinuousImprovementProps> = ({ onOpenRecordModal }) => {
  const { activeProgramId, improvements } = useData();

  const programImprovements = improvements.filter(i => i['Program ID'] === activeProgramId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>Continuous Improvement & "Closing the Loop"</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal action plans driven by annual assessment findings, advisory committee guidance, and faculty reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenRecordModal('improvements', null, {
                'Program ID': activeProgramId,
                Status: 'In Progress',
                'Target Term': 'Fall 2026',
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Improvement Plan</span>
          </button>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {programImprovements.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-xs text-slate-400">
            No continuous improvement action plans logged yet. Continuous quality improvement is required by HLC Criteria 4.
          </div>
        ) : (
          programImprovements.map((plan, index) => {
            const isDone = plan.Status === 'Complete' || plan.Status === 'Resolved';
            const itemKey =
              plan['Improvement ID'] ||
              (plan as any)['CIP Action ID'] ||
              `cip-${plan['Program ID'] || activeProgramId}-${index}`;

            const actionTitle = plan.Action || (plan as any)['Action Title'] || 'Continuous Improvement Action';
            const findingText =
              plan['Issue/Finding'] ||
              (plan as any)['Finding / Trigger'] ||
              'Assessment and annual performance review finding';
            const targetDate = plan['Target Date'] || (plan as any)['Target Term'] || 'Ongoing';

            return (
              <div
                key={itemKey}
                id={`cip-card-${itemKey}`}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Target: {targetDate}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {plan.Status || 'Active'}
                    </span>
                  </div>
                  <button
                    id={`cip-edit-${itemKey}`}
                    onClick={() => onOpenRecordModal('improvements', plan)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{actionTitle}</h3>
                  <div className="text-xs text-slate-600 mt-0.5">
                    <b>Identified Issue / Finding:</b> {findingText}
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <b>Action Strategy:</b> {actionTitle}
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Lead Owner: <b>{plan['Owner Email'] || 'Faculty Review Team'}</b></span>
                  {plan['Evidence URL'] ? (
                    <a
                      href={plan['Evidence URL']}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      View Evidence Artifact →
                    </a>
                  ) : (
                    <span>Impact Measure: <b>{(plan as any)['Impact Measure'] || 'Evaluation at cycle end'}</b></span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
