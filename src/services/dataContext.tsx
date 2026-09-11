import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  GlobalRole,
  ProgramRecord,
  TermRecord,
  CourseRecord,
  InstructorRecord,
  CourseAssignmentRecord,
  AssignmentComponentRecord,
  CalendarEventRecord,
  TaskRecord,
  TaskTemplateRecord,
  RecurringTaskRuleRecord,
  AdviseeRecord,
  PloRecord,
  CloRecord,
  CoursePloMapRecord,
  CloAssessmentMapRecord,
  CourseActivityRecord,
  AssessmentRecord,
  ContinuousImprovementRecord,
  AccreditationBodyRecord,
  AccreditationEvidenceRecord,
  CredentialRecord,
  ProgramFeatureRecord,
  SheetModule,
  TaskStatus,
} from '../types';
import {
  auth,
  initAuth,
  googleSignIn,
  getAccessToken,
  logout as authLogout,
} from './authService';
import {
  SHEETS_MAP,
  ID_PREFIXES,
  generateId,
  extractSpreadsheetId,
  fetchSpreadsheetMetadata,
  batchFetchAllSheets,
  createNewSpreadsheet,
  appendRow,
  updateRow,
} from './sheetsService';
import {
  setupProgramDriveHierarchy,
  getStoredDriveFolders,
  DriveFolderInfo,
} from './driveService';
import {
  fetchGoogleCalendarEvents,
  getStandardAcademicCalendarPresets,
} from './calendarService';
import {
  INITIAL_PROGRAMS,
  INITIAL_TERMS,
  INITIAL_COURSES,
  INITIAL_INSTRUCTORS,
  INITIAL_ASSIGNMENTS,
  INITIAL_COMPONENTS,
  INITIAL_PLOS,
  INITIAL_CLOS,
  INITIAL_COURSE_PLO_MAP,
  INITIAL_CLO_ASSESSMENT_MAP,
  INITIAL_ACTIVITIES,
  INITIAL_ASSESSMENTS,
  INITIAL_TASKS,
  INITIAL_TASK_TEMPLATES,
  INITIAL_RECURRING_RULES,
  INITIAL_CALENDAR,
  INITIAL_ADVISEES,
  INITIAL_BODIES,
  INITIAL_ACCREDITATION_EVIDENCE,
  INITIAL_CREDENTIALS,
  INITIAL_IMPROVEMENTS,
  INITIAL_FEATURES,
  getFullInitialDataMap,
} from './initialData';

interface DataContextType {
  user: User | null;
  currentUserEmail: string;
  currentRole: GlobalRole;
  setCurrentRole: (role: GlobalRole) => void;
  spreadsheetId: string | null;
  spreadsheetTitle: string;
  isLiveConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  activeProgramId: string;
  setActiveProgramId: (id: string) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  connectSpreadsheet: (idOrUrl: string) => Promise<void>;
  createAndConnectSpreadsheet: (title: string) => Promise<string>;
  refreshFromSheet: () => Promise<void>;
  disconnectSpreadsheet: () => void;

  // Data Collections
  programs: ProgramRecord[];
  terms: TermRecord[];
  courses: CourseRecord[];
  instructors: InstructorRecord[];
  assignments: CourseAssignmentRecord[];
  components: AssignmentComponentRecord[];
  tasks: TaskRecord[];
  taskTemplates: TaskTemplateRecord[];
  recurringRules: RecurringTaskRuleRecord[];
  plos: PloRecord[];
  clos: CloRecord[];
  coursePloMaps: CoursePloMapRecord[];
  cloAssessmentMaps: CloAssessmentMapRecord[];
  activities: CourseActivityRecord[];
  assessments: AssessmentRecord[];
  improvements: ContinuousImprovementRecord[];
  bodies: AccreditationBodyRecord[];
  accreditationEvidence: AccreditationEvidenceRecord[];
  credentials: CredentialRecord[];
  calendarEvents: CalendarEventRecord[];
  advisees: AdviseeRecord[];
  features: ProgramFeatureRecord[];

  // Compatibility & convenience aliases
  programFeatures: ProgramFeatureRecord[];
  recurringTasks: RecurringTaskRuleRecord[];
  disconnectSheet: () => void;
  connectExistingSheet: (idOrUrl: string) => Promise<void>;
  createNewSpreadsheetDatabase: (title: string) => Promise<string>;
  prepareCoursesForTerm: (params: { termId: string; partOfTerm?: string; startDate?: string; taskTitles?: string[] }) => Promise<{ created: number; coursesCount: number }>;

