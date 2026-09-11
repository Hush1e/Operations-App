import React, { useState } from 'react';
import { useData } from '../services/dataContext';
import { CalendarEventRecord } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Tag,
  MapPin,
  Filter,
} from 'lucide-react';

interface AcademicCalendarProps {
  onOpenRecordModal: (module: string, record?: any, prefill?: any) => void;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ onOpenRecordModal }) => {
  const { activeProgramId, calendarEvents } = useData();

  const [viewMode, setViewMode] = useState<'MONTH' | 'AGENDA'>('MONTH');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const visibleEvents = calendarEvents.filter(
    e =>
      (e.Scope === 'GLOBAL' || e['Program ID'] === activeProgramId) &&
      e.Status !== 'Cancelled' &&
      e.Status !== 'Deleted'
  );

  const categories = Array.from(new Set(visibleEvents.map(e => e.Category).filter(Boolean)));

  const filteredEvents = visibleEvents.filter(e => {
    if (categoryFilter !== 'ALL' && e.Category !== categoryFilter) return false;
    return true;
  });

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get events on date
  const getEventsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(e => {
      const start = e['Start Date']?.slice(0, 10);
      const end = (e['End Date'] || e['Start Date'])?.slice(0, 10);
      return dayStr >= start && dayStr <= end;
    });
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            <span>Academic & Operations Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional term boundaries, census deadlines, grading milestones, and advisory meetings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onOpenRecordModal('calendar', null, {
                'Program ID': activeProgramId,
                Scope: 'Program',
                Status: 'Active',
                'Start Date': new Date().toISOString().split('T')[0],
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Toolbar with Month Navigation and View Toggle */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-slate-800 min-w-[140px] text-center">{monthName}</span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold ml-1"
          >
            Today
          </button>
        </div>

        {/* Filters and View mode */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                viewMode === 'MONTH' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('AGENDA')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                viewMode === 'AGENDA' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Agenda
            </button>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'MONTH' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2 text-xs font-bold text-slate-600">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
            {/* Empty boxes for leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/50 p-1.5 min-h-[90px]" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${day}`}
                  className={`p-1.5 min-h-[95px] flex flex-col justify-between transition hover:bg-slate-50/70 ${
                    isToday ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev, evIdx) => (
                      <div
                        key={ev['Calendar ID'] || `ev-${day}-${evIdx}`}
                        onClick={() => onOpenRecordModal('calendar', ev)}
                        className="text-[10px] font-semibold p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-900 truncate cursor-pointer border border-indigo-200/60 shadow-2xs"
                        title={ev.Title}
                      >
                        {ev.Title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-medium pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA VIEW */}
      {viewMode === 'AGENDA' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No scheduled events match the current filter.</div>
          ) : (
            filteredEvents
              .sort((a, b) => (a['Start Date'] || '').localeCompare(b['Start Date'] || ''))
              .map((ev, evIdx) => (
                <div
                  key={ev['Calendar ID'] || `agenda-${evIdx}`}
                  onClick={() => onOpenRecordModal('calendar', ev)}
                  className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{ev.Title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {ev.Category}
                      </span>
                      {ev.Scope === 'GLOBAL' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Institutional Global
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 max-w-2xl">{ev.Description || 'No description provided.'}</p>
                  </div>

                  <div className="text-right text-xs text-slate-600 shrink-0 font-medium">
                    <div>{ev['Start Date']}</div>
                    {ev['End Date'] && ev['End Date'] !== ev['Start Date'] && (
                      <div className="text-[11px] text-slate-400">thru {ev['End Date']}</div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};
