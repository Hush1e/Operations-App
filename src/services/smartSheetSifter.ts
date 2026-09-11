/**
 * Smart Sheet Sifter & Heuristic Mapper
 * Intuitively analyzes multi-sheet Google Spreadsheets and Excel workbooks,
 * automatically detecting which tab belongs to which academic operations module
 * and mapping arbitrary column headers into the standardized system schema.
 */

import { SheetModule } from '../types';
import { generateId, ID_PREFIXES } from './sheetsService';

export interface ColumnDefinition {
  field: string;
  label: string;
  required?: boolean;
  synonyms: string[];
}

export interface ModuleSiftProfile {
  module: SheetModule;
  label: string;
  description: string;
  tabSynonyms: string[];
  columns: ColumnDefinition[];
  sampleRequiredKey: string;
}

export const SIFT_PROFILES: ModuleSiftProfile[] = [
  {
    module: 'courses',
    label: 'Course Catalog & Curriculum',
    description: 'Course codes, titles, credit hours, descriptions, and term placement.',
    tabSynonyms: ['course', 'courses', 'catalog', 'curriculum', 'classes', 'subjects', 'offerings'],
    sampleRequiredKey: 'Course Code',
    columns: [
      { field: 'Course Code', label: 'Course Code / Number', required: true, synonyms: ['course code', 'course #', 'course no', 'course number', 'code', 'class id', 'subject code', 'crse', 'sub'] },
      { field: 'Course Title', label: 'Course Title / Name', required: true, synonyms: ['course title', 'course name', 'title', 'name', 'class title', 'class name', 'subject name', 'description'] },
      { field: 'Credits', label: 'Credit Hours', required: true, synonyms: ['credits', 'credit hours', 'cr', 'credit', 'sch', 'units', 'hours'] },
      { field: 'Term Placement', label: 'Semester / Term Placement', synonyms: ['term placement', 'term', 'semester', 'recommended term', 'level', 'year', 'placement', 'sequence'] },
      { field: 'Description', label: 'Catalog Description', synonyms: ['description', 'course description', 'catalog description', 'summary', 'overview', 'synopsis'] },
      { field: 'Length Weeks', label: 'Length in Weeks', synonyms: ['length weeks', 'weeks', 'duration', 'course length'] },
    ],
  },
  {
    module: 'instructors',
    label: 'Faculty & Instructor Roster',
    description: 'Faculty names, institutional emails, appointment type, rank, and notes.',
    tabSynonyms: ['faculty', 'instructor', 'instructors', 'professors', 'staff', 'teachers', 'roster', 'directory', 'personnel'],
    sampleRequiredKey: 'Instructor Name',
    columns: [
      { field: 'Instructor Name', label: 'Instructor Full Name', required: true, synonyms: ['instructor name', 'faculty name', 'name', 'professor', 'instructor', 'full name', 'faculty', 'teacher', 'staff'] },
      { field: 'Instructor Email', label: 'Email Address', required: true, synonyms: ['instructor email', 'faculty email', 'email', 'e-mail', 'email address', 'contact email', 'work email'] },
      { field: 'Notes', label: 'Rank / Notes / Specialization', synonyms: ['notes', 'rank', 'status', 'type', 'appointment', 'full-time/adjunct', 'specialization', 'department', 'title'] },
    ],
  },
  {
    module: 'assignments',
    label: 'Course Section Assignments',
    description: 'Semester section offerings, CRN, assigned faculty, modality, and dates.',
    tabSynonyms: ['schedule', 'assignments', 'sections', 'course assignments', 'class schedule', 'offerings', 'fall', 'spring', 'summer', 'teaching load'],
    sampleRequiredKey: 'Course ID',
    columns: [
      { field: 'Course ID', label: 'Course Code / Course ID', required: true, synonyms: ['course code', 'course id', 'course', 'class', 'course #', 'sub/crse'] },
      { field: 'Section', label: 'Section Number / Code', synonyms: ['section', 'sec', 'section #', 'section number', 'crn', 'class nbr'] },
      { field: 'Term ID', label: 'Academic Term', synonyms: ['term id', 'term', 'semester', 'session', 'academic term'] },
      { field: 'Instructor Email', label: 'Assigned Instructor Email / Name', synonyms: ['instructor email', 'instructor', 'faculty', 'professor', 'assigned to', 'instructor name', 'faculty email'] },
      { field: 'Modality', label: 'Instructional Modality', synonyms: ['modality', 'delivery', 'delivery method', 'instruction mode', 'format', 'type', 'online/in-person'] },
      { field: 'Part of Term', label: 'Part of Term (8-wk / 16-wk)', synonyms: ['part of term', 'pot', 'session', 'sub-term', 'session length'] },
      { field: 'Delivery Label', label: 'Delivery Schedule / Times', synonyms: ['delivery label', 'meeting times', 'days/times', 'room', 'schedule', 'time'] },
      { field: 'Start Date', label: 'Class Start Date', synonyms: ['start date', 'begins', 'starts', 'start'] },
      { field: 'End Date', label: 'Class End Date', synonyms: ['end date', 'ends', 'concludes', 'end'] },
    ],
  },
  {
    module: 'tasks',
    label: 'Operational Tasks & Action Items',
    description: 'Work board tasks, syllabus reviews, compliance duties, priorities, and deadlines.',
    tabSynonyms: ['task', 'tasks', 'action items', 'to-do', 'checklist', 'workboard', 'work board', 'operations', 'duties', 'compliance tasks'],
    sampleRequiredKey: 'Title',
    columns: [
      { field: 'Title', label: 'Task Title / Action Item', required: true, synonyms: ['title', 'task', 'task title', 'task name', 'action item', 'action', 'description', 'duty', 'item'] },
      { field: 'Description', label: 'Task Details', synonyms: ['description', 'details', 'notes', 'instructions', 'scope'] },
      { field: 'Status', label: 'Workflow Status', synonyms: ['status', 'state', 'stage', 'progress'] },
      { field: 'Priority', label: 'Priority Level', synonyms: ['priority', 'urgency', 'importance', 'severity'] },
      { field: 'Due Date', label: 'Target Due Date', synonyms: ['due date', 'deadline', 'due', 'target date', 'date due'] },
      { field: 'Owner Email', label: 'Assignee / Owner Email', synonyms: ['owner email', 'owner', 'assigned to', 'assignee', 'responsible', 'person'] },
      { field: 'Task Scope', label: 'Task Scope (Course/Program/Accreditation)', synonyms: ['task scope', 'scope', 'category', 'level'] },
    ],
  },
  {
    module: 'plos',
    label: 'Program Learning Outcomes (PLOs)',
    description: 'Program educational goals, competencies, and learning outcome statements.',
    tabSynonyms: ['plo', 'plos', 'outcomes', 'program outcomes', 'competencies', 'goals', 'program learning outcomes', 'learning outcomes'],
    sampleRequiredKey: 'PLO Statement',
    columns: [
      { field: 'PLO Number', label: 'PLO Number / Code', synonyms: ['plo number', 'plo #', 'number', 'code', 'outcome #', 'identifier', 'id'] },
      { field: 'PLO Title', label: 'Outcome Short Title', synonyms: ['plo title', 'title', 'name', 'competency', 'outcome title', 'area'] },
      { field: 'PLO Statement', label: 'Learning Outcome Statement', required: true, synonyms: ['plo statement', 'statement', 'outcome statement', 'description', 'learning outcome', 'outcome text', 'text'] },
    ],
  },
  {
    module: 'advisees',
    label: 'Student Advisees & Retention',
    description: 'Student advisee roster, degree progress, risk indicators, and follow-ups.',
    tabSynonyms: ['advisee', 'advisees', 'students', 'advising', 'retention', 'student roster', 'majors', 'caseload'],
    sampleRequiredKey: 'Student Name',
    columns: [
      { field: 'Student Name', label: 'Student Full Name', required: true, synonyms: ['student name', 'name', 'student', 'full name', 'advisee name', 'advisee'] },
      { field: 'Student Email', label: 'Student Email Address', synonyms: ['student email', 'email', 'student e-mail', 'contact email'] },
      { field: 'Status', label: 'Academic Standing / Status', synonyms: ['status', 'standing', 'academic standing', 'enrollment status'] },
      { field: 'Expected Graduation', label: 'Expected Graduation Date', synonyms: ['expected graduation', 'graduation date', 'grad date', 'cohort', 'anticipated graduation'] },
      { field: 'Risk Flag', label: 'Academic Risk Flag', synonyms: ['risk flag', 'risk', 'at risk', 'alert', 'flag', 'retention risk'] },
      { field: 'Notes', label: 'Advising Notes / Major', synonyms: ['notes', 'major', 'program', 'advising notes', 'comments'] },
    ],
  },
  {
    module: 'credentials',
    label: 'Industry Credentials & Certifications',
    description: 'Certifications mapped to curriculum (CompTIA, AWS, Cisco, etc.), costs, and providers.',
    tabSynonyms: ['credential', 'credentials', 'certifications', 'certs', 'industry credentials', 'exams', 'badges'],
    sampleRequiredKey: 'Credential Name',
    columns: [
      { field: 'Credential Name', label: 'Certification / Credential Name', required: true, synonyms: ['credential name', 'credential', 'certification', 'cert name', 'name', 'exam name'] },
      { field: 'Provider', label: 'Issuing Provider / Body', synonyms: ['provider', 'vendor', 'issuing body', 'organization', 'certifying agency'] },
      { field: 'Classification', label: 'Stackability / Level', synonyms: ['classification', 'level', 'tier', 'type', 'category'] },
      { field: 'Cost', label: 'Exam Cost ($)', synonyms: ['cost', 'exam cost', 'price', 'fee'] },
      { field: 'Required/Optional', label: 'Curricular Status', synonyms: ['required/optional', 'status', 'requirement', 'embedded', 'mandated'] },
    ],
  },
  {
    module: 'accreditation',
    label: 'Accreditation Evidence & Standards',
    description: 'HLC and specialized programmatic accreditation standards and evidence links.',
    tabSynonyms: ['accreditation', 'evidence', 'hlc', 'standards', 'assurance', 'compliance evidence', 'accreditation evidence'],
    sampleRequiredKey: 'Title',
    columns: [
      { field: 'Title', label: 'Evidence Title / Artifact Name', required: true, synonyms: ['title', 'evidence title', 'artifact', 'document title', 'name', 'item'] },
      { field: 'Requirement / Standard', label: 'Criterion / Standard (e.g. HLC 4.B)', required: true, synonyms: ['requirement / standard', 'standard', 'criterion', 'hlc criterion', 'requirement', 'sub-criterion'] },
      { field: 'Bodies / Frameworks', label: 'Accreditation Body', synonyms: ['bodies / frameworks', 'body', 'agency', 'framework', 'accreditor'] },
      { field: 'Evidence URL', label: 'Link to File / Evidence URL', synonyms: ['evidence url', 'link', 'url', 'file url', 'document link', 'google drive link'] },
      { field: 'Status', label: 'Verification Status', synonyms: ['status', 'verification', 'state', 'review status'] },
    ],
  },
  {
    module: 'calendar',
    label: 'Academic Calendar & Milestones',
    description: 'Census locks, grade deadlines, committee meetings, and semester milestones.',
    tabSynonyms: ['calendar', 'events', 'milestones', 'deadlines', 'dates', 'academic calendar', 'important dates'],
    sampleRequiredKey: 'Title',
    columns: [
      { field: 'Title', label: 'Event / Milestone Name', required: true, synonyms: ['title', 'event', 'milestone', 'name', 'activity', 'deadline'] },
      { field: 'Start Date', label: 'Date / Start Date', required: true, synonyms: ['start date', 'date', 'begins', 'event date', 'deadline date'] },
      { field: 'End Date', label: 'End Date', synonyms: ['end date', 'ends', 'finish'] },
      { field: 'Category', label: 'Category / Type', synonyms: ['category', 'type', 'scope', 'event type'] },
      { field: 'Description', label: 'Details / Description', synonyms: ['description', 'details', 'notes', 'summary'] },
    ],
  },
];