  // Actions
  saveRecord: (module: SheetModule, record: Record<string, any>) => Promise<string>;
  deleteRecord: (module: SheetModule, id: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  generateSemesterStartTasks: (termId: string, assignmentIds?: string[], templateIds?: string[]) => Promise<{ added: number; skipped: number }>;
  generateRecurringTasks: (throughDate: string) => Promise<{ added: number; skipped: number }>;
  setProgramFeature: (programId: string, key: string, enabled: boolean) => Promise<void>;

  // Program Management (Multi-program support for Leads)
  addProgram: (program: Omit<ProgramRecord, 'Program ID'> & { 'Program ID'?: string }) => Promise<string>;
  updateProgram: (programId: string, updates: Partial<ProgramRecord>) => Promise<void>;
  deleteProgram: (programId: string) => Promise<void>;

  // Calendar & Drive helpers
  importGoogleCalendar: () => Promise<number>;
  importAcademicTermPresets: (termName: string) => Promise<number>;
  setupWorkspaceDriveAndSheets: (institutionName?: string) => Promise<{ driveInfo: DriveFolderInfo | null; spreadsheetId: string }>;
  driveFolderInfo: DriveFolderInfo | null;

  // Smart Multi-Sheet Sifter & Bulk Importer
  batchImportSiftedData: (
    payloads: { module: SheetModule; records: Record<string, any>[] }[]
  ) => Promise<{ totalAdded: number; breakdown: Record<string, number> }>;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_SHEET_KEY = 'academic_ops_spreadsheet_id';
const STORAGE_PROGRAM_KEY = 'academic_ops_active_program';

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<GlobalRole>('ADMIN');
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => localStorage.getItem(STORAGE_SHEET_KEY));
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>('Local Demo Workspace');
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [activeProgramId, setActiveProgramIdState] = useState<string>(() => localStorage.getItem(STORAGE_PROGRAM_KEY) || 'PRG-CYBER');

