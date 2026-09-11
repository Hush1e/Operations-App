import React from 'react';
import { useData } from '../services/dataContext';
import {
  LayoutDashboard,
  BookOpen,
  KanbanSquare,
  Target,
  Users,
  Calendar,
  Award,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  AlertCircle,
  FileText,
} from 'lucide-react';

export type AppRoute =
  | 'home'
  | 'courses'
  | 'workboard'
  | 'assessment'
  | 'faculty'
  | 'assignments'
  | 'calendar'
  | 'accreditation'
  | 'reports'
  | 'advising'
  | 'credentials'
  | 'improvement'
  | 'imports'
  | 'settings';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
  const { currentRole, tasks, activeProgramId, advisees, improvements } = useData();

  const programTasks = (tasks || []).filter(t => t['Program ID'] === activeProgramId && t.Archived !== true && t.Archived !== 'true');
  const overdueCount = programTasks.filter(t => {
    if (!t['Due Date']) return false;
    return new Date(t['Due Date']) < new Date() && t.Status !== 'COMPLETE';
  }).length;

  const openImprovements = (improvements || []).filter(
    i => i['Program ID'] === activeProgramId && i.Status !== 'Complete' && i.Status !== 'Resolved'
  ).length;

  const atRiskAdvisees = (advisees || []).filter(
    a => a['Program ID'] === activeProgramId && (a['Risk Flag']?.toLowerCase().includes('alert') || a['Risk Flag']?.toLowerCase().includes('risk'))
  ).length;

  const navItems = [
    {
      group: 'Core Operations',
      items: [
        { id: 'home', label: 'Program Health', icon: LayoutDashboard },
        { id: 'courses', label: 'Course Catalog', icon: BookOpen },
        {
          id: 'workboard',
          label: 'Work Board',
          icon: KanbanSquare,
          badge: overdueCount > 0 ? `${overdueCount} overdue` : undefined,
          badgeColor: 'bg-rose-500/10 text-rose-600 border border-rose-200',
        },
        { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
        { id: 'assignments', label: 'Course Assignments', icon: FileText },
      ],
    },
    {
      group: 'Academic & Assessment',
      items: [
        { id: 'assessment', label: 'Assessment Center', icon: Target },
        { id: 'faculty', label: 'Faculty & Workload', icon: Users },
        {
          id: 'advising',
          label: 'Students & Advising',
          icon: GraduationCap,
          badge: atRiskAdvisees > 0 ? `${atRiskAdvisees} alert` : undefined,
          badgeColor: 'bg-amber-500/10 text-amber-700 border border-amber-200',
        },
        { id: 'credentials', label: 'Industry Credentials', icon: Award },
      ],
    },
    {
      group: 'Quality & Governance',
      items: [
        { id: 'reports', label: 'HLC Assurance Reports', icon: FileText },
        { id: 'accreditation', label: 'Accreditation Evidence', icon: ShieldCheck },
        {
          id: 'improvement',
          label: 'Continuous Improvement',
          icon: TrendingUp,
          badge: openImprovements > 0 ? `${openImprovements} open` : undefined,
          badgeColor: 'bg-blue-500/10 text-blue-700 border border-blue-200',
        },
        { id: 'imports', label: 'Import & CSV Center', icon: FileSpreadsheet },
        { id: 'settings', label: 'Program Features', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-53px)] flex flex-col justify-between select-none">
      <div className="py-4 px-3 space-y-6">
        {navItems.map(group => (
          <div key={group.group}>
            <div className="px-3 pb-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-600">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as AppRoute)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition text-left ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full whitespace-nowrap ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Role notice footer */}
      <div className="p-3 m-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
          <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
          <span>Active Role: {currentRole}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Direct Google Sheets REST integration without Apps Script latency or cold starts.
        </p>
      </div>
    </aside>
  );
};
