/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './services/dataContext';
import { Header } from './components/Header';
import { Sidebar, AppRoute } from './components/Sidebar';
import { HomeOverview } from './components/HomeOverview';
import { CourseWorkspace } from './components/CourseWorkspace';
import { WorkBoard } from './components/WorkBoard';
import { AcademicCalendar } from './components/AcademicCalendar';
import { CourseAssignments } from './components/CourseAssignments';
import { AssessmentCenter } from './components/AssessmentCenter';
import { FacultyWorkload } from './components/FacultyWorkload';
import { AdvisingCenter } from './components/AdvisingCenter';
import { CredentialsWorkforce } from './components/CredentialsWorkforce';
import { AccreditationEvidence } from './components/AccreditationEvidence';
import { ContinuousImprovement } from './components/ContinuousImprovement';
import { ImportExportCenter } from './components/ImportExportCenter';
import { ProgramSettings } from './components/ProgramSettings';
import { SpreadsheetModal } from './components/SpreadsheetModal';
import { RecordModal } from './components/RecordModal';
import { Wizards, WizardType } from './components/Wizards';
import { ProgramManagerModal } from './components/ProgramManagerModal';
import { HlcReportsCenter } from './components/HlcReportsCenter';
import { FirstTimeSetupWizard } from './components/FirstTimeSetupWizard';
import { TaskRecord } from './types';

function MainLayout() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [isProgramManagerOpen, setIsProgramManagerOpen] = useState(false);
  const [isFirstTimeSetupOpen, setIsFirstTimeSetupOpen] = useState(false);

  // Dynamic record modal state
  const [recordModalConfig, setRecordModalConfig] = useState<{
    isOpen: boolean;
    module: string | null;
    record: any | null;
    prefill?: any;
  }>({
    isOpen: false,
    module: null,
    record: null,
  });

  // Wizards state
  const [wizardType, setWizardType] = useState<WizardType>(null);

  // First-time visitor check: auto-open the setup wizard if new user
  useEffect(() => {
    const hasVisited = localStorage.getItem('academic_ops_visited');
    if (!hasVisited) {
      localStorage.setItem('academic_ops_visited', 'true');
      setIsFirstTimeSetupOpen(true);
    }
  }, []);

  const handleOpenRecordModal = (module: string, record?: any, prefill?: any) => {
    setRecordModalConfig({
      isOpen: true,
      module,
      record: record || null,
      prefill,
    });
  };

  const handleCloseRecordModal = () => {
    setRecordModalConfig({
      isOpen: false,
      module: null,
      record: null,
    });
  };

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'home':
        return (
          <HomeOverview
            onNavigate={setCurrentRoute}
            onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
            onOpenProgramManager={() => setIsProgramManagerOpen(true)}
            onOpenWizardsHub={() => setWizardType('HUB')}
            onOpenCalendarSync={() => setWizardType('CALENDAR_SYNC')}
          />
        );
      case 'courses':
        return <CourseWorkspace onOpenRecordModal={handleOpenRecordModal} />;
      case 'workboard':
        return (
          <WorkBoard
            onOpenTaskModal={(task?: TaskRecord) => handleOpenRecordModal('tasks', task)}
            onOpenPrepareWizard={() => setWizardType('PREPARE_TERM')}
            onOpenTemplateWizard={() => setWizardType('TASK_TEMPLATE')}
            onOpenRecurringWizard={() => setWizardType('RECURRING_WORK')}
            onOpenAssignInstructorWizard={() => setWizardType('PREPARE_TERM')}
          />
        );
      case 'calendar':
        return <AcademicCalendar onOpenRecordModal={handleOpenRecordModal} />;
      case 'assignments':
        return <CourseAssignments onOpenRecordModal={handleOpenRecordModal} />;
      case 'assessment':
        return <AssessmentCenter onOpenRecordModal={handleOpenRecordModal} />;
      case 'faculty':
        return <FacultyWorkload onOpenRecordModal={handleOpenRecordModal} />;
      case 'advising':
        return <AdvisingCenter onOpenRecordModal={handleOpenRecordModal} />;
      case 'credentials':
        return <CredentialsWorkforce onOpenRecordModal={handleOpenRecordModal} />;
      case 'accreditation':
        return <AccreditationEvidence onOpenRecordModal={handleOpenRecordModal} />;
      case 'reports':
        return <HlcReportsCenter />;
      case 'improvement':
        return <ContinuousImprovement onOpenRecordModal={handleOpenRecordModal} />;
      case 'imports':
        return <ImportExportCenter />;
      case 'settings':
        return <ProgramSettings />;
      default:
        return (
          <HomeOverview
            onNavigate={setCurrentRoute}
            onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
            onOpenProgramManager={() => setIsProgramManagerOpen(true)}
            onOpenWizardsHub={() => setWizardType('HUB')}
            onOpenCalendarSync={() => setWizardType('CALENDAR_SYNC')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Top Header */}
      <Header
        onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
        onOpenProgramManager={() => setIsProgramManagerOpen(true)}
        onOpenWizardsHub={() => setWizardType('HUB')}
        onOpenCalendarSync={() => setWizardType('CALENDAR_SYNC')}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <Sidebar currentRoute={currentRoute} onNavigate={setCurrentRoute} />

        {/* Dynamic Route Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderCurrentView()}
        </main>
      </div>

      {/* Modals & Wizards */}
      <SpreadsheetModal
        isOpen={isSpreadsheetModalOpen}
        onClose={() => setIsSpreadsheetModalOpen(false)}
      />

      <RecordModal
        isOpen={recordModalConfig.isOpen}
        module={recordModalConfig.module}
        record={recordModalConfig.record}
        prefill={recordModalConfig.prefill}
        onClose={handleCloseRecordModal}
      />

      <ProgramManagerModal
        isOpen={isProgramManagerOpen}
        onClose={() => setIsProgramManagerOpen(false)}
      />

      <FirstTimeSetupWizard
        isOpen={isFirstTimeSetupOpen}
        onClose={() => setIsFirstTimeSetupOpen(false)}
        onComplete={() => setIsFirstTimeSetupOpen(false)}
      />

      <Wizards
        type={wizardType}
        onClose={() => setWizardType(null)}
        onOpenProgramManager={() => setIsProgramManagerOpen(true)}
        onOpenFirstTimeSetup={() => setIsFirstTimeSetupOpen(true)}
        onOpenHlcReports={() => setCurrentRoute('reports')}
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <MainLayout />
    </DataProvider>
  );
}