  // State collections initialized with initialData
  const [programs, setPrograms] = useState<ProgramRecord[]>(INITIAL_PROGRAMS);
  const [terms, setTerms] = useState<TermRecord[]>(INITIAL_TERMS);
  const [courses, setCourses] = useState<CourseRecord[]>(INITIAL_COURSES);
  const [instructors, setInstructors] = useState<InstructorRecord[]>(INITIAL_INSTRUCTORS);
  const [assignments, setAssignments] = useState<CourseAssignmentRecord[]>(INITIAL_ASSIGNMENTS);
  const [components, setComponents] = useState<AssignmentComponentRecord[]>(INITIAL_COMPONENTS);
  const [tasks, setTasks] = useState<TaskRecord[]>(INITIAL_TASKS);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplateRecord[]>(INITIAL_TASK_TEMPLATES);
  const [recurringRules, setRecurringRules] = useState<RecurringTaskRuleRecord[]>(INITIAL_RECURRING_RULES);
  const [plos, setPlos] = useState<PloRecord[]>(INITIAL_PLOS);
  const [clos, setClos] = useState<CloRecord[]>(INITIAL_CLOS);
  const [coursePloMaps, setCoursePloMaps] = useState<CoursePloMapRecord[]>(INITIAL_COURSE_PLO_MAP);
  const [cloAssessmentMaps, setCloAssessmentMaps] = useState<CloAssessmentMapRecord[]>(INITIAL_CLO_ASSESSMENT_MAP);
  const [activities, setActivities] = useState<CourseActivityRecord[]>(INITIAL_ACTIVITIES);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>(INITIAL_ASSESSMENTS);
  const [improvements, setImprovements] = useState<ContinuousImprovementRecord[]>(INITIAL_IMPROVEMENTS);
  const [bodies, setBodies] = useState<AccreditationBodyRecord[]>(INITIAL_BODIES);
  const [accreditationEvidence, setAccreditationEvidence] = useState<AccreditationEvidenceRecord[]>(INITIAL_ACCREDITATION_EVIDENCE);
  const [credentials, setCredentials] = useState<CredentialRecord[]>(INITIAL_CREDENTIALS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventRecord[]>(INITIAL_CALENDAR);
  const [advisees, setAdvisees] = useState<AdviseeRecord[]>(INITIAL_ADVISEES);
  const [features, setFeatures] = useState<ProgramFeatureRecord[]>(INITIAL_FEATURES);

  const setActiveProgramId = (id: string) => {
    setActiveProgramIdState(id);
    localStorage.setItem(STORAGE_PROGRAM_KEY, id);
  };

  const loadDataFromSpreadsheet = useCallback(async (sheetId: string, token: string) => {
    setIsSyncing(true);
    try {
      const meta = await fetchSpreadsheetMetadata(sheetId, token);
      setSpreadsheetTitle(meta.title);

      const tabNamesToFetch = Object.values(SHEETS_MAP).filter(tabName => meta.tabs.includes(tabName));
      if (tabNamesToFetch.length > 0) {
        const rawData = await batchFetchAllSheets(sheetId, token, tabNamesToFetch);

        if (rawData.PROGRAMS?.length) setPrograms(rawData.PROGRAMS as ProgramRecord[]);
        if (rawData.TERMS?.length) setTerms(rawData.TERMS as TermRecord[]);
        if (rawData.COURSES?.length) setCourses(rawData.COURSES as CourseRecord[]);
        if (rawData.INSTRUCTOR_ROSTER?.length) setInstructors(rawData.INSTRUCTOR_ROSTER as InstructorRecord[]);
        if (rawData.COURSE_ASSIGNMENTS?.length) setAssignments(rawData.COURSE_ASSIGNMENTS as CourseAssignmentRecord[]);
        if (rawData.ASSIGNMENT_COMPONENTS?.length) setComponents(rawData.ASSIGNMENT_COMPONENTS as AssignmentComponentRecord[]);
        if (rawData.TASKS?.length) setTasks(rawData.TASKS as TaskRecord[]);
        if (rawData.TASK_TEMPLATES?.length) setTaskTemplates(rawData.TASK_TEMPLATES as TaskTemplateRecord[]);
        if (rawData.RECURRING_TASK_RULES?.length) setRecurringRules(rawData.RECURRING_TASK_RULES as RecurringTaskRuleRecord[]);
        if (rawData.PLOS?.length) setPlos(rawData.PLOS as PloRecord[]);
        if (rawData.COURSE_CLOS?.length) setClos(rawData.COURSE_CLOS as CloRecord[]);
        if (rawData.COURSE_PLO_MAP?.length) setCoursePloMaps(rawData.COURSE_PLO_MAP as CoursePloMapRecord[]);
        if (rawData.CLO_ASSESSMENT_MAP?.length) setCloAssessmentMaps(rawData.CLO_ASSESSMENT_MAP as CloAssessmentMapRecord[]);
        if (rawData.COURSE_ACTIVITIES?.length) setActivities(rawData.COURSE_ACTIVITIES as CourseActivityRecord[]);
        if (rawData.ASSESSMENTS?.length) setAssessments(rawData.ASSESSMENTS as AssessmentRecord[]);
        if (rawData.CONTINUOUS_IMPROVEMENT?.length) setImprovements(rawData.CONTINUOUS_IMPROVEMENT as ContinuousImprovementRecord[]);
        if (rawData.ACCREDITATION_BODIES?.length) setBodies(rawData.ACCREDITATION_BODIES as AccreditationBodyRecord[]);
        if (rawData.ACCREDITATION_EVIDENCE?.length) setAccreditationEvidence(rawData.ACCREDITATION_EVIDENCE as AccreditationEvidenceRecord[]);
        if (rawData.CREDENTIALS?.length) setCredentials(rawData.CREDENTIALS as CredentialRecord[]);
        if (rawData.ACADEMIC_CALENDAR?.length) setCalendarEvents(rawData.ACADEMIC_CALENDAR as CalendarEventRecord[]);
        if (rawData.ADVISEES?.length) setAdvisees(rawData.ADVISEES as AdviseeRecord[]);
        if (rawData.PROGRAM_FEATURES?.length) setFeatures(rawData.PROGRAM_FEATURES as ProgramFeatureRecord[]);
      }

      setIsLiveConnected(true);
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Could not read from Google Sheet:', err);
      setIsLiveConnected(false);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Initialize auth listener
  useEffect(() => {
    const unsub = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        if (spreadsheetId && token) {
          loadDataFromSpreadsheet(spreadsheetId, token);
        }
      },
      () => {
        setUser(null);
        setIsLiveConnected(false);
      }
    );
    return () => unsub();
  }, [spreadsheetId, loadDataFromSpreadsheet]);

  const signIn = async () => {
    const res = await googleSignIn();
    if (res) {
      setUser(res.user);
      if (spreadsheetId) {
        await loadDataFromSpreadsheet(spreadsheetId, res.accessToken);
      }
    }
  };

  const signOut = async () => {
    await authLogout();
    setUser(null);
    setIsLiveConnected(false);
  };

  const connectSpreadsheet = async (idOrUrl: string) => {
    const cleanId = extractSpreadsheetId(idOrUrl);
    if (!cleanId) throw new Error('Invalid Google Sheet ID or URL.');

    const token = await getAccessToken();
    if (!token) {
      throw new Error('Please sign in with Google first to authorize Google Sheets access.');
    }

    setIsSyncing(true);
    try {
      await loadDataFromSpreadsheet(cleanId, token);
      setSpreadsheetId(cleanId);
      localStorage.setItem(STORAGE_SHEET_KEY, cleanId);
    } finally {
      setIsSyncing(false);
    }
  };

  const createAndConnectSpreadsheet = async (title: string): Promise<string> => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Please sign in with Google first.');
    }

    setIsSyncing(true);
    try {
      const initialMap = getFullInitialDataMap();
      const res = await createNewSpreadsheet(title, token, initialMap);
      setSpreadsheetId(res.id);
      localStorage.setItem(STORAGE_SHEET_KEY, res.id);
      setSpreadsheetTitle(title);
      setIsLiveConnected(true);
      setLastSyncTime(new Date());
      return res.url;
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshFromSheet = async () => {
    if (!spreadsheetId) return;
    const token = await getAccessToken();
    if (!token) throw new Error('Sign in required.');
    await loadDataFromSpreadsheet(spreadsheetId, token);
  };

  const disconnectSpreadsheet = () => {
    setSpreadsheetId(null);
    localStorage.removeItem(STORAGE_SHEET_KEY);
    setIsLiveConnected(false);
    setSpreadsheetTitle('Local Demo Workspace');
  };

  // Generic Save Record
  const saveRecord = async (module: SheetModule, record: Record<string, any>): Promise<string> => {
    const prefix = ID_PREFIXES[module] || 'REC';
    const sheetTabName = SHEETS_MAP[module];
    const recordKeys = record ? Object.keys(record) : [];
    const idKey = recordKeys.find(k => k.endsWith(' ID')) || recordKeys[0] || 'ID';

    const isUpdate = Boolean(record[idKey]);
    const finalId = record[idKey] || generateId(prefix);
    const nowIso = new Date().toISOString();

    const preparedRecord = {
      ...record,
      [idKey]: finalId,
      'Updated At': nowIso,
      ...(!isUpdate && { 'Created At': nowIso }),
    };

    // 1. Optimistic Local State Update
    const updateCollection = <T extends Record<string, any>>(
      getter: T[],
      setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      setter(prev => {
        const idx = prev.findIndex(item => item[idKey] === finalId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...preparedRecord } as unknown as T;
          return next;
        } else {
          return [preparedRecord as unknown as T, ...prev];
        }
      });
    };

    switch (module) {
      case 'programs': updateCollection(programs, setPrograms); break;
      case 'terms': updateCollection(terms, setTerms); break;
      case 'courses': updateCollection(courses, setCourses); break;
      case 'instructors': updateCollection(instructors, setInstructors); break;
      case 'assignments': updateCollection(assignments, setAssignments); break;
      case 'components': updateCollection(components, setComponents); break;
      case 'tasks': updateCollection(tasks, setTasks); break;
      case 'tasktemplates': updateCollection(taskTemplates, setTaskTemplates); break;
      case 'recurring': updateCollection(recurringRules, setRecurringRules); break;
      case 'plos': updateCollection(plos, setPlos); break;
      case 'clos': updateCollection(clos, setClos); break;
      case 'courseplos': updateCollection(coursePloMaps, setCoursePloMaps); break;
      case 'cloassessments': updateCollection(cloAssessmentMaps, setCloAssessmentMaps); break;
      case 'activities': updateCollection(activities, setActivities); break;
      case 'assessments': updateCollection(assessments, setAssessments); break;
      case 'improvement':
      case 'improvements': updateCollection(improvements, setImprovements); break;
      case 'bodies': updateCollection(bodies, setBodies); break;
      case 'accreditation': updateCollection(accreditationEvidence, setAccreditationEvidence); break;
      case 'credentials': updateCollection(credentials, setCredentials); break;
      case 'calendar': updateCollection(calendarEvents, setCalendarEvents); break;
      case 'advisees': updateCollection(advisees, setAdvisees); break;
      case 'features': updateCollection(features, setFeatures); break;
    }

    // 2. Background Google Sheet Sync if connected
    if (spreadsheetId) {
      getAccessToken().then(async token => {
        if (!token) return;
        setIsSyncing(true);
        try {
          if (isUpdate) {
            // Find row index (1-based header is row 1)
            let collection: any[] = [];
            switch (module) {
              case 'tasks': collection = tasks; break;
              case 'courses': collection = courses; break;
              case 'activities': collection = activities; break;
              case 'clos': collection = clos; break;
              case 'cloassessments': collection = cloAssessmentMaps; break;
              case 'courseplos': collection = coursePloMaps; break;
              case 'assignments': collection = assignments; break;
              default: collection = [];
            }
            const foundIdx = collection.findIndex(item => item[idKey] === finalId);
            if (foundIdx >= 0) {
              await updateRow(spreadsheetId, sheetTabName, foundIdx + 2, preparedRecord, token);
            } else {
              await appendRow(spreadsheetId, sheetTabName, preparedRecord, token);
            }
          } else {
            await appendRow(spreadsheetId, sheetTabName, preparedRecord, token);
          }
          setLastSyncTime(new Date());
        } catch (e) {
          console.error('Failed to sync to Google Sheet:', e);
        } finally {
          setIsSyncing(false);
        }
      });
    }

    return finalId;
  };

  // Delete Record
  const deleteRecord = async (module: SheetModule, id: string): Promise<void> => {
    const idKey = {
      programs: 'Program ID',
      terms: 'Term ID',
      courses: 'Course ID',
      instructors: 'Instructor ID',
      assignments: 'Assignment ID',
      components: 'Component ID',
      tasks: 'Task ID',
      tasktemplates: 'Template ID',
      recurring: 'Rule ID',
      plos: 'PLO ID',
      clos: 'CLO ID',
      courseplos: 'Mapping ID',
      cloassessments: 'Mapping ID',
      activities: 'Activity ID',
      assessments: 'Assessment ID',
      improvement: 'Improvement ID',
      bodies: 'Body ID',
      accreditation: 'Evidence ID',
      credentials: 'Credential ID',
      calendar: 'Calendar ID',
      advisees: 'Student ID',
      features: 'Feature ID',
      users: 'User ID',
      access: 'Access ID',
      portfolio: 'Artifact ID',
      workforce: 'Record ID',
      advising: 'Note ID',
    }[module] || 'id';

    // Optimistic removal
    switch (module) {
      case 'programs': setPrograms(prev => prev.filter(x => x['Program ID'] !== id)); break;
      case 'courses': setCourses(prev => prev.filter(x => x['Course ID'] !== id)); break;
      case 'instructors': setInstructors(prev => prev.filter(x => x['Instructor ID'] !== id)); break;
      case 'assignments': setAssignments(prev => prev.filter(x => x['Assignment ID'] !== id)); break;
      case 'components': setComponents(prev => prev.filter(x => x['Component ID'] !== id)); break;
      case 'tasks': setTasks(prev => prev.filter(x => x['Task ID'] !== id)); break;
      case 'tasktemplates': setTaskTemplates(prev => prev.filter(x => x['Template ID'] !== id)); break;
      case 'recurring': setRecurringRules(prev => prev.filter(x => x['Rule ID'] !== id)); break;
      case 'plos': setPlos(prev => prev.filter(x => x['PLO ID'] !== id)); break;
      case 'clos': setClos(prev => prev.filter(x => x['CLO ID'] !== id)); break;
      case 'courseplos': setCoursePloMaps(prev => prev.filter(x => x['Mapping ID'] !== id)); break;
      case 'cloassessments': setCloAssessmentMaps(prev => prev.filter(x => x['Mapping ID'] !== id)); break;
      case 'activities': setActivities(prev => prev.filter(x => x['Activity ID'] !== id)); break;
      case 'assessments': setAssessments(prev => prev.filter(x => x['Assessment ID'] !== id)); break;
      case 'improvement':
      case 'improvements': setImprovements(prev => prev.filter(x => x['Improvement ID'] !== id)); break;
      case 'bodies': setBodies(prev => prev.filter(x => x['Body ID'] !== id)); break;
      case 'accreditation': setAccreditationEvidence(prev => prev.filter(x => x['Evidence ID'] !== id)); break;
      case 'credentials': setCredentials(prev => prev.filter(x => x['Credential ID'] !== id)); break;
      case 'calendar': setCalendarEvents(prev => prev.filter(x => x['Calendar ID'] !== id)); break;
      case 'advisees': setAdvisees(prev => prev.filter(x => x['Student ID'] !== id)); break;
    }
  };

  // Ultra-fast task status update for Kanban
  const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    setTasks(prev =>
      prev.map(t => (t['Task ID'] === taskId ? { ...t, Status: status, 'Updated At': new Date().toISOString() } : t))
    );

    if (spreadsheetId) {
      const token = await getAccessToken();
      if (token) {
        const found = (tasks || []).find(t => t['Task ID'] === taskId);
        if (found) {
          const updated = { ...found, Status: status, 'Updated At': new Date().toISOString() };
          const idx = (tasks || []).findIndex(t => t['Task ID'] === taskId);
          if (idx >= 0) {
            updateRow(spreadsheetId, 'TASKS', idx + 2, updated, token).catch(e => console.warn(e));
          }
        }
      }
    }
  };

