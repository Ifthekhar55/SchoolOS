import { Router } from 'express';
import ParentController from '../controllers/parentController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication and parent role
router.use(authenticate);
router.use(tenantMiddleware);
router.use(authorize('parent'));

// ============ Dashboard ============
router.get('/dashboard', ParentController.getDashboard);

// ============ Children ============
router.get('/children', ParentController.getChildren);
router.get('/children/:id', ParentController.getChild);

// ============ Attendance ============
router.get('/children/:childId/attendance', ParentController.getChildAttendance);
router.get('/children/:childId/attendance-summary', ParentController.getAttendanceSummary);

// ============ Fees ============
router.get('/children/:childId/fees', ParentController.getChildFees);
router.get('/children/:childId/fee-summary', ParentController.getFeeSummary);

// ============ Results ============
router.get('/children/:childId/results', ParentController.getChildResults);
router.get('/children/:childId/results/:examId', ParentController.getChildResult);

// ============ Teachers ============
router.get('/children/:childId/teachers', ParentController.getChildTeachers);

// ============ Reports ============
router.get('/children/:childId/report', ParentController.getChildReport);

// ============ Payments ============
router.post('/payments', ParentController.makePayment);
router.post('/payments/online/initiate', ParentController.initiateOnlinePayment);

// ============ Notices ============
router.get('/notices', ParentController.getNotices);
router.get('/notices/:id', ParentController.getNotice);

// ============ Messages ============
router.get('/messages', ParentController.getMessages);
router.post('/messages', ParentController.sendMessage);
router.post('/messages/:id/read', ParentController.markMessageAsRead);
router.delete('/messages/:id', ParentController.deleteMessage);

// ============ Teacher Messages ============
router.post('/teacher-messages', ParentController.sendTeacherMessage);

// ============ Profile ============
router.get('/profile', ParentController.getProfile);
router.put('/profile', ParentController.updateProfile);

export default router;