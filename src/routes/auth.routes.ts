import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema } from '../validators/auth.validator';
import { loginLimiter } from '../middleware/rateLimiter.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate admin and set httpOnly cookie
 * @access  Public (rate limited)
 */
router.post(
  '/login',
  loginLimiter,
  // validateRequest(loginSchema),
  authController.login
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Clear authentication cookie
 * @access  Private
 */
router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated admin
 * @access  Private
 */
router.get(
  '/me',
  authMiddleware,
  authController.getCurrentAdmin
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh authentication token
 * @access  Private
 */
router.post(
  '/refresh',
  authMiddleware,
  authController.refreshToken.bind(authController)
);

export default router;
