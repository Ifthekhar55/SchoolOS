import { Router } from 'express';
import StudentController from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { idParamsSchema, resetPasswordSchema } from '../schemas/common';

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
router.post('/:id/reset-password', authorize('school_admin'), validate({ params: idParamsSchema, body: resetPasswordSchema }), StudentController.resetStudentPassword);
router.put('/:id', authorize('school_admin', 'teacher'), validate({ params: idParamsSchema, body: z.object({}).passthrough() }), StudentController.updateStudent);
router.delete('/:id', authorize('school_admin'), validate({ params: idParamsSchema }), StudentController.deleteStudent);
router.post('/:id/activate', authorize('school_admin'), validate({ params: idParamsSchema, body: z.object({}).strict() }), StudentController.activateStudent);
router.post('/:id/deactivate', authorize('school_admin'), validate({ params: idParamsSchema, body: z.object({}).strict() }), StudentController.deactivateStudent);

export default router;