  // Generate Semester Start Tasks
  const generateSemesterStartTasks = async (
    termId: string,
    assignmentIds?: string[],
    templateIds?: string[]
  ): Promise<{ added: number; skipped: number }> => {
    const tmpls = taskTemplates.filter(
      t =>
        t['Program ID'] === activeProgramId &&
        t['Applies To'] === 'Semester Start' &&
        t.Active !== false &&
        t.Active !== 'false' &&
        (!templateIds || templateIds.includes(t['Template ID']))
    );

    const relevantAssignments = assignments.filter(
      a =>
        a['Program ID'] === activeProgramId &&
        a['Term ID'] === termId &&
        a.Status !== 'Cancelled' &&
        (!assignmentIds || assignmentIds.includes(a['Assignment ID']))
    );

    let added = 0;
    let skipped = 0;
    const newTasks: TaskRecord[] = [];

    for (const a of relevantAssignments) {
      const owners: string[] = [];
      if (a['Instructor Email']) owners.push(a['Instructor Email'].toLowerCase());

      components
        .filter(c => c['Assignment ID'] === a['Assignment ID'] && c.Active !== false && c.Active !== 'false')
        .forEach(c => {
          const e = c['Instructor Email']?.toLowerCase();
          if (e && !owners.includes(e)) owners.push(e);
        });

      if (!owners.length) owners.push(user?.email || 'depriestn@hocking.edu');

      for (const owner of owners) {
        for (const t of tmpls) {
          const exists = tasks.some(
            existing =>
              existing['Program ID'] === activeProgramId &&
              existing['Term ID'] === termId &&
              existing['Course ID'] === a['Course ID'] &&
              existing['Assignment ID'] === a['Assignment ID'] &&
              existing['Owner Email']?.toLowerCase() === owner &&
              existing['Template ID'] === t['Template ID'] &&
              existing.Archived !== true &&
              existing.Archived !== 'true'
          );

          if (exists) {
            skipped++;
            continue;
          }

          const createdTask: TaskRecord = {
            'Task ID': generateId('TSK'),
            'Program ID': activeProgramId,
            'Term ID': termId,
            'Course ID': a['Course ID'],
            'Assignment ID': a['Assignment ID'],
            'Owner Email': owner,
            'Task Scope': 'Course',
            'Task Type': t['Task Type'],
            'Title': t.Title,
            'Description': t.Description,
            'Status': 'TO DO',
            'Priority': t['Default Priority'] || 'Normal',
            'Due Date': a['Start Date'] || '',
            'Generated': true,
            'Archived': false,
            'Template ID': t['Template ID'],
            'Created At': new Date().toISOString(),
            'Updated At': new Date().toISOString(),
          };

          newTasks.push(createdTask);
          added++;
        }
      }
    }

    if (newTasks.length > 0) {
      setTasks(prev => [...newTasks, ...prev]);
      if (spreadsheetId) {
        getAccessToken().then(token => {
          if (!token) return;
          for (const task of newTasks) {
            appendRow(spreadsheetId, 'TASKS', task, token).catch(e => console.warn(e));
          }
        });
      }
    }

    return { added, skipped };
  };

