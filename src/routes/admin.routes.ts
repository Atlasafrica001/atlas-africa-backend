import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const adminController = new AdminController();

/**
 * All routes require authentication
 */

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/stats', authMiddleware, adminController.getDashboardStats);

/**
 * @route   GET /api/v1/admin/activity
 * @desc    Get recent activity feed
 * @access  Private (Admin)
 */
router.get('/activity', authMiddleware, adminController.getRecentActivity);

/**
 * @route   GET /api/v1/admin/top-posts
 * @desc    Get top performing posts
 * @access  Private (Admin)
 */
router.get('/top-posts', authMiddleware, adminController.getTopPosts);

/**
 * @route   GET /api/v1/admin/posts-by-status
 * @desc    Get posts grouped by status
 * @access  Private (Admin)
 */
router.get('/posts-by-status', authMiddleware, adminController.getPostsByStatus);

/**
 * @route   GET /api/v1/admin/category-stats
 * @desc    Get category statistics
 * @access  Private (Admin)
 */
router.get('/category-stats', authMiddleware, adminController.getCategoryStats);

/**
 * @route   GET /api/v1/admin/posting-trends
 * @desc    Get posting trends (last 30 days)
 * @access  Private (Admin)
 */
router.get('/posting-trends', authMiddleware, adminController.getPostingTrends);

export default router;
