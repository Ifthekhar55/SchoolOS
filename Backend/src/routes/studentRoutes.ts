import { Router } from 'express';
import StudentController from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// Student routes
router.get('/', StudentController.getStudents);
router.get('/statistics', StudentController.getStatistics);
router.get('/export', StudentController.exportStudents);
router.get('/class/:classId', StudentController.getStudentsByClass);

router.post('/', authorize('school_admin', 'teacher'), StudentController.createStudent);
router.post('/import', authorize('school_admin'), StudentController.importStudents);
router.post('/bulk-delete', authorize('school_admin'), StudentController.bulkDelete);

router.get('/:id', StudentController.getStudent);
router.get('/:id/login-account', StudentController.getStudentLoginAccount);
router.post('/:id/reset-password', authorize('school_admin'), StudentController.resetStudentPassword);
router.put('/:id', authorize('school_admin', 'teacher'), StudentController.updateStudent);
router.delete('/:id', authorize('school_admin'), StudentController.deleteStudent);
router.post('/:id/activate', authorize('school_admin'), StudentController.activateStudent);
router.post('/:id/deactivate', authorize('school_admin'), StudentController.deactivateStudent);

export default router;