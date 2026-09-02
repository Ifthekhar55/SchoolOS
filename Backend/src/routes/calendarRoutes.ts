import { Router } from 'express';
import CalendarController from '../controllers/calendarController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// ============ Public/Helper Routes (must come before /:id) ============
router.get('/types', CalendarController.getEventTypes);
router.get('/statistics', CalendarController.getStatistics);

// ============ Calendar Views ============
router.get('/view/month', CalendarController.getMonthView);
router.get('/view/week', CalendarController.getWeekView);
router.get('/view/day', CalendarController.getDayView);

// ============ Events by Range ============
router.get('/events/range', CalendarController.getEventsByDateRange);

// ============ Export ============
router.post('/export', CalendarController.exportCalendar);

// ============ Event CRUD ============
router.get('/events', CalendarController.getEvents);
router.post('/events', authorize('school_admin', 'teacher'), CalendarController.createEvent);
router.get('/events/:id', CalendarController.getEvent);
router.put('/events/:id', authorize('school_admin', 'teacher'), CalendarController.updateEvent);
router.delete('/events/:id', authorize('school_admin'), CalendarController.deleteEvent);

// ============ Event Status Management ============
router.post('/events/:id/ongoing', authorize('school_admin'), CalendarController.markOngoing);
router.post('/events/:id/completed', authorize('school_admin'), CalendarController.markCompleted);
router.post('/events/:id/cancel', authorize('school_admin'), CalendarController.cancelEvent);

// ============ Reminders ============
router.post('/events/:id/reminders', authorize('school_admin'), CalendarController.sendReminders);

export default router;