import { z } from 'zod';

/**
 * Waitlist submission validation
 */
export const waitlistSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  name: z
    .string()
    .trim()
    .optional()
    .nullable()
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
