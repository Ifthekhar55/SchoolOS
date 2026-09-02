import { Router } from 'express';
import ClassController from '../controllers/classController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// ============ Academic Years ============
router.get('/academic-years', ClassController.getAcademicYears);
router.post('/academic-years', authorize('school_admin'), ClassController.createAcademicYear);
router.put('/academic-years/:id', authorize('school_admin'), ClassController.updateAcademicYear);
router.post('/academic-years/:id/set-current', authorize('school_admin'), ClassController.setCurrentAcademicYear);

// ============ Helper Routes (must come before /:id) ============
router.get('/available-teachers', ClassController.getAvailableTeachers);
router.get('/available-subjects', ClassController.getAvailableSubjects);
router.get('/statistics', ClassController.getClassStatistics);

// ============ Classes ============
router.get('/', ClassController.getClasses);
router.post('/', authorize('school_admin'), ClassController.createClass);
router.get('/:id', ClassController.getClass);
router.put('/:id', authorize('school_admin'), ClassController.updateClass);
router.delete('/:id', authorize('school_admin'), ClassController.deleteClass);
router.post('/:id/activate', authorize('school_admin'), ClassController.activateClass);
router.post('/:id/deactivate', authorize('school_admin'), ClassController.deactivateClass);

// ============ Sections ============
router.get('/:classId/sections', ClassController.getSections);
router.post('/:classId/sections', authorize('school_admin'), ClassController.createSection);
router.get('/sections/:id', ClassController.getSection);
router.put('/sections/:id', authorize('school_admin'), ClassController.updateSection);
router.delete('/sections/:id', authorize('school_admin'), ClassController.deleteSection);
router.post('/sections/:id/activate', authorize('school_admin'), ClassController.activateSection);
router.post('/sections/:id/deactivate', authorize('school_admin'), ClassController.deactivateSection);

// ============ Class Subjects ============
router.get('/:classId/subjects', ClassController.getClassSubjects);
router.post('/:classId/subjects', authorize('school_admin'), ClassController.assignSubject);
router.put('/:classId/subjects/:subjectId', authorize('school_admin'), ClassController.updateSubject);
router.delete('/:classId/subjects/:subjectId', authorize('school_admin'), ClassController.removeSubject);

export default router;