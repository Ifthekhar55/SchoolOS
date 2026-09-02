export type EventType = 
  | 'holiday'
  | 'exam'
  | 'event'
  | 'meeting'
  | 'deadline'
  | 'academic'
  | 'sports'
  | 'cultural'
  | 'other';

export type EventStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type RecurrencePattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'none';

export interface CalendarEvent {
  id: string;
  schoolId: string;
  title: string;
  titleBangla?: string;
  description: string;
  descriptionBangla?: string;
  type: EventType;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  location?: string;
  recurrence: RecurrencePattern;
  recurrenceEndDate?: Date;
  recurrenceDays?: number[]; // 0-6 for weekly recurrence
  targetClasses?: string[];
  targetSections?: string[];
  targetTeachers?: string[];
  color: string;
  isPublic: boolean;
  createdBy: string;
  createdByName?: string;
  attachments?: string[];
  reminder: boolean;
  reminderMinutes?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventData {
  title: string;
  titleBangla?: string;
  description: string;
  descriptionBangla?: string;
  type: EventType;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  location?: string;
  recurrence?: RecurrencePattern;
  recurrenceEndDate?: Date;
  recurrenceDays?: number[];
  targetClasses?: string[];
  targetSections?: string[];
  targetTeachers?: string[];
  color?: string;
  isPublic?: boolean;
  reminder?: boolean;
  reminderMinutes?: number;
  notes?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface EventFilters {
  type?: EventType;
  status?: EventStatus;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  targetClass?: string;
  targetSection?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
}

export interface CalendarView {
  view: 'month' | 'week' | 'day' | 'list';
  date: Date;
}

export interface DayEvents {
  date: Date;
  events: CalendarEvent[];
}

export interface CalendarStatistics {
  total: number;
  byType: Array<{ type: EventType; count: number }>;
  upcoming: CalendarEvent[];
  today: CalendarEvent[];
  thisMonth: number;
}

export interface ExportCalendarData {
  events: CalendarEvent[];
  dateFrom: Date;
  dateTo: Date;
  format: 'ical' | 'csv' | 'pdf';
}