import { Router } from 'express';
import SchoolController from '../controllers/schoolController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all schools (super admin sees all, others see their own)
router.get('/', SchoolController.getSchools);

// Get a single school
router.get('/:id', SchoolController.getSchool);

// Create school (super admin only)
router.post('/', authorize('super_admin'), SchoolController.createSchool);

// Update school (super admin or school admin)
router.put('/:id', SchoolController.updateSchool);

// Delete school (super admin only)
router.delete('/:id', authorize('super_admin'), SchoolController.deleteSchool);

export default router;