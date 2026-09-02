import { Router } from 'express';
import ReportController from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// ============ Public/Helper Routes (must come before /:id) ============
router.get('/types', ReportController.getReportTypes);
router.get('/templates', ReportController.getReportTemplates);
router.get('/dashboard-analytics', ReportController.getDashboardAnalytics);
router.post('/from-template', authorize('school_admin'), ReportController.createFromTemplate);

// ============ Auto-Generate Reports ============
router.post('/attendance', authorize('school_admin'), ReportController.generateAttendanceReport);
router.post('/fee', authorize('school_admin'), ReportController.generateFeeReport);
router.post('/exam', authorize('school_admin'), ReportController.generateExamReport);
router.post('/student', authorize('school_admin'), ReportController.generateStudentReport);
router.post('/teacher', authorize('school_admin'), ReportController.generateTeacherReport);
router.post('/class', authorize('school_admin'), ReportController.generateClassReport);

// ============ Generate Custom Reports ============
router.post('/generate-custom', authorize('school_admin'), ReportController.generateCustomReport);

// ============ Report CRUD ============
router.get('/', ReportController.getReports);
router.post('/', authorize('school_admin'), ReportController.createReport);
router.get('/:id', ReportController.getReport);
router.put('/:id', authorize('school_admin'), ReportController.updateReport);
router.delete('/:id', authorize('school_admin'), ReportController.deleteReport);

// ============ Generate & Download ============
router.post('/:id/generate', authorize('school_admin'), ReportController.generateReport);
router.get('/:id/download', ReportController.downloadReport);

// ============ Scheduling ============
router.post('/:id/schedule', authorize('school_admin'), ReportController.scheduleReport);
router.post('/:id/unschedule', authorize('school_admin'), ReportController.unscheduleReport);

export default router;