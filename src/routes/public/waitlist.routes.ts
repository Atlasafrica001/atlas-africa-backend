import { Router } from 'express';
import waitlistController from '../../controllers/waitlist.controller';
import { validate } from '../../middleware/validate.middleware';
import { waitlistSchema } from '../../validators/waitlist.validator';
import { waitlistRateLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.post(
  '/',
  waitlistRateLimiter,
  validate(waitlistSchema),
  waitlistController.create
);

export default router;
