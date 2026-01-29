import { z } from 'zod';

/**
 * URL validation regex - more lenient
 */
const urlRegex = /^https?:\/\/.+/i;

/**
 * Create blog post validation
 */
export const createBlogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional().nullable(),
  coverImage: z
    .string()
    .regex(urlRegex, 'Must be a valid URL starting with http:// or https://')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),
  author: z.string().max(100).optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable()
});

/**
 * Update blog post validation
 */
export const updateBlogSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  coverImage: z
    .string()
    .regex(urlRegex, 'Must be a valid URL starting with http:// or https://')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform(val => val === '' ? null : val),
  author: z.string().max(100).optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable()
});

// Aliases for backward compatibility
export const createBlogPostSchema = createBlogSchema;
export const updateBlogPostSchema = updateBlogSchema;

export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;