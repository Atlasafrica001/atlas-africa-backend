import { Router } from 'express';
import { WaitlistController } from '../controllers/waitlist.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { waitlistSchema } from '../validators/waitlist.validator';
import { waitlistLimiter } from '../middleware/rateLimiter.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const waitlistController = new WaitlistController();

/**
 * @route   POST /api/v1/waitlist
 * @desc    Add email to waitlist
 * @access  Public (rate limited)
 */
router.post(
  '/',
  waitlistLimiter,                      // 3 submissions per hour per IP
  validateRequest(waitlistSchema),
  waitlistController.addToWaitlist
);

/**
 * @route   GET /api/v1/waitlist
 * @desc    Get all waitlist entries
 * @access  Private (Admin only)
 */
router.get(
  '/',
  authMiddleware,
  waitlistController.getAllEntries
);

/**
 * @route   GET /api/v1/waitlist/count
 * @desc    Get waitlist count
 * @access  Private (Admin only)
 */
router.get(
  '/count',
  authMiddleware,
  waitlistController.getCount
);

/**
 * @route   GET /api/v1/waitlist/export
 * @desc    Export waitlist to CSV
 * @access  Private (Admin only)
 */
router.get(
  '/export',
  authMiddleware,
  waitlistController.exportCSV
);

/**
 * @route   DELETE /api/v1/waitlist/:id
 * @desc    Delete waitlist entry
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authMiddleware,
  waitlistController.deleteEntry
);

export default router;
