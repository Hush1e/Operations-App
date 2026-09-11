/**
 * Sample Multi-Sheet Academic Workbook for Testing and Demo
 * Simulates an existing unrelated multi-sheet Google Spreadsheet or Excel workbook
 * from a department chair with arbitrary tab names and column headers.
 */

export interface RawWorkbookSheet {
  sheetName: string;
  headers: string[];
  rows: Record<string, any>[];
}

export const SAMPLE_MULTI_SHEET_WORKBOOK: RawWorkbookSheet[] = [
  {
    sheetName: 'Dept Course Offerings 2026',
    headers: ['Course #', 'Course Title', 'Credit Hours', 'Recommended Term', 'Catalog Description'],
    rows: [
      {
        'Course #': 'CYBR 1201',
        'Course Title': 'Introduction to Computer Hardware & Operating Systems',
        'Credit Hours': '3',
        'Recommended Term': 'Term 1 (Fall)',
        'Catalog Description': 'Foundational PC hardware architecture, virtualization configurations, and command-line operating system management.',
      },
      {
        'Course #': 'CYBR 1205',
        'Course Title': 'Network Defense & Infrastructure Fundamentals',
        'Credit Hours': '4',
        'Recommended Term': 'Term 1 (Fall)',
        'Catalog Description': 'Principles of OSI model layer operations, TCP/IP subnetting, switch security, and perimeter packet filtering.',
      },
      {
        'Course #': 'CYBR 2210',
        'Course Title': 'Ethical Hacking, Penetration Testing & Defense',
        'Credit Hours': '3',
        'Recommended Term': 'Term 3 (Fall)',
        'Catalog Description': 'Comprehensive offensive penetration testing methodology, recon techniques, vulnerability scanning, and hardening.',
      },
      {
        'Course #': 'CYBR 2250',
        'Course Title': 'Cloud Security Operations & Compliance',
        'Credit Hours': '3',
        'Recommended Term': 'Term 4 (Spring)',
        'Catalog Description': 'Identity access management, zero-trust cloud architecture, encryption keys, and auditing across multi-tenant infrastructures.',
      },
      {
        'Course #': 'CYBR 2299',
        'Course Title': 'Cybersecurity Capstone & Industry Portfolio',
        'Credit Hours': '2',
        'Recommended Term': 'Term 4 (Spring)',
        'Catalog Description': 'Synthesizing defensive operations, client consulting, live enterprise cyber range incident response, and portfolio defense.',
      },
    ],
  },
  {
    sheetName: 'Faculty & Staff Roster',
    headers: ['Faculty Member', 'Work Email', 'Appointment Type', 'Specialization'],
    rows: [
      {
        'Faculty Member': 'Dr. Nicholas DePriest',
        'Work Email': 'depriestn@hocking.edu',
        'Appointment Type': 'Full-Time Professor & Program Director',
        'Specialization': 'Cybersecurity Architecture, HLC Assurance, Linux Systems',
      },
      {
        'Faculty Member': 'Prof. Sarah Jenkins',
        'Work Email': 'jenkinss@hocking.edu',
        'Appointment Type': 'Associate Professor',
        'Specialization': 'Network Defense, CCNA, Virtualization Infrastructure',
      },
      {
        'Faculty Member': 'Marcus Vance',
        'Work Email': 'vancem@hocking.edu',
        'Appointment Type': 'Adjunct Lecturer / Industry SME',
        'Specialization': 'Penetration Testing, Incident Response, Red Teaming',
      },
      {
        'Faculty Member': 'Elena Rostova',
        'Work Email': 'rostovae@hocking.edu',
        'Appointment Type': 'Assistant Professor',
        'Specialization': 'Database Security, Applied Cryptography, Cloud Architectures',
      },
    ],
  },
  {
    sheetName: 'Fall 2026 Schedule & Sections',
    headers: ['Course Code', 'Section #', 'Instructor Email', 'Delivery Method', 'Part of Term', 'Meeting Details'],
    rows: [
      {
        'Course Code': 'CYBR 1201',
        'Section #': '01',
        'Instructor Email': 'depriestn@hocking.edu',
        'Delivery Method': 'In-Person',
        'Part of Term': '16-Week Full Term',
        'Meeting Details': 'Mon/Wed 9:00 AM - 10:50 AM (Tech Lab 204)',
      },
      {
        'Course Code': 'CYBR 1205',
        'Section #': '01',
        'Instructor Email': 'jenkinss@hocking.edu',
        'Delivery Method': 'Hybrid',
        'Part of Term': '16-Week Full Term',
        'Meeting Details': 'Tue/Thu 1:00 PM - 2:50 PM (Cisco Net Lab)',
      },
      {
        'Course Code': 'CYBR 2210',
        'Section #': '01',
        'Instructor Email': 'vancem@hocking.edu',
        'Delivery Method': 'Online Asynchronous',
        'Part of Term': '1st 8-Week Session',
        'Meeting Details': 'LMS Virtual Cyber Lab Environment',
      },
      {
        'Course Code': 'CYBR 2250',
        'Section #': '01',
        'Instructor Email': 'rostovae@hocking.edu',
        'Delivery Method': 'In-Person',
        'Part of Term': '2nd 8-Week Session',
        'Meeting Details': 'Friday 9:00 AM - 12:45 PM (Cloud Suite)',
      },
    ],
  },
  {
    sheetName: 'Program Learning Outcomes (PLOs)',
    headers: ['Outcome #', 'Competency Area', 'Learning Outcome Statement'],
    rows: [
      {
        'Outcome #': 'PLO 1',
        'Competency Area': 'System Hardening & Defensive Architecture',
        'Learning Outcome Statement': 'Design, configure, and audit resilient computing architectures across physical, virtual, and hybrid cloud infrastructures.',
      },
      {
        'Outcome #': 'PLO 2',
        'Competency Area': 'Threat Analysis & Ethical Hacking',
        'Learning Outcome Statement': 'Execute systematic vulnerability assessments and ethical penetration tests adhering to legal, ethical, and industry frameworks.',
      },
      {
        'Outcome #': 'PLO 3',
        'Competency Area': 'Incident Response & Digital Forensics',
        'Learning Outcome Statement': 'Coordinate containment, eradication, chain of custody preservation, and forensic investigation during security breach scenarios.',
      },
      {
        'Outcome #': 'PLO 4',
        'Competency Area': 'Regulatory Governance & Compliance',
        'Learning Outcome Statement': 'Evaluate enterprise posture against NIST, ISO 27001, HIPAA, and industry-mandated security governance baselines.',
      },
    ],
  },
  {
    sheetName: 'Active Student Advisees',
    headers: ['Student Full Name', 'Student Email', 'Academic Standing', 'Expected Grad', 'Risk Level', 'Advising Notes'],
    rows: [
      {
        'Student Full Name': 'Jordan Miller',
        'Student Email': 'millerj@students.hocking.edu',
        'Academic Standing': 'Good Standing',
        'Expected Grad': 'Spring 2027',
        'Risk Level': 'None',
        'Advising Notes': 'On track for CompTIA Security+ certification; interested in Cloud internship.',
      },
      {
        'Student Full Name': 'Alex Rivera',
        'Student Email': 'riveraa@students.hocking.edu',
        'Academic Standing': 'Academic Probation',
        'Expected Grad': 'Fall 2027',
        'Risk Level': 'High',
        'Advising Notes': 'Needs tutoring in subnetting mathematics; scheduled bi-weekly check-ins.',
      },
      {
        'Student Full Name': 'Taylor Campbell',
        'Student Email': 'campbellt@students.hocking.edu',
        'Academic Standing': 'Dean\'s List',
        'Expected Grad': 'Spring 2026',
        'Risk Level': 'None',
        'Advising Notes': 'Preparing Capstone research paper on container security policies.',
      },
    ],
  },
  {
    sheetName: 'Semester Operational Tasks',
    headers: ['Action Item', 'Assigned Person', 'Target Due Date', 'Priority Level', 'Workflow Status', 'Task Scope'],
    rows: [
      {
        'Action Item': 'Audit all Fall 2026 Syllabi for HLC CLO Alignment Statements',
        'Assigned Person': 'depriestn@hocking.edu',
        'Target Due Date': '2026-08-15',
        'Priority Level': 'High',
        'Workflow Status': 'TO DO',
        'Task Scope': 'Course',
      },
      {
        'Action Item': 'Convene Fall Industry Advisory Council & Record Minutes',
        'Assigned Person': 'depriestn@hocking.edu',
        'Target Due Date': '2026-10-15',
        'Priority Level': 'Normal',
        'Workflow Status': 'TO DO',
        'Task Scope': 'Program',
      },
      {
        'Action Item': 'Collect Direct Assessment Rubrics for PLO 2 Capstone Evaluations',
        'Assigned Person': 'vancem@hocking.edu',
        'Target Due Date': '2026-11-20',
        'Priority Level': 'High',
        'Workflow Status': 'TO DO',
        'Task Scope': 'Program',
      },
    ],
  },
];
