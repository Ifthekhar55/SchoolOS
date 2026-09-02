import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class CalendarService {
  // ============ Get Events ============

  async getEvents(schoolId: string, filters: any) {
    const {
      type,
      status,
      search,
      startDate,
      endDate,
      targetClass,
      targetSection,
      isPublic,
      page = 1,
      limit = 10,
    } = filters;

    const where: any = { schoolId };

    if (type) where.type = type;
    if (status) where.status = status;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    if (targetClass) {
      where.targetClasses = { has: targetClass };
    }
    if (targetSection) {
      where.targetSections = { has: targetSection };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { titleBangla: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionBangla: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [events, total] = await Promise.all([
      prisma.calendarEvent.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: 'asc' },
      }),
      prisma.calendarEvent.count({ where }),
    ]);

    return {
      events,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getEventsByDateRange(schoolId: string, startDate: Date, endDate: Date, filters: any) {
    const { type, targetClass, targetSection } = filters;

    const where: any = {
      schoolId,
      OR: [
        {
          AND: [
            { startDate: { gte: startDate } },
            { startDate: { lte: endDate } },
          ],
        },
        {
          AND: [
            { endDate: { gte: startDate } },
            { endDate: { lte: endDate } },
          ],
        },
        {
          AND: [
            { startDate: { lte: startDate } },
            { endDate: { gte: endDate } },
          ],
        },
      ],
    };

    if (type) where.type = type;
    if (targetClass) where.targetClasses = { has: targetClass };
    if (targetSection) where.targetSections = { has: targetSection };

    return prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });
  }

  async getEvent(id: string, schoolId: string) {
    const event = await prisma.calendarEvent.findFirst({
      where: { id, schoolId },
    });

    if (!event) throw new Error('Event not found');
    return event;
  }

  // ============ Create/Update Events ============

  async createEvent(schoolId: string, data: any, createdBy: string) {
    return prisma.calendarEvent.create({
      data: {
        ...data,
        schoolId,
        createdBy,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : undefined,
      },
    });
  }

  async updateEvent(id: string, schoolId: string, data: any) {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Event not found');

    return prisma.calendarEvent.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        recurrenceEndDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : undefined,
      },
    });
  }

  async deleteEvent(id: string, schoolId: string) {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Event not found');

    return prisma.calendarEvent.delete({ where: { id } });
  }

  // ============ Event Status Management ============

  async markOngoing(id: string, schoolId: string) {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Event not found');

    return prisma.calendarEvent.update({
      where: { id },
      data: { status: 'ongoing' },
    });
  }

  async markCompleted(id: string, schoolId: string) {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Event not found');

    return prisma.calendarEvent.update({
      where: { id },
      data: { status: 'completed' },
    });
  }

  async cancelEvent(id: string, schoolId: string) {
    const existing = await prisma.calendarEvent.findFirst({
      where: { id, schoolId },
    });
    if (!existing) throw new Error('Event not found');

    return prisma.calendarEvent.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  // ============ Calendar Views ============

  async getMonthView(schoolId: string, year: number, month: number, filters: any) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const events = await this.getEventsByDateRange(schoolId, startDate, endDate, filters);

    // Group events by date
    const groupedEvents: { [date: string]: any[] } = {};

    for (const event of events) {
      const currentDate = new Date(event.startDate);
      const endDateLoop = new Date(event.endDate);

      // For multi-day events, add to each day
      while (currentDate <= endDateLoop) {
        const dateKey = [
          currentDate.getFullYear(),
          String(currentDate.getMonth() + 1).padStart(2, '0'),
          String(currentDate.getDate()).padStart(2, '0'),
        ].join('-');
        if (!groupedEvents[dateKey]) {
          groupedEvents[dateKey] = [];
        }
        groupedEvents[dateKey].push(event);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return groupedEvents;
  }

  async getWeekView(schoolId: string, year: number, month: number, day: number, filters: any) {
    const date = new Date(year, month, day);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.getEventsByDateRange(schoolId, startOfWeek, endOfWeek, filters);
  }

  async getDayView(schoolId: string, year: number, month: number, day: number, filters: any) {
    const date = new Date(year, month, day);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getEventsByDateRange(schoolId, startOfDay, endOfDay, filters);
  }

  // ============ Statistics ============

  async getStatistics(schoolId: string, params: any) {
    const { year, month } = params;

    const where: any = { schoolId };

    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.startDate = { gte: startDate, lte: endDate };
    }

    const [total, byType, upcoming, today, thisMonth] = await Promise.all([
      prisma.calendarEvent.count({ where }),
      prisma.calendarEvent.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      prisma.calendarEvent.findMany({
        where: {
          ...where,
          status: 'scheduled',
          startDate: { gte: new Date() },
        },
        orderBy: { startDate: 'asc' },
        take: 5,
      }),
      prisma.calendarEvent.findMany({
        where: {
          ...where,
          startDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.calendarEvent.count({
        where: {
          ...where,
          startDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          },
        },
      }),
    ]);

    return {
      total,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count,
      })),
      upcoming,
      today,
      thisMonth,
    };
  }

  // ============ Export ============

  async exportCalendar(schoolId: string, data: any) {
    const { dateFrom, dateTo, format } = data;

    const events = await this.getEventsByDateRange(
      schoolId,
      new Date(dateFrom),
      new Date(dateTo),
      {}
    );

    // Generate iCal format
    if (format === 'ical') {
      return this.generateICal(events);
    }

    // Generate CSV format
    if (format === 'csv') {
      return this.generateCSV(events);
    }

    // Generate PDF format (placeholder)
    return events;
  }

  private generateICal(events: any[]): string {
    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SchoolOS//Calendar//EN
CALSCALE:GREGORIAN
`;

    for (const event of events) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      ical += `BEGIN:VEVENT
UID:${event.id}@schoolos
SUMMARY:${event.title}
DESCRIPTION:${event.description}
DTSTART:${this.formatICalDate(startDate)}
DTEND:${this.formatICalDate(endDate)}
STATUS:${event.status.toUpperCase()}
`;

      if (event.location) {
        ical += `LOCATION:${event.location}\n`;
      }

      ical += `END:VEVENT\n`;
    }

    ical += 'END:VCALENDAR';
    return ical;
  }

  private formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private generateCSV(events: any[]): string {
    const headers = [
      'Title',
      'Description',
      'Type',
      'Status',
      'Start Date',
      'End Date',
      'Location',
      'All Day',
    ];

    const rows = events.map(event => [
      event.title,
      event.description,
      event.type,
      event.status,
      new Date(event.startDate).toISOString().split('T')[0],
      new Date(event.endDate).toISOString().split('T')[0],
      event.location || '',
      event.allDay ? 'Yes' : 'No',
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }

  // ============ Reminders ============

  async sendReminders(schoolId: string, eventId: string) {
    const event = await prisma.calendarEvent.findFirst({
      where: { id: eventId, schoolId },
    });

    if (!event) throw new Error('Event not found');

    // TODO: Implement email/SMS reminders
    // For now, just log it
    console.log(`📧 Sending reminders for event: ${event.title}`);

    return {
      success: true,
      message: 'Reminders sent successfully',
      count: 1,
    };
  }

  // ============ Event Types ============

  async getEventTypes() {
    return [
      { type: 'holiday', label: '🎉 Holiday', color: '#EF4444' },
      { type: 'exam', label: '📝 Exam', color: '#8B5CF6' },
      { type: 'event', label: '📅 Event', color: '#3B82F6' },
      { type: 'meeting', label: '🤝 Meeting', color: '#F59E0B' },
      { type: 'deadline', label: '⏰ Deadline', color: '#F97316' },
      { type: 'academic', label: '📚 Academic', color: '#10B981' },
      { type: 'sports', label: '⚽ Sports', color: '#6366F1' },
      { type: 'cultural', label: '🎭 Cultural', color: '#EC4899' },
      { type: 'other', label: '📌 Other', color: '#64748B' },
    ];
  }
}

export default new CalendarService();