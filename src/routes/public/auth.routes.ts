import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { loginSchema } from '../../validators/auth.validator';
import { loginRateLimiter } from '../../middleware/rateLimit.middleware';
import { authenticate } from '../../middleware/auth.middleware';

const authController = new AuthController();

const router = Router();

router.post(
  '/login',
  loginRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post('/login', authController.login);

export default router;
