import { z } from 'zod';

export const waitlistSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
