import { Router } from 'express';
import ExamController from '../controllers/examController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// ============ Statistics (must come before /:id routes) ============
router.get('/statistics', ExamController.getExamStatistics);

// ============ Exams ============
router.get('/', ExamController.getExams);
router.post('/', authorize('school_admin', 'teacher'), ExamController.createExam);
router.get('/:id', ExamController.getExam);
router.put('/:id', authorize('school_admin', 'teacher'), ExamController.updateExam);
router.delete('/:id', authorize('school_admin'), ExamController.deleteExam);
router.post('/:id/publish', authorize('school_admin'), ExamController.publishExam);
router.post('/:id/unpublish', authorize('school_admin'), ExamController.unpublishExam);

// ============ Exam Subjects ============
router.get('/:examId/subjects', ExamController.getExamSubjects);
router.post('/:examId/subjects', authorize('school_admin', 'teacher'), ExamController.addExamSubject);
router.put('/:examId/subjects/:subjectId', authorize('school_admin', 'teacher'), ExamController.updateExamSubject);
router.delete('/:examId/subjects/:subjectId', authorize('school_admin'), ExamController.removeExamSubject);

// ============ Marks Entry ============
router.get('/:examId/subjects/:subjectId/marks', ExamController.getMarks);
router.post('/:examId/subjects/:subjectId/marks', authorize('school_admin', 'teacher'), ExamController.enterMarks);
router.put('/:examId/subjects/:subjectId/marks/:studentId', authorize('school_admin', 'teacher'), ExamController.updateMark);

// ============ Results ============
router.get('/results', ExamController.getResults);
router.post('/:examId/generate-results', authorize('school_admin', 'teacher'), ExamController.generateResults);
router.post('/:examId/publish-results', authorize('school_admin'), ExamController.publishResults);
router.get('/:examId/export-results', ExamController.exportResults);

// ============ Class Results ============
router.get('/classes/:classId/sections/:sectionId/results/:examId', ExamController.getClassResults);

// ============ Grade Systems ============
router.get('/grade-systems', ExamController.getGradeSystems);
router.get('/grade-systems/:id', ExamController.getGradeSystem);
router.post('/grade-systems', authorize('school_admin'), ExamController.createGradeSystem);
router.put('/grade-systems/:id', authorize('school_admin'), ExamController.updateGradeSystem);
router.delete('/grade-systems/:id', authorize('school_admin'), ExamController.deleteGradeSystem);
router.post('/grade-systems/:id/set-default', authorize('school_admin'), ExamController.setDefaultGradeSystem);

// ============ Student Routes ============
router.get('/students/:studentId/marks', ExamController.getStudentMarks);
router.get('/students/:studentId/results/:examId', ExamController.getStudentResult);
router.get('/students/:studentId/report', ExamController.getStudentReport);

// ============ Class Reports ============
router.get('/classes/:classId/sections/:sectionId/report', ExamController.getClassReport);

export default router;