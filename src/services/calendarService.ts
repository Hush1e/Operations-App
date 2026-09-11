/**
 * Google Calendar & Academic Calendar Synchronization Service
 * Handles fetching events from Google Calendar REST API,
 * importing institutional academic calendar milestones,
 * and generating iCalendar (.ics) exports.
 */

import { CalendarEventRecord } from '../types';

export interface GoogleCalendarApiEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

/**
 * Fetches upcoming events from the user's primary Google Calendar via REST API.
 */
export async function fetchGoogleCalendarEvents(
  accessToken: string,
  timeMin?: string
): Promise<GoogleCalendarApiEvent[]> {
  const minIso = timeMin || new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    minIso
  )}&maxResults=50&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Calendar request failed: ${errorText}`);
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Standard Academic Calendar Milestone Presets for Higher Education (Hocking College cycle)
 */
export interface AcademicCalendarPreset {
  termName: string;
  events: Array<{
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    category: string;
    eventType: string;
    allDay: boolean;
  }>;
}

export function getStandardAcademicCalendarPresets(academicYear: string = '2026-2027'): AcademicCalendarPreset[] {
  return [
    {
      termName: 'Fall 2026',
      events: [
        {
          title: 'Fall Faculty In-Service & Return Date',
          description: 'Faculty report for departmental meetings, syllabus alignment, and convocation.',
          startDate: '2026-08-17T09:00:00',
          endDate: '2026-08-17T17:00:00',
          category: 'Faculty',
          eventType: 'Meeting',
          allDay: true,
        },
        {
          title: 'Fall Semester Classes Begin',
          description: 'First day of instruction for full-term 16-week and 1st 8-week sessions.',
          startDate: '2026-08-24T08:00:00',
          category: 'Instruction',
          eventType: 'Academic Milestone',
          allDay: true,
        },
        {
          title: 'Course Add / Drop Period Closes',
          description: 'Last day for students to add courses or drop without academic penalty.',
          startDate: '2026-08-31T17:00:00',
          category: 'Registration',
          eventType: 'Academic Deadline',
          allDay: true,
        },
        {
          title: '14-Day Official Enrollment Census Date',
          description: 'Rosters certified and submitted to Institutional Research for state reporting.',
          startDate: '2026-09-08T17:00:00',
          category: 'Compliance',
          eventType: 'Institutional Deadline',
          allDay: true,
        },
        {
          title: 'Midterm Evaluation & Early Warning Period',
          description: 'Faculty submit midterm grades and retention alerts for students at risk.',
          startDate: '2026-10-12T08:00:00',
          endDate: '2026-10-16T17:00:00',
          category: 'Grading',
          eventType: 'Academic Milestone',
          allDay: false,
        },
        {
          title: 'Spring 2027 Advising & Priority Registration Opens',
          description: 'Faculty advising blocks begin for continuing students.',
          startDate: '2026-10-26T08:00:00',
          category: 'Advising',
          eventType: 'Registration',
          allDay: true,
        },
        {
          title: 'Course Withdrawal Deadline ("W" Grade)',
          description: 'Final date to withdraw from full-term courses.',
          startDate: '2026-11-13T17:00:00',
          category: 'Registration',
          eventType: 'Academic Deadline',
          allDay: true,
        },
        {
          title: 'Fall Final Examinations Week',
          description: 'Official final examination assessment schedule.',
          startDate: '2026-12-07T08:00:00',
          endDate: '2026-12-11T17:00:00',
          category: 'Assessment',
          eventType: 'Exam Schedule',
          allDay: false,
        },
        {
          title: 'Fall Final Grades Due (12:00 PM)',
          description: 'Faculty final letter grade entry deadline in SIS.',
          startDate: '2026-12-14T12:00:00',
          category: 'Grading',
          eventType: 'Academic Deadline',
          allDay: false,
        },
        {
          title: 'Fall Commencement Ceremony',
          description: 'Graduation celebration for Fall degree and certificate completers.',
          startDate: '2026-12-18T14:00:00',
          endDate: '2026-12-18T16:30:00',
          category: 'Institutional',
          eventType: 'Ceremony',
          allDay: false,
        },
      ],
    },
    {
      termName: 'Spring 2027',
      events: [
        {
          title: 'Spring Faculty Development Day',
          description: 'Curriculum review, HLC assurance updates, and division workshops.',
          startDate: '2027-01-08T09:00:00',
          category: 'Faculty',
          eventType: 'Meeting',
          allDay: true,
        },
        {
          title: 'Spring Semester Classes Begin',
          description: 'Instruction begins for full 16-week and 1st 8-week courses.',
          startDate: '2027-01-11T08:00:00',
          category: 'Instruction',
          eventType: 'Academic Milestone',
          allDay: true,
        },
        {
          title: 'Spring Census Date & Roster Certification',
          description: 'Official enrollment reporting lock date.',
          startDate: '2027-01-26T17:00:00',
          category: 'Compliance',
          eventType: 'Institutional Deadline',
          allDay: true,
        },
        {
          title: 'Spring Midterm Grade Submission',
          description: 'Midterm assessment checkpoint.',
          startDate: '2027-03-05T17:00:00',
          category: 'Grading',
          eventType: 'Academic Deadline',
          allDay: true,
        },
        {
          title: 'Spring Break (No Classes)',
          description: 'Campus academic recess.',
          startDate: '2027-03-08T00:00:00',
          endDate: '2027-03-12T23:59:59',
          category: 'Institutional',
          eventType: 'Recess',
          allDay: true,
        },
        {
          title: 'Spring Final Examination Week',
          description: 'Final assessments and outcome artifact collection.',
          startDate: '2027-05-03T08:00:00',
          endDate: '2027-05-07T17:00:00',
          category: 'Assessment',
          eventType: 'Exam Schedule',
          allDay: false,
        },
        {
          title: 'Spring Final Grades Due',
          description: 'Official deadline for all Spring course grades.',
          startDate: '2027-05-10T12:00:00',
          category: 'Grading',
          eventType: 'Academic Deadline',
          allDay: false,
        },
        {
          title: 'Annual Commencement Ceremony',
          description: 'Spring Graduation celebration.',
          startDate: '2027-05-14T10:00:00',
          endDate: '2027-05-14T13:00:00',
          category: 'Institutional',
          eventType: 'Ceremony',
          allDay: false,
        },
      ],
    },
  ];
}

/**
 * Generates an iCalendar (.ics) string from an array of CalendarEventRecords.
 */
export function generateICalendarFile(events: CalendarEventRecord[], calendarTitle: string = 'Academic Program Calendar'): string {
  const formatDate = (isoString?: string): string => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Academic Operations//Google Sheets Database//EN',
    `X-WR-CALNAME:${calendarTitle}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach(e => {
    const dtStart = formatDate(e['Start Date']);
    const dtEnd = formatDate(e['End Date'] || e['Start Date']);
    if (!dtStart) return;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e['Event ID'] || Math.random().toString(36).slice(2)}@academicops.edu`);
    lines.push(`DTSTAMP:${formatDate(new Date().toISOString())}`);
    lines.push(`DTSTART:${dtStart}`);
    if (dtEnd) lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${e.Title || 'Academic Event'}`);
    if (e.Description) lines.push(`DESCRIPTION:${e.Description.replace(/\n/g, '\\n')}`);
    if (e.Location) lines.push(`LOCATION:${e.Location}`);
    if (e.Category) lines.push(`CATEGORIES:${e.Category}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
