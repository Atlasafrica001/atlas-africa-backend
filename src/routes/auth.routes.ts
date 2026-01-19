import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post(
  '/login',
  validateRequest(loginSchema),
  authController.login
);

export default router;
