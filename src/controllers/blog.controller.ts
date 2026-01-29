import { Request, Response } from 'express';
import { BlogService } from '../services/blog.service';
import { asyncHandler } from '../utils/asyncHandler';

const blogService = new BlogService();

export class BlogController {
  /**
   * Create blog post (Admin)
   */
  createPost = asyncHandler(async (req: Request, res: Response) => {
    const post = await blogService.createPost(req.body);

    res.status(201).json({
      success: true,
      data: { post }
    });
  });

  /**
   * Get all posts
   */
  getAllPosts = asyncHandler(async (req: Request, res: Response) => {
    const published = req.query.published === 'true' ? true :
                     req.query.published === 'false' ? false : undefined;
    
    const posts = await blogService.getAllPosts(published);

    res.status(200).json({
      success: true,
      data: { 
        posts,
        total: posts.length 
      }
    });
  });

  /**
   * Get post by slug (Public)
   */
  getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const includeUnpublished = (req as any).admin !== undefined; // Admin can see unpublished

    const post = await blogService.getPostBySlug(slug, includeUnpublished);

    res.status(200).json({
      success: true,
      data: { post }
    });
  });

  /**
   * Get post by ID (Admin)
   */
  getPostById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await blogService.getPostById(parseInt(id));

    res.status(200).json({
      success: true,
      data: { post }
    });
  });

  /**
   * Update post (Admin)
   */
  updatePost = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await blogService.updatePost(parseInt(id), req.body);

    res.status(200).json({
      success: true,
      data: { post }
    });
  });

  /**
   * Delete post (Admin)
   */
  deletePost = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await blogService.deletePost(parseInt(id));

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Toggle publish status (Admin)
   */
  togglePublish = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await blogService.togglePublish(parseInt(id));

    res.status(200).json({
      success: true,
      data: { post }
    });
  });
}
