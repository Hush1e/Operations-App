import React, { useState, useEffect } from 'react';
import { useData } from '../services/dataContext';
import { X, Save, Trash2 } from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  module: string | null;
  record: any | null;
  prefill?: any;
  onClose: () => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  module,
  record,
  prefill,
  onClose,
}) => {
  const {
    activeProgramId,
    courses,
    instructors,
    plos,
    clos,
    saveRecord,
    deleteRecord,
  } = useData();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    } else if (prefill) {
      setFormData({
        'Program ID': activeProgramId,
        ...prefill,
      });
    } else {
      setFormData({
        'Program ID': activeProgramId,
      });
    }
  }, [record, prefill, activeProgramId, isOpen]);

  if (!isOpen || !module) return null;

  const handleFieldChange = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Ensure primary key exists if new record
      const idFields: Record<string, string> = {
        courses: 'Course ID',
        instructors: 'Instructor ID',
        tasks: 'Task ID',
        assignments: 'Assignment ID',
        components: 'Component ID',
        plos: 'PLO ID',
        clos: 'CLO ID',
        courseplos: 'Mapping ID',
        cloassessments: 'Mapping ID',
        activities: 'Activity ID',
        assessments: 'Assessment ID',
        bodies: 'Body ID',
        accreditation: 'Evidence ID',
        advising: 'Advisee ID',
        advisees: 'Advisee ID',
        credentials: 'Credential ID',
        improvements: 'Improvement ID',
        improvement: 'Improvement ID',
        calendar: 'Calendar ID',
      };

      const idField = idFields[module] || 'ID';
      const recordToSave = { ...formData };
      if (!recordToSave[idField]) {
        recordToSave[idField] = `${module.toUpperCase().slice(0, 3)}_${Date.now()}`;
      }
      if (!recordToSave['Program ID']) {
        recordToSave['Program ID'] = activeProgramId;
      }

      await saveRecord(module, recordToSave);
      onClose();
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setIsSaving(true);
    try {
      const idFields: Record<string, string> = {
        courses: 'Course ID',
        instructors: 'Instructor ID',
        tasks: 'Task ID',
        assignments: 'Assignment ID',
        plos: 'PLO ID',
        clos: 'CLO ID',
        courseplos: 'Mapping ID',
        cloassessments: 'Mapping ID',
        activities: 'Activity ID',
        assessments: 'Assessment ID',
        bodies: 'Body ID',
        accreditation: 'Evidence ID',
        advisees: 'Advisee ID',
        credentials: 'Credential ID',
        improvements: 'Improvement ID',
        improvement: 'Improvement ID',
        calendar: 'Calendar ID',
      };
      const idField = idFields[module] || 'ID';
      const idVal = record[idField];
      if (idVal) {
        await deleteRecord(module, idVal);
      }
      onClose();
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInputs = () => {
    switch (module) {
      case 'tasks':
        return (
          <>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.Title || ''}
                onChange={e => handleFieldChange('Title', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Scope</label>
                <select
                  value={formData['Task Scope'] || 'Program'}
                  onChange={e => handleFieldChange('Task Scope', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="Program">Program Scope</option>
                  <option value="Course">Course Scope</option>
                  <option value="Instructor">Instructor Scope</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={formData.Status || 'TO DO'}
                  onChange={e => handleFieldChange('Status', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="TO DO">TO DO</option>
                  <option value="READY">READY</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="WAITING/BLOCKED">WAITING/BLOCKED</option>
                  <option value="REVIEW NEEDED">REVIEW NEEDED</option>
                  <option value="COMPLETE">COMPLETE</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                <select
                  value={formData.Priority || 'Normal'}
                  onChange={e => handleFieldChange('Priority', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData['Due Date'] || ''}
                  onChange={e => handleFieldChange('Due Date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Owner Email</label>
              <input
                type="email"
                value={formData['Owner Email'] || ''}
                onChange={e => handleFieldChange('Owner Email', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Associated Course (Optional)</label>
              <select
                value={formData['Course ID'] || ''}
                onChange={e => handleFieldChange('Course ID', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              >
                <option value="">None / Program-wide</option>
                {courses.map(c => (
                  <option key={c['Course ID']} value={c['Course ID']}>
                    {c['Course Code']} — {c['Course Title']}
                  </option>
                ))}
              </select>
            </div>
            {formData.Status === 'WAITING/BLOCKED' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Blocked Reason</label>
                <input
                  type="text"
                  value={formData['Blocked Reason'] || ''}
                  onChange={e => handleFieldChange('Blocked Reason', e.target.value)}
                  placeholder="What is holding this up?"
                  className="w-full bg-slate-50 border border-rose-300 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            )}
          </>
        );

      case 'courses':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={formData['Course Code'] || ''}
                  onChange={e => handleFieldChange('Course Code', e.target.value)}
                  placeholder="e.g. CYBR 201"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Credits</label>
                <input
                  type="number"
                  required
                  value={formData.Credits || 3}
                  onChange={e => handleFieldChange('Credits', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Course Title</label>
              <input
                type="text"
                required
                value={formData['Course Title'] || ''}
                onChange={e => handleFieldChange('Course Title', e.target.value)}
                placeholder="e.g. Network Defense and Countermeasures"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Length (Weeks)</label>
                <input
                  type="number"
                  value={formData['Length Weeks'] || 8}
                  onChange={e => handleFieldChange('Length Weeks', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Term Placement</label>
                <input
                  type="text"
                  value={formData['Term Placement'] || ''}
                  onChange={e => handleFieldChange('Term Placement', e.target.value)}
                  placeholder="e.g. Term 2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Catalog Description</label>
              <textarea
                rows={3}
                value={formData.Description || ''}
                onChange={e => handleFieldChange('Description', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
          </>
        );

      case 'plos':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">PLO Number</label>
                <input
                  type="text"
                  required
                  value={formData['PLO Number'] || ''}
                  onChange={e => handleFieldChange('PLO Number', e.target.value)}
                  placeholder="e.g. PLO 1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData['PLO Title'] || ''}
                  onChange={e => handleFieldChange('PLO Title', e.target.value)}
                  placeholder="Short Title"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Outcome Statement</label>
              <textarea
                rows={4}
                required
                value={formData['PLO Statement'] || ''}
                onChange={e => handleFieldChange('PLO Statement', e.target.value)}
                placeholder="Graduates demonstrate the ability to..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
          </>
        );

      case 'clos':
        return (
          <>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Course</label>
              <select
                required
                value={formData['Course ID'] || ''}
                onChange={e => handleFieldChange('Course ID', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c['Course ID']} value={c['Course ID']}>
                    {c['Course Code']} — {c['Course Title']}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">CLO Number</label>
                <input
                  type="text"
                  required
                  value={formData['CLO Number'] || ''}
                  onChange={e => handleFieldChange('CLO Number', e.target.value)}
                  placeholder="CLO 1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Source / Approval</label>
                <input
                  type="text"
                  value={formData['Source / Approval'] || ''}
                  onChange={e => handleFieldChange('Source / Approval', e.target.value)}
                  placeholder="Institutional Syllabus Master"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">CLO Statement</label>
              <textarea
                rows={3}
                required
                value={formData['CLO Statement'] || ''}
                onChange={e => handleFieldChange('CLO Statement', e.target.value)}
                placeholder="Upon completion of this course, students will be able to..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
          </>
        );

      case 'courseplos':
        return (
          <>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Course</label>
              <select
                required
                value={formData['Course ID'] || ''}
                onChange={e => handleFieldChange('Course ID', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c['Course ID']} value={c['Course ID']}>
                    {c['Course Code']} — {c['Course Title']}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Program Learning Outcome (PLO)</label>
              <select
                required
                value={formData['PLO ID'] || ''}
                onChange={e => handleFieldChange('PLO ID', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              >
                <option value="">Select PLO</option>
                {plos.map(p => (
                  <option key={p['PLO ID']} value={p['PLO ID']}>
                    {p['PLO Number']} — {p['PLO Title']}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Development Level</label>
                <select
                  value={formData['Development Level'] || 'I'}
                  onChange={e => handleFieldChange('Development Level', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="I">Introduced (I)</option>
                  <option value="R">Reinforced (R)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assessment Role</label>
                <select
                  value={formData['Assessment Role'] || 'F'}
                  onChange={e => handleFieldChange('Assessment Role', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="F">Formative (F)</option>
                  <option value="S">Summative (S) [Max 1/PLO]</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Curricular Notes</label>
              <input
                type="text"
                value={formData.Notes || ''}
                onChange={e => handleFieldChange('Notes', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
          </>
        );

      case 'activities':
        return (
          <>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Activity / Assignment Name</label>
              <input
                type="text"
                required
                value={formData['Activity Name'] || ''}
                onChange={e => handleFieldChange('Activity Name', e.target.value)}
                placeholder="e.g. Wireshark PCAP Packet Analysis Lab"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Week</label>
                <input
                  type="number"
                  value={formData.Week || 1}
                  onChange={e => handleFieldChange('Week', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assessment Use</label>
                <select
                  value={formData['Assessment Use'] || 'Formative'}
                  onChange={e => handleFieldChange('Assessment Use', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="Practice Only">Practice Only</option>
                  <option value="Formative">Formative</option>
                  <option value="Summative">Summative</option>
                  <option value="Course Final">Course Final</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={formData.Category || 'Hands-on Lab'}
                  onChange={e => handleFieldChange('Category', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Grade Weight</label>
                <input
                  type="text"
                  value={formData['Grade Weight'] || '10%'}
                  onChange={e => handleFieldChange('Grade Weight', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </>
        );

      case 'accreditation':
        return (
          <>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Evidence Title</label>
              <input
                type="text"
                required
                value={formData.Title || ''}
                onChange={e => handleFieldChange('Title', e.target.value)}
                placeholder="e.g. Master Assessment Plan & 2026 Audit Findings"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bodies / Frameworks</label>
                <input
                  type="text"
                  required
                  value={formData['Bodies / Frameworks'] || 'Higher Learning Commission (HLC)'}
                  onChange={e => handleFieldChange('Bodies / Frameworks', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Requirement / Standard</label>
                <input
                  type="text"
                  value={formData['Requirement / Standard'] || ''}
                  onChange={e => handleFieldChange('Requirement / Standard', e.target.value)}
                  placeholder="e.g. HLC Criterion 4.B"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Google Drive Evidence Artifact URL</label>
              <input
                type="url"
                value={formData['Evidence URL'] || ''}
                onChange={e => handleFieldChange('Evidence URL', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={formData.Status || 'Approved / Current'}
                  onChange={e => handleFieldChange('Status', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="Approved / Current">Approved / Current</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Needs Refresh">Needs Refresh</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData['Due Date'] || ''}
                  onChange={e => handleFieldChange('Due Date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </>
        );

      case 'calendar':
        return (
          <>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Event Title</label>
              <input
                type="text"
                required
                value={formData.Title || ''}
                onChange={e => handleFieldChange('Title', e.target.value)}
                placeholder="e.g. Fall 2026 Census Day"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData['Start Date'] || ''}
                  onChange={e => handleFieldChange('Start Date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData['End Date'] || ''}
                  onChange={e => handleFieldChange('End Date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={formData.Category || 'Academic Calendar'}
                  onChange={e => handleFieldChange('Category', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Scope</label>
                <select
                  value={formData.Scope || 'Program'}
                  onChange={e => handleFieldChange('Scope', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="Program">Program Scope</option>
                  <option value="GLOBAL">Institutional Global</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'improvements':
      case 'improvement':
        return (
          <>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Action Strategy / Title</label>
              <input
                type="text"
                required
                value={formData.Action || formData['Action Title'] || ''}
                onChange={e => {
                  handleFieldChange('Action', e.target.value);
                  handleFieldChange('Action Title', e.target.value);
                }}
                placeholder="e.g. Introduce interactive Wireshark DNS decoding lab"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Identified Issue / Finding / Trigger</label>
              <textarea
                rows={3}
                required
                value={formData['Issue/Finding'] || formData['Finding / Trigger'] || ''}
                onChange={e => {
                  handleFieldChange('Issue/Finding', e.target.value);
                  handleFieldChange('Finding / Trigger', e.target.value);
                }}
                placeholder="Describe the assessment benchmark deficit or advisory recommendation..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Term / Date</label>
                <input
                  type="text"
                  value={formData['Target Date'] || formData['Target Term'] || ''}
                  onChange={e => {
                    handleFieldChange('Target Date', e.target.value);
                    handleFieldChange('Target Term', e.target.value);
                  }}
                  placeholder="e.g. 2026-10-15 or Fall 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={formData.Status || 'In Progress'}
                  onChange={e => handleFieldChange('Status', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Complete">Complete</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Owner Email</label>
              <input
                type="email"
                value={formData['Owner Email'] || ''}
                onChange={e => handleFieldChange('Owner Email', e.target.value)}
                placeholder="faculty@institution.edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Evidence Artifact URL (Optional)</label>
              <input
                type="url"
                value={formData['Evidence URL'] || ''}
                onChange={e => handleFieldChange('Evidence URL', e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
              />
            </div>
          </>
        );

      default:
        // Generic fallback for any other schema
        return (
          <div className="space-y-3">
            {Object.keys(formData).map(key => (
              <div key={key}>
                <label className="block text-slate-700 font-semibold mb-1">{key}</label>
                <input
                  type="text"
                  value={formData[key] ?? ''}
                  onChange={e => handleFieldChange(key, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <form onSubmit={handleSave}>
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <h2 className="text-sm font-bold">
              {record ? 'Edit' : 'Add'} {module.toUpperCase()} Record
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-600">
            {renderInputs()}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {record ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
