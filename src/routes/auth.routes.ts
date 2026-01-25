import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema } from '../validators/auth.validator';
import { loginLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate admin and get token
 * @access  Public (but rate limited)
 */
router.post(
  '/login',
  loginLimiter,                    // ← Rate limit (5 attempts per 15 min)
  validateRequest(loginSchema),     // ← Validate request body
  authController.login              // ← Handle login
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout admin (invalidate token)
 * @access  Private
 */
// router.post('/logout', authMiddleware, authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current admin info
 * @access  Private
 */
// router.get('/me', authMiddleware, authController.getCurrentAdmin);

export default router;
