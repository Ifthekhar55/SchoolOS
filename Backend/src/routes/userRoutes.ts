import { Router } from 'express';
import UserController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// All user routes require authentication
router.use(authenticate);
router.use(tenantMiddleware);

// User management
router.get('/', authorize('super_admin', 'school_admin'), UserController.getUsers);
router.get('/:id', UserController.getUser);
router.post('/', authorize('super_admin', 'school_admin'), UserController.createUser);
router.put('/:id', authorize('super_admin', 'school_admin'), UserController.updateUser);
router.delete('/:id', authorize('super_admin', 'school_admin'), UserController.deleteUser);
router.post('/:id/activate', authorize('super_admin', 'school_admin'), UserController.activateUser);
router.post('/:id/deactivate', authorize('super_admin', 'school_admin'), UserController.deactivateUser);
router.put('/:id/role', authorize('super_admin', 'school_admin'), UserController.assignRole);

export default router;