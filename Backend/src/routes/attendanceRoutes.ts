import { Router } from 'express';
import AttendanceController from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// ============ Helper Routes (must come before dynamic routes) ============
router.get('/summary', AttendanceController.getAttendanceSummary);
router.get('/statistics', AttendanceController.getAttendanceStatistics);
router.get('/export', AttendanceController.exportAttendance);
router.get('/holidays', AttendanceController.getHolidays);
router.post('/holidays', authorize('school_admin'), AttendanceController.createHoliday);
router.delete('/holidays/:id', authorize('school_admin'), AttendanceController.deleteHoliday);

// ============ Notifications ============
router.post('/notify-absent', authorize('school_admin', 'teacher'), AttendanceController.notifyAbsentStudent);
router.post('/notify-absent-bulk', authorize('school_admin', 'teacher'), AttendanceController.notifyBulkAbsent);

// ============ QR/Biometric ============
router.post('/scan-qr', AttendanceController.scanQR);
router.post('/verify-biometric', AttendanceController.verifyBiometric);

// ============ Main Attendance Routes ============
router.get('/', AttendanceController.getAttendance);
router.post('/mark', authorize('school_admin', 'teacher'), AttendanceController.markAttendance);
router.post('/bulk', authorize('school_admin', 'teacher'), AttendanceController.markBulkAttendance);

// ============ Class/Section/Student Specific ============
router.get('/class/:classId/section/:sectionId/date/:date', AttendanceController.getClassAttendance);
router.get('/student/:studentId', AttendanceController.getStudentAttendance);

// ============ Single Record Update ============
router.put('/:id', authorize('school_admin', 'teacher'), AttendanceController.updateAttendance);

export default router;