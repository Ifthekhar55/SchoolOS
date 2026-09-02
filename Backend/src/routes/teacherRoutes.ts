import { Router } from 'express';
import TeacherController from '../controllers/teacherController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// Public routes (within school context)
router.get('/my-classes', TeacherController.getMyClasses);
router.get('/available', TeacherController.getAvailableTeachers);
router.get('/statistics', TeacherController.getStatistics);
router.get('/export', TeacherController.exportTeachers);
router.get('/department/:department', TeacherController.getTeachersByDepartment);

// Main CRUD routes
router.get('/', TeacherController.getTeachers);
router.post('/', authorize('school_admin'), TeacherController.createTeacher);
router.post('/import', authorize('school_admin'), TeacherController.importTeachers);
router.post('/bulk-delete', authorize('school_admin'), TeacherController.bulkDelete);

// Individual teacher routes
router.get('/:id/classes', TeacherController.getTeacherClasses);
router.get('/:id', TeacherController.getTeacher);
router.put('/:id', authorize('school_admin'), TeacherController.updateTeacher);
router.delete('/:id', authorize('school_admin'), TeacherController.deleteTeacher);
router.post('/:id/activate', authorize('school_admin'), TeacherController.activateTeacher);
router.post('/:id/deactivate', authorize('school_admin'), TeacherController.deactivateTeacher);

export default router;