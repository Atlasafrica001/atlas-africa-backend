import { Router } from 'express';
import adminController from '../../controllers/admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { adminRateLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

// All admin routes require authentication
router.use(authenticate);
router.use(adminRateLimiter);

router.get('/', adminController.getStats);

export default router;
