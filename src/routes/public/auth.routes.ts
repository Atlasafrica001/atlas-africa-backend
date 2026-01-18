import { Router } from 'express';
import authController from '../../controllers/auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { loginSchema } from '../../validators/auth.validator';
import { loginRateLimiter } from '../../middleware/rateLimit.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post('/verify', authenticate, authController.verify);

export default router;
