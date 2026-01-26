import { Router } from 'express';
import adminController from '../../controllers/admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { adminRateLimiter } from '../../middleware/rateLimit.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createBlogPostSchema, updateBlogPostSchema } from '../../validators/blog.validator';

const router = Router();

// All admin routes require authentication
router.use(authenticate);
router.use(adminRateLimiter);

router.get('/posts', adminController.getAllBlogPosts);
router.post('/posts', validateRequest(createBlogPostSchema), adminController.createBlogPost);
router.get('/posts/:id', adminController.getBlogPost);
router.put('/posts/:id', validateRequest(updateBlogPostSchema), adminController.updateBlogPost);
router.delete('/posts/:id', adminController.deleteBlogPost);

export default router;
