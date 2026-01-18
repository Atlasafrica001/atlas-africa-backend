import { z } from 'zod';

export const createBlogPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  excerpt: z
    .string({ required_error: 'Excerpt is required' })
    .min(10, 'Excerpt must be at least 10 characters')
    .max(500, 'Excerpt must not exceed 500 characters')
    .trim(),
  content: z
    .string({ required_error: 'Content is required' })
    .min(50, 'Content must be at least 50 characters')
    .trim(),
  coverImage: z.string().url('Invalid cover image URL').optional(),
  author: z
    .string({ required_error: 'Author is required' })
    .min(2, 'Author name must be at least 2 characters')
    .trim(),
  authorImage: z.string().optional(),
  readTime: z.string().default('5 min read'),
  status: z.enum(['published', 'draft'], {
    required_error: 'Status is required',
    invalid_type_error: "Status must be either 'published' or 'draft'",
  }),
  featured: z.boolean().default(false),
  categories: z
    .array(z.string())
    .min(1, 'At least one category is required')
    .max(5, 'Maximum 5 categories allowed'),
});

export const updateBlogPostSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(500, 'Excerpt must not exceed 500 characters')
    .trim()
    .optional(),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters')
    .trim()
    .optional(),
  coverImage: z.string().url('Invalid cover image URL').optional(),
  author: z.string().min(2, 'Author name must be at least 2 characters').trim().optional(),
  authorImage: z.string().optional(),
  readTime: z.string().optional(),
  status: z.enum(['published', 'draft']).optional(),
  featured: z.boolean().optional(),
  categories: z
    .array(z.string())
    .min(1, 'At least one category is required')
    .max(5, 'Maximum 5 categories allowed')
    .optional(),
});

export const updateConsultationStatusSchema = z.object({
  status: z.enum(['pending', 'contacted', 'converted'], {
    required_error: 'Status is required',
    invalid_type_error: "Status must be 'pending', 'contacted', or 'converted'",
  }),
  adminNotes: z.string().optional(),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type UpdateConsultationStatusInput = z.infer<typeof updateConsultationStatusSchema>;
