import { api } from './api';
import {
  CalendarEvent,
  CreateEventData,
  UpdateEventData,
  EventFilters,
  CalendarView,
  CalendarStatistics,
  ExportCalendarData,
  EventType,
} from '../types/calendar';

class CalendarApiService {
  // ============ Events ============

  async getEvents(filters?: EventFilters): Promise<{ events: CalendarEvent[]; total: number; page: number; limit: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<any>(`/calendar/events?${params.toString()}`);
  }

  async getEventsByDateRange(startDate: Date, endDate: Date, filters?: EventFilters): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    params.append('startDate', startDate.toISOString().split('T')[0]);
    params.append('endDate', endDate.toISOString().split('T')[0]);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<CalendarEvent[]>(`/calendar/events/range?${params.toString()}`);
  }

  async getEvent(id: string): Promise<CalendarEvent> {
    return api.request<CalendarEvent>(`/calendar/events/${id}`);
  }

  async createEvent(data: CreateEventData): Promise<CalendarEvent> {
    const response = await api.request<{ event: CalendarEvent }>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.event;
  }

  async updateEvent(id: string, data: UpdateEventData): Promise<CalendarEvent> {
    return api.request<CalendarEvent>(`/calendar/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return api.request<void>(`/calendar/events/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Event Status ============

  async markOngoing(id: string): Promise<CalendarEvent> {
    return api.request<CalendarEvent>(`/calendar/events/${id}/ongoing`, {
      method: 'POST',
    });
  }

  async markCompleted(id: string): Promise<CalendarEvent> {
    return api.request<CalendarEvent>(`/calendar/events/${id}/completed`, {
      method: 'POST',
    });
  }

  async cancelEvent(id: string): Promise<CalendarEvent> {
    return api.request<CalendarEvent>(`/calendar/events/${id}/cancel`, {
      method: 'POST',
    });
  }

  // ============ Calendar Views ============

  async getMonthView(year: number, month: number, filters?: EventFilters): Promise<{ [date: string]: CalendarEvent[] }> {
    const params = new URLSearchParams();
    params.append('year', String(year));
    params.append('month', String(month));
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.request<{ events: { [date: string]: CalendarEvent[] } }>(
      `/calendar/view/month?${params.toString()}`
    );
    return response.events;
  }

  async getWeekView(year: number, month: number, day: number, filters?: EventFilters): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    params.append('year', String(year));
    params.append('month', String(month));
    params.append('day', String(day));
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return api.request<CalendarEvent[]>(`/calendar/view/week?${params.toString()}`);
  }

  async getDayView(year: number, month: number, day: number, filters?: EventFilters): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    params.append('year', String(year));
    params.append('month', String(month));
    params.append('day', String(day));
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.request<{ events: CalendarEvent[] }>(
      `/calendar/view/day?${params.toString()}`
    );
    return response.events;
  }

  // ============ Statistics ============

  async getStatistics(params?: { year?: number; month?: number }): Promise<CalendarStatistics> {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', String(params.year));
    if (params?.month) queryParams.append('month', String(params.month));
    return api.request<CalendarStatistics>(`/calendar/statistics?${queryParams.toString()}`);
  }

  // ============ Export ============

  async exportCalendar(data: ExportCalendarData): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/calendar/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return response.blob();
  }

  // ============ Reminders ============

  async sendReminders(eventId: string): Promise<{ success: boolean; message: string; count: number }> {
    return api.request<{ success: boolean; message: string; count: number }>(`/calendar/events/${eventId}/reminders`, {
      method: 'POST',
    });
  }

  // ============ Types/Colors ============

  async getEventTypes(): Promise<{ type: EventType; label: string; color: string }[]> {
    return api.request<{ type: EventType; label: string; color: string }[]>('/calendar/types');
  }
}

export const calendarApi = new CalendarApiService();