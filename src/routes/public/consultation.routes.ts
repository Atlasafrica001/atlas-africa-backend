import { Router } from 'express';
import consultationController from '../../controllers/consultation.controller';
import { validate } from '../../middleware/validate.middleware';
import { consultationSchema } from '../../validators/consultation.validator';
import { consultationRateLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.post(
  '/',
  consultationRateLimiter,
  validate(consultationSchema),
  consultationController.create
);

export default router;
