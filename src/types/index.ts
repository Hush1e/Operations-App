export type GlobalRole = 'ADMIN' | 'DEAN' | 'DIRECTOR_MANAGER' | 'INSTRUCTOR';
export type TaskScope = 'Program' | 'Course' | 'Instructor';
export type TaskStatus = 'TO DO' | 'READY' | 'IN PROGRESS' | 'WAITING/BLOCKED' | 'REVIEW NEEDED' | 'COMPLETE';
export type Priority = 'Critical' | 'High' | 'Normal' | 'Low';

export interface UserRecord {
  'User ID': string;
  'Email': string;
  'Display Name': string;
  'Global Role': GlobalRole;
  'Active': boolean | string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface ProgramRecord {
  'Program ID': string;
  'Program Name': string;
  'Program Code': string;
  'Division': string;
  'CIP': string;
  'Status': 'Active' | 'Inactive' | 'Deleted';
  'Dean Email': string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface ProgramAccessRecord {
  'Access ID': string;
  'Program ID': string;
  'User Email': string;
  'Program Role': string;
  'Default Program': boolean | string;
  'Active': boolean | string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface TermRecord {
  'Term ID': string;
  'Term Name': string;
  'Academic Year': string;
  'Start Date': string;
  'End Date': string;
  'Status': string;
}

export interface CourseRecord {
  'Course ID': string;
  'Program ID': string;
  'Course Code': string;
  'Course Title': string;
  'Credits': number | string;
  'Term Placement': string;
  'Length Weeks': number | string;
  'Description'?: string;
  'Active': boolean | string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface InstructorRecord {
  'Instructor ID': string;
  'Program ID': string;
  'Instructor Name': string;
  'Instructor Email': string;
  'Active': boolean | string;
  'Notes'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface CourseAssignmentRecord {
  'Assignment ID': string;
  'Program ID': string;
  'Term ID': string;
  'Course ID': string;
  'Section': string;
  'Delivery Label': string;
  'Modality': string;
  'Part of Term': string;
  'Instructor Email': string;
  'Start Date': string;
  'End Date': string;
  'Status': string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface AssignmentComponentRecord {
  'Component ID': string;
  'Assignment ID': string;
  'Program ID': string;
  'Component Type': string;
  'Instructor Email': string;
  'Modality': string;
  'Meeting Details'?: string;
  'Active': boolean | string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface CalendarEventRecord {
  'Calendar ID': string;
  'Program ID': string;
  'Scope': 'Program' | 'GLOBAL';
  'Title': string;
  'Category': string;
  'Start Date': string;
  'End Date': string;
  'All Day': boolean | string;
  'Description'?: string;
  'Location'?: string;
  'Source'?: string;
  'Status': string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface TaskRecord {
  'Task ID': string;
  'Program ID': string;
  'Term ID'?: string;
  'Course ID'?: string;
  'Assignment ID'?: string;
  'Owner Email': string;
  'Task Scope': TaskScope;
  'Task Type': string;
  'Title': string;
  'Description': string;
  'Status': TaskStatus;
  'Priority': Priority;
  'Due Date'?: string;
  'Evidence URL'?: string;
  'Blocked Reason'?: string;
  'Generated'?: boolean | string;
  'Archived'?: boolean | string;
  'Recurring Rule ID'?: string;
  'Recurrence Date'?: string;
  'Template ID'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface TaskTemplateRecord {
  'Template ID': string;
  'Program ID': string;
  'Template Name': string;
  'Task Scope': TaskScope;
  'Task Type': string;
  'Title': string;
  'Description': string;
  'Default Priority': Priority;
  'Repeat Type': string;
  'Default Day': string;
  'Applies To': string;
  'Part of Term'?: string;
  'Active': boolean | string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface RecurringTaskRuleRecord {
  'Rule ID': string;
  'Program ID': string;
  'Task Scope': TaskScope;
  'Term ID'?: string;
  'Course ID'?: string;
  'Owner Email': string;
  'Template ID'?: string;
  'Title': string;
  'Description': string;
  'Frequency': 'Weekly' | 'Every 2 Weeks' | 'Monthly';
  'Interval': number | string;
  'Day of Week': string;
  'Start Date': string;
  'End Date': string;
  'Priority': Priority;
  'Status': string;
  'Active': boolean | string;
  'Last Generated Through'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface AdviseeRecord {
  'Student ID': string;
  'Program ID': string;
  'Student Name': string;
  'Student Email': string;
  'Status': string;
  'Expected Graduation': string;
  'Risk Flag': string;
  'Next Follow-Up': string;
  'Notes'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface AdvisingNoteRecord {
  'Note ID': string;
  'Program ID': string;
  'Student ID': string;
  'Date': string;
  'Author Email': string;
  'Topic': string;
  'Summary': string;
  'Action Plan': string;
  'Follow-Up Date': string;
  'Sensitivity': string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface PloRecord {
  'PLO ID': string;
  'Program ID': string;
  'PLO Number': string;
  'PLO Title': string;
  'PLO Statement': string;
  'Active': boolean | string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface CloRecord {
  'CLO ID': string;
  'Program ID': string;
  'Course ID': string;
  'CLO Number': string;
  'CLO Statement': string;
  'Assessment Method': string;
  'Source / Approval': string;
  'Status': string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface CoursePloMapRecord {
  'Mapping ID': string;
  'Program ID': string;
  'Course ID': string;
  'PLO ID': string;
  'Development Level': string; // I or R
  'Assessment Role': string;   // F or S
  'Notes'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface CloAssessmentMapRecord {
  'Mapping ID': string;
  'Program ID': string;
  'Course ID': string;
  'CLO ID': string;
  'Assessment Name': string;
  'Development Level': string; // I or R
  'Assessment Role': string;   // F or S
  'Assessment Type'?: string;
  'Evidence URL'?: string;
  'Notes'?: string;
  'Active': boolean | string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface CourseActivityRecord {
  'Activity ID': string;
  'Program ID': string;
  'Course ID': string;
  'Week': string;
  'Activity Name': string;
  'Category': string;
  'Grade Category': string;
  'Grade Weight'?: string;
  'Graded'?: string;
  'Individual/Group'?: string;
  'Major/Minor'?: string;
  'CLOs Supported'?: string;
  'Applied AI'?: string;
  'Portfolio Artifact'?: string;
  'Credential Connection'?: string;
  'Assessment Use'?: string; // Practice Only, Formative, Summative, Portfolio Evidence
  'Evidence Available'?: string;
  'Notes'?: string;
  'Active': boolean | string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface AssessmentRecord {
  'Assessment ID': string;
  'Program ID': string;
  'Course ID': string;
  'PLO ID': string;
  'Measure': string;
  'Benchmark': string;
  'Result': string;
  'Finding': string;
  'Action Needed'?: string;
  'Status': string;
  'Rubric URL'?: string;
  'Evidence URL'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface ContinuousImprovementRecord {
  'Improvement ID': string;
  'Program ID': string;
  'Source ID': string;
  'Issue/Finding': string;
  'Action': string;
  'Owner Email': string;
  'Target Date': string;
  'Status': string;
  'Evidence URL'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface AccreditationBodyRecord {
  'Body ID': string;
  'Program ID': string;
  'Body / Framework': string;
  'Type': string;
  'Required': string;
  'Review Cycle': string;
  'Next Review Date': string;
  'Standards URL'?: string;
  'Primary Contact'?: string;
  'Status': string;
  'Notes'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface AccreditationEvidenceRecord {
  'Evidence ID': string;
  'Program ID': string;
  'Course ID'?: string;
  'Bodies / Frameworks': string;
  'Requirement / Standard': string;
  'Evidence Type': string;
  'Title': string;
  'Description': string;
  'Owner Email': string;
  'Due Date': string;
  'Status': string;
  'Evidence URL'?: string;
  'Review Date'?: string;
  'Report Tags'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface CredentialRecord {
  'Credential ID': string;
  'Program ID': string;
  'Course ID'?: string;
  'Credential Name': string;
  'Family': string;
  'Provider': string;
  'Classification': string;
  'Required/Optional': string;
  'Cost'?: string;
  'Status': string;
  'URL'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface PortfolioRecord {
  'Artifact ID': string;
  'Program ID': string;
  'Course ID'?: string;
  'Artifact Title': string;
  'Knowledge Area': string;
  'Crosscutting Concepts': string;
  'Artifact URL'?: string;
  'Credential Evidence'?: string;
  'AI Evidence'?: string;
  'Status': string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface WorkforceAdvisoryRecord {
  'Record ID': string;
  'Program ID': string;
  'Type': string;
  'Organization / Source': string;
  'Title': string;
  'Date': string;
  'Finding / Recommendation': string;
  'Action': string;
  'Owner Email': string;
  'Status': string;
  'Evidence URL'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export interface ProgramFeatureRecord {
  'Feature ID': string;
  'Program ID': string;
  'Feature Key': string;
  'Feature Label': string;
  'Enabled': boolean | string;
  'Notes'?: string;
  'Created At'?: string;
  'Updated At'?: string;
}

export type SheetModule =
  | 'users'
  | 'programs'
  | 'access'
  | 'terms'
  | 'courses'
  | 'instructors'
  | 'assignments'
  | 'components'
  | 'calendar'
  | 'tasks'
  | 'tasktemplates'
  | 'recurring'
  | 'advisees'
  | 'advising'
  | 'plos'
  | 'clos'
  | 'courseplos'
  | 'cloassessments'
  | 'activities'
  | 'assessments'
  | 'improvement'
  | 'improvements'
  | 'bodies'
  | 'accreditation'
  | 'credentials'
  | 'portfolio'
  | 'workforce'
  | 'features';