  // Generate Recurring Tasks
  const generateRecurringTasks = async (throughDate: string): Promise<{ added: number; skipped: number }> => {
    const rules = recurringRules.filter(
      r => r['Program ID'] === activeProgramId && r.Active !== false && r.Active !== 'false'
    );

    let added = 0;
    let skipped = 0;
    const newTasks: TaskRecord[] = [];
    const limitDate = new Date(throughDate);

    for (const rule of rules) {
      const startDate = new Date(rule['Start Date'] || new Date());
      const endDate = rule['End Date'] ? new Date(rule['End Date']) : limitDate;
      const stopDate = endDate < limitDate ? endDate : limitDate;

      let cur = new Date(startDate);
      while (cur <= stopDate) {
        const curDateStr = cur.toISOString().split('T')[0];
        const exists = tasks.some(
          t =>
            t['Recurring Rule ID'] === rule['Rule ID'] &&
            t['Recurrence Date']?.startsWith(curDateStr) &&
            t.Archived !== true &&
            t.Archived !== 'true'
        );

        if (exists) {
          skipped++;
        } else {
          const task: TaskRecord = {
            'Task ID': generateId('TSK'),
            'Program ID': activeProgramId,
            'Term ID': rule['Term ID'] || '',
            'Course ID': rule['Task Scope'] === 'Course' ? rule['Course ID'] || '' : '',
            'Assignment ID': '',
            'Owner Email': rule['Owner Email'],
            'Task Scope': rule['Task Scope'],
            'Task Type': 'Recurring',
            'Title': rule.Title,
            'Description': rule.Description,
            'Status': 'TO DO',
            'Priority': rule.Priority || 'Normal',
            'Due Date': curDateStr,
            'Generated': true,
            'Archived': false,
            'Recurring Rule ID': rule['Rule ID'],
            'Recurrence Date': curDateStr,
            'Template ID': rule['Template ID'] || '',
            'Created At': new Date().toISOString(),
            'Updated At': new Date().toISOString(),
          };
          newTasks.push(task);
          added++;
        }

        // Increment according to frequency
        if (rule.Frequency === 'Monthly') {
          cur.setMonth(cur.getMonth() + 1);
        } else if (rule.Frequency === 'Every 2 Weeks') {
          cur.setDate(cur.getDate() + 14);
        } else {
          cur.setDate(cur.getDate() + 7);
        }
      }
    }

    if (newTasks.length > 0) {
      setTasks(prev => [...newTasks, ...prev]);
      if (spreadsheetId) {
        getAccessToken().then(token => {
          if (!token) return;
          for (const task of newTasks) {
            appendRow(spreadsheetId, 'TASKS', task, token).catch(e => console.warn(e));
          }
        });
      }
    }

    return { added, skipped };
  };

