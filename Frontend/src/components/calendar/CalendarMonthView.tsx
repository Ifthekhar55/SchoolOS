import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  MapPin,
} from 'lucide-react';
import { CalendarEvent, EventType } from '../../types/calendar';
import { calendarApi } from '../../services/calendarApi';
import { usePermissions } from '../../hooks/usePermissions';

interface CalendarMonthViewProps {
  year: number;
  month: number;
  onEventClick: (event: CalendarEvent) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (id: string) => void;
  onDateClick: (date: Date) => void;
  onAddEvent: (date: Date) => void;
  filters?: any;
}

const eventColors: Record<EventType, string> = {
  holiday: 'bg-red-100 border-red-300 text-red-700',
  exam: 'bg-purple-100 border-purple-300 text-purple-700',
  event: 'bg-blue-100 border-blue-300 text-blue-700',
  meeting: 'bg-amber-100 border-amber-300 text-amber-700',
  deadline: 'bg-orange-100 border-orange-300 text-orange-700',
  academic: 'bg-green-100 border-green-300 text-green-700',
  sports: 'bg-indigo-100 border-indigo-300 text-indigo-700',
  cultural: 'bg-pink-100 border-pink-300 text-pink-700',
  other: 'bg-slate-100 border-slate-300 text-slate-700',
};

const eventTypeLabels: Record<EventType, string> = {
  holiday: '🎉 Holiday',
  exam: '📝 Exam',
  event: '📅 Event',
  meeting: '🤝 Meeting',
  deadline: '⏰ Deadline',
  academic: '📚 Academic',
  sports: '⚽ Sports',
  cultural: '🎭 Cultural',
  other: '📌 Other',
};

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  year,
  month,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onDateClick,
  onAddEvent,
  filters,
}) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<{ [date: string]: CalendarEvent[] }>({});
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);

  useEffect(() => {
    loadEvents();
  }, [currentYear, currentMonth, filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarApi.getMonthView(currentYear, currentMonth, filters);
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getEventsForDate = (date: number) => {
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events[key] || [];
  };

  const isToday = (date: number) => {
    return date === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={handleToday}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold uppercase text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50 p-1" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const date = i + 1;
                const dayEvents = getEventsForDate(date);
                const isCurrentDay = isToday(date);

                return (
                  <div
                    key={date}
                    className={`min-h-[100px] border-b border-r border-slate-100 p-1 hover:bg-slate-50 transition-colors cursor-pointer ${
                      isCurrentDay ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      const clickDate = new Date(currentYear, currentMonth, date);
                      onDateClick(clickDate);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          isCurrentDay ? 'text-blue-600' : 'text-slate-700'
                        }`}
                      >
                        {date}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const clickDate = new Date(currentYear, currentMonth, date);
                          onAddEvent(clickDate);
                        }}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className={`rounded-md border px-1.5 py-0.5 text-xs truncate cursor-pointer ${eventColors[event.type] || eventColors.other}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-slate-400">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-3">
        {Object.entries(eventTypeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${eventColors[type as EventType]?.split(' ')[0] || 'bg-slate-200'}`} />
            <span className="text-xs text-slate-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};