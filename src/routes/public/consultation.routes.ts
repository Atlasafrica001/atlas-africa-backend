import { Router } from 'express';
import consultationController from '../../controllers/consultation.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { consultationSchema } from '../../validators/consultation.validator';
import { consultationRateLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.post(
  '/',
  consultationRateLimiter,
  validateRequest(consultationSchema),
  consultationController.create
);

export default router;
