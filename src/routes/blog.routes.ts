import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createBlogSchema, updateBlogSchema } from '../validators/blog.validator';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const blogController = new BlogController();

/**
 * PUBLIC ROUTES
 */

/**
 * @route   GET /api/v1/blog
 * @desc    Get all published blog posts
 * @access  Public
 */
router.get(
  '/',
  blogController.getAllPosts
);

/**
 * @route   GET /api/v1/blog/:slug
 * @desc    Get single blog post by slug
 * @access  Public (but admins can see unpublished)
 */
router.get(
  '/:slug',
  optionalAuthMiddleware, // Optional auth - admins can see drafts
  blogController.getPostBySlug
);

/**
 * ADMIN ROUTES
 */

/**
 * @route   POST /api/v1/blog
 * @desc    Create new blog post
 * @access  Private (Admin)
 */
router.post(
  '/',
  authMiddleware,
  validateRequest(createBlogSchema),
  blogController.createPost
);

/**
 * @route   GET /api/v1/blog/admin/:id
 * @desc    Get blog post by ID (includes unpublished)
 * @access  Private (Admin)
 */
router.get(
  '/admin/:id',
  authMiddleware,
  blogController.getPostById
);

/**
 * @route   PUT /api/v1/blog/:id
 * @desc    Update blog post
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authMiddleware,
  validateRequest(updateBlogSchema),
  blogController.updatePost
);

/**
 * @route   DELETE /api/v1/blog/:id
 * @desc    Delete blog post
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  blogController.deletePost
);

/**
 * @route   PATCH /api/v1/blog/:id/publish
 * @desc    Toggle publish status
 * @access  Private (Admin)
 */
router.patch(
  '/:id/publish',
  authMiddleware,
  blogController.togglePublish
);

export default router;