export interface SiftedTab {
  sheetName: string;
  totalRows: number;
  rawHeaders: string[];
  sampleRows: Record<string, any>[];
  allRows: Record<string, any>[];
  detectedModule: SheetModule | 'ignore';
  confidence: number; // 0 - 100
  reasoning: string;
  columnMappings: Record<string, string>; // destinationField -> sourceColumnHeader
  enabled: boolean;
}

/**
 * Normalizes text for fuzzy keyword matching
 */
function clean(str: string): string {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/**
 * Calculates string similarity / keyword containment
 */
function matchesKeyword(input: string, keyword: string): boolean {
  const cInput = clean(input);
  const cKey = clean(keyword);
  if (cInput === cKey) return true;
  if (cInput.includes(cKey) || cKey.includes(cInput)) return true;
  return false;
}

/**
 * Intuitively sifts and classifies a single sheet/tab
 */
export function siftSingleSheet(
  sheetName: string,
  rawHeaders: string[],
  allRows: Record<string, any>[]
): SiftedTab {
  const sampleRows = allRows.slice(0, 5);
  const totalRows = allRows.length;

  let bestModule: SheetModule | 'ignore' = 'ignore';
  let bestScore = 0;
  let bestReasoning = 'No matching academic module patterns found.';
  let bestMappings: Record<string, string> = {};

  const normSheetName = clean(sheetName);

  for (const profile of SIFT_PROFILES) {
    let score = 0;
    const reasons: string[] = [];
    const mappings: Record<string, string> = {};

    // 1. Tab name affinity (up to 35 points)
    const tabNameMatch = profile.tabSynonyms.some(syn => matchesKeyword(normSheetName, syn));
    if (tabNameMatch) {
      score += 35;
      reasons.push(`Tab name "${sheetName}" matches known pattern for ${profile.label}`);
    }

    // 2. Header matching (up to 55 points)
    let matchedColsCount = 0;
    for (const colDef of profile.columns) {
      // Find best matching raw header
      let bestHeaderMatch: string | null = null;
      let highestColScore = 0;

      for (const header of rawHeaders) {
        const normHeader = clean(header);
        for (const syn of colDef.synonyms) {
          const normSyn = clean(syn);
          if (normHeader === normSyn) {
            highestColScore = 3;
            bestHeaderMatch = header;
            break;
          } else if (normHeader.includes(normSyn) || normSyn.includes(normHeader)) {
            if (highestColScore < 2) {
              highestColScore = 2;
              bestHeaderMatch = header;
            }
          }
        }
        if (highestColScore === 3) break;
      }

      if (bestHeaderMatch) {
        mappings[colDef.field] = bestHeaderMatch;
        matchedColsCount++;
      }
    }

    const colRatio = profile.columns.length > 0 ? matchedColsCount / profile.columns.length : 0;
    const headerPoints = Math.round(colRatio * 50);
    score += headerPoints;
    if (matchedColsCount > 0) {
      reasons.push(`Matched ${matchedColsCount} of ${profile.columns.length} schema columns`);
    }

    // 3. Content sampling verification (up to 15 points)
    // Check if expected email or code format exists
    if (sampleRows.length > 0) {
      if (profile.module === 'instructors' || profile.module === 'advisees') {
        const hasEmail = sampleRows.some(r =>
          Object.values(r).some(v => typeof v === 'string' && v.includes('@'))
        );
        if (hasEmail) {
          score += 15;
          reasons.push('Contains email addresses matching directory format');
        }
      } else if (profile.module === 'courses') {
        const hasCourseCode = sampleRows.some(r =>
          Object.values(r).some(v => typeof v === 'string' && /[A-Za-z]{2,4}\s*\d{3,4}/.test(v))
        );
        if (hasCourseCode) {
          score += 15;
          reasons.push('Contains standard course code patterns (e.g. CYBR 1201)');
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestModule = profile.module;
      bestReasoning = reasons.join(' • ');
      bestMappings = mappings;
    }
  }

  // Confidence capped between 0 and 99
  const confidence = Math.min(99, Math.max(10, bestScore));
  const isConfident = confidence >= 35;

  return {
    sheetName,
    totalRows,
    rawHeaders,
    sampleRows,
    allRows,
    detectedModule: isConfident ? bestModule : 'ignore',
    confidence: isConfident ? confidence : 20,
    reasoning: isConfident ? bestReasoning : 'Unrecognized format or arbitrary sheet structure.',
    columnMappings: bestMappings,
    enabled: isConfident && totalRows > 0,
  };
}

/**
 * Transforms raw rows from an arbitrary source sheet into clean, typed records
 * ready for saving into the target program.
 */
export function transformSiftedRecords(
  tab: SiftedTab,
  targetProgramId: string
): { module: SheetModule; records: Record<string, any>[] } {
  if (tab.detectedModule === 'ignore') {
    return { module: 'courses', records: [] };
  }

  const module = tab.detectedModule;
  const mappings = tab.columnMappings;
  const prefix = ID_PREFIXES[module] || 'REC';
  const now = new Date().toISOString();

  const transformed: Record<string, any>[] = [];

  tab.allRows.forEach(row => {
    const rec: Record<string, any> = {
      'Program ID': targetProgramId,
      'Created At': now,
      'Updated At': now,
      Active: true,
    };

    // 1. Map mapped fields
    Object.entries(mappings).forEach(([destField, srcCol]) => {
      if (srcCol && row[srcCol] !== undefined && row[srcCol] !== '') {
        rec[destField] = row[srcCol];
      }
    });

    // 2. Synthesize Module-specific IDs & Defaults
    switch (module) {
      case 'courses': {
        if (!rec['Course Code'] && !rec['Course Title']) return; // Skip empty
        rec['Course ID'] = generateId(prefix);
        if (!rec['Course Code']) rec['Course Code'] = 'NEW-100';
        if (!rec['Course Title']) rec['Course Title'] = 'Untitled Course';
        if (!rec['Credits']) rec['Credits'] = 3;
        rec.Credits = Number(rec.Credits) || 3;
        break;
      }
      case 'instructors': {
        if (!rec['Instructor Name'] && !rec['Instructor Email']) return;
        rec['Instructor ID'] = generateId(prefix);
        if (!rec['Instructor Name']) rec['Instructor Name'] = 'Faculty Member';
        if (!rec['Instructor Email']) {
          const slug = clean(rec['Instructor Name']).replace(/\s+/g, '');
          rec['Instructor Email'] = `${slug || 'faculty'}@hocking.edu`;
        }
        break;
      }
      case 'assignments': {
        rec['Assignment ID'] = generateId(prefix);
        if (!rec['Term ID']) rec['Term ID'] = 'FA26';
        if (!rec['Section']) rec['Section'] = '01';
        if (!rec['Modality']) rec['Modality'] = 'In-Person';
        rec.Status = 'Active';
        break;
      }
      case 'tasks': {
        if (!rec.Title) return;
        rec['Task ID'] = generateId(prefix);
        if (!rec.Status) rec.Status = 'TODO';
        if (!rec.Priority) rec.Priority = 'Normal';
        if (!rec['Task Scope']) rec['Task Scope'] = 'Program';
        break;
      }
      case 'plos': {
        if (!rec['PLO Statement'] && !rec['PLO Title']) return;
        rec['PLO ID'] = generateId(prefix);
        if (!rec['PLO Number']) rec['PLO Number'] = `PLO-${transformed.length + 1}`;
        if (!rec['PLO Title']) rec['PLO Title'] = rec['PLO Number'];
        if (!rec['PLO Statement']) rec['PLO Statement'] = rec['PLO Title'];
        break;
      }
      case 'advisees': {
        if (!rec['Student Name']) return;
        rec['Student ID'] = generateId(prefix);
        if (!rec.Status) rec.Status = 'Good Standing';
        if (!rec['Risk Flag']) rec['Risk Flag'] = 'None';
        break;
      }
      case 'credentials': {
        if (!rec['Credential Name']) return;
        rec['Credential ID'] = generateId(prefix);
        if (!rec.Provider) rec.Provider = 'Industry Standard';
        if (!rec.Classification) rec.Classification = 'Technical Certificate';
        break;
      }
      case 'accreditation': {
        if (!rec.Title) return;
        rec['Evidence ID'] = generateId(prefix);
        if (!rec['Requirement / Standard']) rec['Requirement / Standard'] = 'HLC 4.B';
        if (!rec['Bodies / Frameworks']) rec['Bodies / Frameworks'] = 'Higher Learning Commission (HLC)';
        rec.Status = 'Verified';
        break;
      }
      case 'calendar': {
        if (!rec.Title) return;
        rec['Calendar ID'] = generateId(prefix);
        if (!rec['Start Date']) rec['Start Date'] = new Date().toISOString().split('T')[0];
        if (!rec['End Date']) rec['End Date'] = rec['Start Date'];
        if (!rec.Category) rec.Category = 'Academic Milestone';
        rec.Scope = 'PROGRAM';
        rec.Status = 'Confirmed';
        rec['All Day'] = true;
        break;
      }
      default: {
        rec[`${module.toUpperCase()}_ID`] = generateId(prefix);
      }
    }

    transformed.push(rec);
  });

  return { module, records: transformed };
}
