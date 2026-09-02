import React from 'react';
import { CalendarEvent } from '../../types/calendar';

interface EventDetailsProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose, onEdit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={event => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
          <p className="mt-1 text-sm capitalize text-slate-500">{event.type} · {event.status}</p>
        </div>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900" aria-label="Close">Close</button>
      </div>
      <p className="mt-5 text-sm text-slate-700">{event.description}</p>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-slate-500">Starts</dt><dd className="font-medium text-slate-900">{new Date(event.startDate).toLocaleString()}</dd></div>
        <div><dt className="text-slate-500">Ends</dt><dd className="font-medium text-slate-900">{new Date(event.endDate).toLocaleString()}</dd></div>
        {event.location && <div><dt className="text-slate-500">Location</dt><dd className="font-medium text-slate-900">{event.location}</dd></div>}
      </dl>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">Close</button>
        <button type="button" onClick={onEdit} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Edit event</button>
      </div>
    </div>
  </div>
);
