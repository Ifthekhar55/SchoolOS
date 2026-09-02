import { Router } from 'express';
import NoticeController from '../controllers/noticeController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/notices/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// All routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// ============ Public Routes (must come before /:id) ============
router.get('/public', NoticeController.getPublishedNotices);
router.get('/statistics', authorize('school_admin'), NoticeController.getStatistics);

// ============ Notice CRUD ============
router.get('/', NoticeController.getNotices);
router.post('/', authorize('school_admin', 'teacher'), NoticeController.createNotice);
router.get('/:id', NoticeController.getNotice);
router.put('/:id', authorize('school_admin', 'teacher'), NoticeController.updateNotice);
router.delete('/:id', authorize('school_admin'), NoticeController.deleteNotice);

// ============ Status Management ============
router.post('/:id/publish', authorize('school_admin'), NoticeController.publishNotice);
router.post('/:id/unpublish', authorize('school_admin'), NoticeController.unpublishNotice);
router.post('/:id/archive', authorize('school_admin'), NoticeController.archiveNotice);

// ============ Attachments ============
router.post(
  '/:id/attachments',
  authorize('school_admin', 'teacher'),
  upload.single('file'),
  NoticeController.uploadAttachment
);
router.delete(
  '/:id/attachments/:filename',
  authorize('school_admin'),
  NoticeController.deleteAttachment
);

// ============ Auto-Expire ============
router.post('/auto-expire', authorize('school_admin'), NoticeController.autoExpireNotices);

export default router;