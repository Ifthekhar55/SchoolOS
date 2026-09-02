import { Router } from 'express';
import SubjectController from '../controllers/subjectController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// ============ Helper Routes (must come before /:id) ============
router.get('/classes-with-subjects', SubjectController.getClassesWithSubjects);
router.get('/statistics', SubjectController.getStatistics);
router.get('/search', SubjectController.searchSubjects);

// ============ Class Subjects ============
router.get('/class/:classId', SubjectController.getSubjectsByClass);

// ============ Subject CRUD ============
router.get('/', SubjectController.getSubjects);
router.post('/', authorize('school_admin', 'teacher'), SubjectController.createSubject);
router.get('/:id/classes', SubjectController.getSubjectWithClasses);
router.get('/:id', SubjectController.getSubject);
router.put('/:id', authorize('school_admin', 'teacher'), SubjectController.updateSubject);
router.delete('/:id', authorize('school_admin'), SubjectController.deleteSubject);

// ============ Status Management ============
router.post('/:id/activate', authorize('school_admin'), SubjectController.activateSubject);
router.post('/:id/deactivate', authorize('school_admin'), SubjectController.deactivateSubject);

// ============ Teacher Assignment ============
router.post('/:id/assign-teacher', authorize('school_admin'), SubjectController.assignTeacher);

// ============ Bulk Operations ============
router.post('/bulk', authorize('school_admin'), SubjectController.bulkCreateSubjects);
router.post('/bulk-delete', authorize('school_admin'), SubjectController.bulkDeleteSubjects);

export default router;