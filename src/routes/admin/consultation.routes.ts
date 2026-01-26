import { Router } from 'express';
import adminController from '../../controllers/admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { adminRateLimiter } from '../../middleware/rateLimit.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { updateConsultationStatusSchema } from '../../validators/blog.validator';

const router = Router();

// All admin routes require authentication
router.use(authenticate);
router.use(adminRateLimiter);

router.get('/', adminController.getConsultations);
router.get('/export', adminController.exportConsultations);
router.get('/:id', adminController.getConsultation);
router.put(
  '/:id/status',
  validateRequest(updateConsultationStatusSchema),
  adminController.updateConsultationStatus
);

export default router;
