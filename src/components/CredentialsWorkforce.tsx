import React from 'react';
import { useData } from '../services/dataContext';
import { Award, Plus, ExternalLink, BookOpen, Layers } from 'lucide-react';

interface CredentialsWorkforceProps {
  onOpenRecordModal: (module: string, record?: any, prefill?: any) => void;
}

export const CredentialsWorkforce: React.FC<CredentialsWorkforceProps> = ({ onOpenRecordModal }) => {
  const { activeProgramId, credentials, courses } = useData();

  const programCredentials = credentials.filter(c => c['Program ID'] === activeProgramId);
  const courseMap = new Map(courses.map(c => [c['Course ID'], c]));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>Industry Credentials & Workforce Alignment</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Third-party professional certifications embedded in curriculum (e.g. CompTIA, AWS, Cisco, ASE, OSHA).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenRecordModal('credentials', null, {
                'Program ID': activeProgramId,
                'Embedded or Optional': 'Embedded in Coursework',
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Credential</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programCredentials.map((cred, index) => {
          const course = courseMap.get(cred['Course ID']);
          const itemKey = cred['Credential ID'] || `cred-${index}`;
          const provider = cred.Provider || cred['Issuing Body'] || 'Industry Certification';
          const credUrl = cred.URL || cred['Website / Vendor URL'];

          return (
            <div
              key={itemKey}
              id={`cred-card-${itemKey}`}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {provider}
                  </span>
                  <button
                    id={`cred-edit-${itemKey}`}
                    onClick={() => onOpenRecordModal('credentials', cred)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cred['Credential Name']}</h3>
                  {cred['Exam Code'] && (
                    <div className="text-xs font-mono text-slate-500 mt-0.5">Exam: {cred['Exam Code']}</div>
                  )}
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                  {course && (
                    <div>
                      <b>Aligned Course:</b> {course['Course Code']} — {course['Course Title']}
                    </div>
                  )}
                  <div>
                    <b>Model:</b> {cred['Required/Optional'] || cred['Embedded or Optional'] || 'Curricular alignment'}
                  </div>
                  {cred.Classification && <div><b>Classification:</b> {cred.Classification}</div>}
                  {cred.Cost && <div><b>Student Cost:</b> {cred.Cost}</div>}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Status: <b className="text-emerald-700">{cred.Status || 'Active Alignment'}</b></span>
                {credUrl && (
                  <a
                    href={credUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <span>Provider</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
