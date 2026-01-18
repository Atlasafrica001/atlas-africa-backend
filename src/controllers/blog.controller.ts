import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import blogService from '../services/blog.service';

export class BlogController {
  async getPublished(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const featured = req.query.featured === 'true';
      const category = req.query.category as string;

      const result = await blogService.getPublishedPosts({
        page,
        limit,
        featured: req.query.featured ? featured : undefined,
        category,
      });

      sendSuccess(res, result);
    } catch (error: any) {
      console.error('Get published posts error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to fetch blog posts', 500);
    }
  }

  async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const post = await blogService.getBySlug(slug);

      if (!post) {
        sendError(res, 'NOT_FOUND', 'Blog post not found', 404);
        return;
      }

      if (post.status !== 'PUBLISHED') {
        sendError(res, 'NOT_FOUND', 'Blog post not found', 404);
        return;
      }

      sendSuccess(res, post);
    } catch (error: any) {
      console.error('Get post by slug error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to fetch blog post', 500);
    }
  }
}

export default new BlogController();
