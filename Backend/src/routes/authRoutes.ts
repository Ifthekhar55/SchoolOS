import { Router } from 'express';
import AuthController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { emptyBodySchema, loginSchema, registerSchema } from '../schemas/auth';

const router = Router();

// Public routes
router.post('/login', validate({ body: loginSchema }), AuthController.login);
router.post('/register', validate({ body: registerSchema }), AuthController.register);
router.post('/refresh', validate({ body: emptyBodySchema }), AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;