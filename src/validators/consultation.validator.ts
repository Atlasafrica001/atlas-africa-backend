import { z } from 'zod';

export const consultationSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Full name must be at least 2 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  company: z
    .string({ required_error: 'Company name is required' })
    .min(2, 'Company name must be at least 2 characters')
    .trim(),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .min(10, 'Invalid phone number')
    .trim(),
  projectDetails: z
    .string({ required_error: 'Project details are required' })
    .min(10, 'Please provide more details about your project')
    .trim(),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