  const setProgramFeature = async (programId: string, key: string, enabled: boolean) => {
    setFeatures(prev =>
      prev.map(f =>
        f['Program ID'] === programId && f['Feature Key'] === key
          ? { ...f, Enabled: enabled, 'Updated At': new Date().toISOString() }
          : f
      )
    );
  };

  // Program Management (Multi-program support for Leads)
  const addProgram = async (data: Omit<ProgramRecord, 'Program ID'> & { 'Program ID'?: string }): Promise<string> => {
    const rawCode = (data['Program Code'] || 'PRG').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newId = data['Program ID'] || `PRG-${rawCode}-${Date.now().toString().slice(-4)}`;
    const fullProgram: ProgramRecord = {
      'Program ID': newId,
      'Program Code': data['Program Code'] || rawCode,
      'Program Name': data['Program Name'] || 'New Academic Program',
      'Division': data.Division || 'School of Technology & Applied Science',
      'CIP': data.CIP || '11.1003',
      'Status': data.Status || 'Active',
      'Dean Email': data['Dean Email'] || (user?.email || 'depriestn@hocking.edu'),
      'Created At': new Date().toISOString(),
      'Updated At': new Date().toISOString(),
    };

    await saveRecord('programs', fullProgram);
    setActiveProgramId(newId);
    return newId;
  };

