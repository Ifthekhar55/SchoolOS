import { Router } from 'express';
import SettingsController from '../controllers/settingsController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import multer from 'multer';

const router = Router();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// All routes require authentication and admin access
router.use(authenticate);
router.use(tenantMiddleware);
router.use(authorize('super_admin', 'school_admin'));

// ============ Get Settings ============
router.get('/', SettingsController.getSettings);
router.get('/health', SettingsController.getSystemHealth);

// ============ School Profile ============
router.put('/school', SettingsController.updateSchoolProfile);
router.post('/school/logo', upload.single('logo'), SettingsController.uploadLogo);

// ============ Academic Settings ============
router.put('/academic', SettingsController.updateAcademicSettings);
router.post('/academic/terms', SettingsController.createTerm);
router.put('/academic/terms/:id', SettingsController.updateTerm);
router.delete('/academic/terms/:id', SettingsController.deleteTerm);

// ============ Fee Settings ============
router.put('/fees', SettingsController.updateFeeSettings);

// ============ Grade Settings ============
router.put('/grades', SettingsController.updateGradeSettings);
router.post('/grades', SettingsController.createGrade);
router.put('/grades/:id', SettingsController.updateGrade);
router.delete('/grades/:id', SettingsController.deleteGrade);

// ============ Notification Settings ============
router.put('/notifications', SettingsController.updateNotificationSettings);

// ============ System Settings ============
router.put('/system', SettingsController.updateSystemSettings);

// ============ Backup Settings ============
router.put('/backup', SettingsController.updateBackupSettings);
router.post('/backup/create', SettingsController.createBackup);
router.post('/backup/restore', upload.single('backup'), SettingsController.restoreBackup);

export default router;