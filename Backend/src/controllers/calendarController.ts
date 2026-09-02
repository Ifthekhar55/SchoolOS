import { Request, Response } from 'express';
import CalendarService from '../services/calendarService';

export class CalendarController {
  // ============ Get Events ============

  async getEvents(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const filters = req.query;

      const result = await CalendarService.getEvents(schoolId!, filters);

      return res.status(200).json({
        ...result,
      });
    } catch (error) {
      console.error('Get events error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
      });
    }
  }

  async getEventsByDateRange(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { startDate, endDate } = req.query;
      const filters = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const events = await CalendarService.getEventsByDateRange(
        schoolId!,
        new Date(startDate as string),
        new Date(endDate as string),
        filters
      );

      return res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      console.error('Get events by date range error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
      });
    }
  }

  async getEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const event = await CalendarService.getEvent(id, schoolId!);

      return res.status(200).json({
        success: true,
        event,
      });
    } catch (error: any) {
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Get event error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
      });
    }
  }

  // ============ Create/Update Events ============

  async createEvent(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const data = req.body;
      const createdBy = req.user?.userId;

      const event = await CalendarService.createEvent(schoolId!, data, createdBy!);

      return res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event,
      });
    } catch (error) {
      console.error('Create event error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create event',
      });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;
      const data = req.body;

      const event = await CalendarService.updateEvent(id, schoolId!, data);

      return res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        event,
      });
    } catch (error: any) {
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Update event error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update event',
      });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      await CalendarService.deleteEvent(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Delete event error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete event',
      });
    }
  }

  // ============ Event Status Management ============

  async markOngoing(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const event = await CalendarService.markOngoing(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Event marked as ongoing',
        event,
      });
    } catch (error: any) {
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Mark ongoing error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark event as ongoing',
      });
    }
  }

  async markCompleted(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const event = await CalendarService.markCompleted(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Event marked as completed',
        event,
      });
    } catch (error: any) {
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Mark completed error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark event as completed',
      });
    }
  }

  async cancelEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const event = await CalendarService.cancelEvent(id, schoolId!);

      return res.status(200).json({
        success: true,
        message: 'Event cancelled successfully',
        event,
      });
    } catch (error: any) {
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Cancel event error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel event',
      });
    }
  }

  // ============ Calendar Views ============

  async getMonthView(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { year, month } = req.query;
      const filters = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          message: 'Year and month are required',
        });
      }

      const events = await CalendarService.getMonthView(
        schoolId!,
        parseInt(year as string),
        parseInt(month as string) - 1,
        filters
      );

      return res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      console.error('Get month view error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get month view',
      });
    }
  }

  async getWeekView(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { year, month, day } = req.query;
      const filters = req.query;

      if (!year || !month || !day) {
        return res.status(400).json({
          success: false,
          message: 'Year, month, and day are required',
        });
      }

      const events = await CalendarService.getWeekView(
        schoolId!,
        parseInt(year as string),
        parseInt(month as string) - 1,
        parseInt(day as string),
        filters
      );

      return res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      console.error('Get week view error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get week view',
      });
    }
  }

  async getDayView(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { year, month, day } = req.query;
      const filters = req.query;

      if (!year || !month || !day) {
        return res.status(400).json({
          success: false,
          message: 'Year, month, and day are required',
        });
      }

      const events = await CalendarService.getDayView(
        schoolId!,
        parseInt(year as string),
        parseInt(month as string) - 1,
        parseInt(day as string),
        filters
      );

      return res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      console.error('Get day view error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get day view',
      });
    }
  }

  // ============ Statistics ============

  async getStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { year, month } = req.query;

      const statistics = await CalendarService.getStatistics(schoolId!, {
        year: year ? parseInt(year as string) : undefined,
        month: month ? parseInt(month as string) : undefined,
      });

      return res.status(200).json({
        success: true,
        statistics,
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
      });
    }
  }

  // ============ Export ============

  async exportCalendar(req: Request, res: Response) {
    try {
      const { schoolId } = req;
      const { dateFrom, dateTo, format } = req.body;

      if (!dateFrom || !dateTo) {
        return res.status(400).json({
          success: false,
          message: 'Date from and date to are required',
        });
      }

      const result = await CalendarService.exportCalendar(schoolId!, {
        dateFrom,
        dateTo,
        format: format || 'csv',
      });

      if (format === 'ical') {
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', 'attachment; filename=calendar.ics');
        return res.send(result);
      }

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=calendar_${Date.now()}.csv`);
        return res.send(result);
      }

      return res.status(200).json({
        success: true,
        events: result,
      });
    } catch (error) {
      console.error('Export calendar error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to export calendar',
      });
    }
  }

  // ============ Reminders ============

  async sendReminders(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const result = await CalendarService.sendReminders(schoolId!, id);

      return res.status(200).json({
        ...result,
      });
    } catch (error: any) {
      if (error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      console.error('Send reminders error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reminders',
      });
    }
  }

  // ============ Event Types ============

  async getEventTypes(req: Request, res: Response) {
    try {
      const types = await CalendarService.getEventTypes();

      return res.status(200).json({
        success: true,
        types,
      });
    } catch (error) {
      console.error('Get event types error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch event types',
      });
    }
  }
}

export default new CalendarController();