  const updateProgram = async (programId: string, updates: Partial<ProgramRecord>) => {
    const existing = (programs || []).find(p => p['Program ID'] === programId);
    if (!existing) throw new Error(`Program with ID ${programId} not found.`);
    const updated = { ...existing, ...updates, 'Updated At': new Date().toISOString() };
    await saveRecord('programs', updated);
  };

  const deleteProgram = async (programId: string) => {
    await deleteRecord('programs', programId);
    if (activeProgramId === programId) {
      const remaining = (programs || []).filter(p => p['Program ID'] !== programId);
      if (remaining.length > 0) {
        setActiveProgramId(remaining[0]['Program ID']);
      }
    }
  };

  // Google Calendar Import
  const importGoogleCalendar = async (): Promise<number> => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Please connect your Google account with Calendar permissions first.');
    }
    const gEvents = await fetchGoogleCalendarEvents(token);
    let count = 0;
    for (const ge of gEvents) {
      const start = ge.start?.dateTime || ge.start?.date || new Date().toISOString();
      const end = ge.end?.dateTime || ge.end?.date;
      const isAllDay = Boolean(ge.start?.date && !ge.start?.dateTime);
      const newCalEvent: Record<string, any> = {
        'Program ID': activeProgramId,
        'Term ID': 'TERM-FA26',
        Title: ge.summary || 'Google Calendar Event',
        Description: ge.description || 'Imported from primary Google Calendar',
        'Start Date': start,
        'End Date': end,
        'All Day': isAllDay,
        'Category': 'Google Calendar',
        'Event Type': 'Academic Milestone',
        'Location': ge.location || '',
        'Scope': 'GLOBAL',
        'Status': 'Confirmed',
      };
      await saveRecord('calendar', newCalEvent);
      count++;
    }
    return count;
  };

  // Academic Term Presets Import
  const importAcademicTermPresets = async (termName: string): Promise<number> => {
    const presets = getStandardAcademicCalendarPresets('2026-2027');
    const preset = presets.find(p => p.termName.toLowerCase() === termName.toLowerCase()) || presets[0];
    let count = 0;
    for (const ev of preset.events) {
      const rec: Record<string, any> = {
        'Program ID': activeProgramId,
        'Term ID': termName.includes('Spring') ? 'TERM-SP27' : 'TERM-FA26',
        Title: ev.title,
        Description: ev.description,
        'Start Date': ev.startDate,
        'End Date': ev.endDate,
        'All Day': ev.allDay,
        Category: ev.category,
        'Event Type': ev.eventType,
        Scope: 'GLOBAL',
        Status: 'Confirmed',
      };
      await saveRecord('calendar', rec);
      count++;
    }
    return count;
  };

  const [driveFolderInfo, setDriveFolderInfo] = useState<DriveFolderInfo | null>(() => {
    return getStoredDriveFolders('CYBER') || getStoredDriveFolders('DEFAULT');
  });

  // Setup Workspace Drive Folders & Master Template Database
  const setupWorkspaceDriveAndSheets = async (institutionName: string = 'Hocking College') => {
    const activeProg = (programs || []).find(p => p['Program ID'] === activeProgramId) || programs?.[0];
    const progCode = activeProg?.['Program Code'] || 'CYBER';
    const token = await getAccessToken();

    let createdDriveInfo: DriveFolderInfo | null = null;
    let newSheetId = spreadsheetId;

    if (token) {
      try {
        createdDriveInfo = await setupProgramDriveHierarchy(token, progCode, institutionName);
        setDriveFolderInfo(createdDriveInfo);
      } catch (e) {
        console.warn('Google Drive folder setup warning:', e);
      }

      if (!spreadsheetId) {
        newSheetId = await createAndConnectSpreadsheet(`[${institutionName}] ${progCode} Operations Database`);
      }
    } else {
      // Local demo workspace simulated folder structure
      createdDriveInfo = {
        id: 'local-drive-parent-folder',
        name: `[${institutionName}] Academic Operations — ${progCode}`,
        webViewLink: 'https://drive.google.com',
        subfolders: {
          '1. Courses & Approved Syllabi': { id: 'fld-1', name: '1. Courses & Approved Syllabi', webViewLink: 'https://drive.google.com' },
          '2. HLC Accreditation Reports': { id: 'fld-2', name: '2. HLC Accreditation Reports', webViewLink: 'https://drive.google.com' },
          '3. Assessment Artifacts & Direct Evidence': { id: 'fld-3', name: '3. Assessment Artifacts & Direct Evidence', webViewLink: 'https://drive.google.com' },
          '4. Advisory Committee & Workforce Minutes': { id: 'fld-4', name: '4. Advisory Committee & Workforce Minutes', webViewLink: 'https://drive.google.com' },
          '5. Master Spreadsheet Databases': { id: 'fld-5', name: '5. Master Spreadsheet Databases', webViewLink: 'https://drive.google.com' },
        },
      };
      setDriveFolderInfo(createdDriveInfo);
      localStorage.setItem(`academic_ops_drive_${progCode}`, JSON.stringify(createdDriveInfo));
    }

    localStorage.setItem('academic_ops_onboarded_v1', 'true');
    return { driveInfo: createdDriveInfo, spreadsheetId: newSheetId || 'local-demo-sheet' };
  };

  // Batch import sifted data from multi-sheet spreadsheet
  const batchImportSiftedData = async (
    payloads: { module: SheetModule; records: Record<string, any>[] }[]
  ): Promise<{ totalAdded: number; breakdown: Record<string, number> }> => {
    let totalAdded = 0;
    const breakdown: Record<string, number> = {};

    for (const payload of payloads) {
      const { module, records } = payload;
      if (!records || records.length === 0) continue;

      const count = records.length;
      totalAdded += count;
      breakdown[module] = (breakdown[module] || 0) + count;

      switch (module) {
        case 'courses':
          setCourses(prev => [...(records as CourseRecord[]), ...prev]);
          break;
        case 'instructors':
          setInstructors(prev => [...(records as InstructorRecord[]), ...prev]);
          break;
        case 'assignments':
          setAssignments(prev => [...(records as CourseAssignmentRecord[]), ...prev]);
          break;
        case 'tasks':
          setTasks(prev => [...(records as TaskRecord[]), ...prev]);
          break;
        case 'plos':
          setPlos(prev => [...(records as PloRecord[]), ...prev]);
          break;
        case 'clos':
          setClos(prev => [...(records as CloRecord[]), ...prev]);
          break;
        case 'advisees':
          setAdvisees(prev => [...(records as AdviseeRecord[]), ...prev]);
          break;
        case 'credentials':
          setCredentials(prev => [...(records as CredentialRecord[]), ...prev]);
          break;
        case 'accreditation':
          setAccreditationEvidence(prev => [...(records as AccreditationEvidenceRecord[]), ...prev]);
          break;
        case 'calendar':
          setCalendarEvents(prev => [...(records as CalendarEventRecord[]), ...prev]);
          break;
        case 'assessments':
          setAssessments(prev => [...(records as AssessmentRecord[]), ...prev]);
          break;
      }
    }

    // Background sync to Google Sheets if connected
    if (spreadsheetId) {
      getAccessToken().then(async token => {
        if (!token) return;
        setIsSyncing(true);
        try {
          for (const payload of payloads) {
            const sheetTab = SHEETS_MAP[payload.module];
            if (sheetTab && payload.records.length > 0) {
              for (const r of payload.records) {
                await appendRow(spreadsheetId, sheetTab, r, token).catch(() => {});
              }
            }
          }
          setLastSyncTime(new Date());
        } catch (e) {
          console.warn('Batch import Google Sheets background sync notice:', e);
        } finally {
          setIsSyncing(false);
        }
      });
    }

    return { totalAdded, breakdown };
  };

  return (
    <DataContext.Provider
      value={{
        user,
        currentUserEmail: user?.email || 'depriestn@hocking.edu',
        currentRole,
        setCurrentRole,
        spreadsheetId,
        spreadsheetTitle,
        isLiveConnected,
        isSyncing,
        lastSyncTime,
        activeProgramId,
        setActiveProgramId,
        signIn,
        signOut,
        connectSpreadsheet,
        createAndConnectSpreadsheet,
        refreshFromSheet,
        disconnectSpreadsheet,

        programs,
        terms,
        courses,
        instructors,
        assignments,
        components,
        tasks,
        taskTemplates,
        recurringRules,
        plos,
        clos,
        coursePloMaps,
        cloAssessmentMaps,
        activities,
        assessments,
        improvements,
        bodies,
        accreditationEvidence,
        credentials,
        calendarEvents,
        advisees,
        features,

        // Aliases
        programFeatures: features,
        recurringTasks: recurringRules,
        disconnectSheet: disconnectSpreadsheet,
        connectExistingSheet: connectSpreadsheet,
        createNewSpreadsheetDatabase: createAndConnectSpreadsheet,
        prepareCoursesForTerm: async ({ termId }: { termId: string; partOfTerm?: string; startDate?: string; taskTitles?: string[] }) => {
          const res = await generateSemesterStartTasks(termId);
          const crsCount = courses.filter(c => c['Program ID'] === activeProgramId).length;
          return { created: res.added, coursesCount: crsCount };
        },

        saveRecord,
        deleteRecord,
        updateTaskStatus,
        generateSemesterStartTasks,
        generateRecurringTasks,
        setProgramFeature,

        // Program Management & Workspace Tools
        addProgram,
        updateProgram,
        deleteProgram,
        importGoogleCalendar,
        importAcademicTermPresets,
        setupWorkspaceDriveAndSheets,
        driveFolderInfo,
        batchImportSiftedData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
