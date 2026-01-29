import { z } from 'zod';

/**
 * Create blog post validation
 */
export const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  published: z.boolean().optional(),
  featuredImage: z.string().url('Must be a valid URL').optional()
});

/**
 * Update blog post validation
 */
export const updateBlogSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional(),
  published: z.boolean().optional(),
  featuredImage: z.string().url().optional()
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
