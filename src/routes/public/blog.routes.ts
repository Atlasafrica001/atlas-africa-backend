import { Router } from 'express';
import blogController from '../../controllers/blog.controller';
import { publicRateLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.get('/posts', publicRateLimiter, blogController.getPublished);
router.get('/posts/:slug', publicRateLimiter, blogController.getBySlug);

export default router;
