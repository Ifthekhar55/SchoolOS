import React, { useEffect, useState } from 'react';
import { CalendarEvent } from '../../types/calendar';
import { calendarApi } from '../../services/calendarApi';

interface EventListProps {
  onEdit: (event: CalendarEvent) => void;
  onView: (event: CalendarEvent) => void;
  onCreate: () => void;
}

export const EventList: React.FC<EventListProps> = ({ onEdit, onView, onCreate }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    calendarApi.getEvents({ page: 1, limit: 50 }).then(response => setEvents(response.events)).catch(error => console.error('Failed to load events:', error));
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Events</h2>
        <button type="button" onClick={onCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Add event</button>
      </div>
      {events.length === 0 ? <p className="text-sm text-slate-500">No events found.</p> : (
        <div className="divide-y divide-slate-100">
          {events.map(event => (
            <div key={event.id} className="flex items-center justify-between gap-4 py-3">
              <button type="button" onClick={() => onView(event)} className="text-left">
                <p className="font-medium text-slate-900">{event.title}</p>
                <p className="text-sm text-slate-500">{new Date(event.startDate).toLocaleDateString()} · {event.type}</p>
              </button>
              <button type="button" onClick={() => onEdit(event)} className="text-sm font-medium text-blue-600 hover:text-blue-700">Edit</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
