import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

const router = Router();

/**
 * Validation schema for consultation request
 */
const consultationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company name is required').max(100),
  phone: z.string().min(1, 'Phone number is required').max(20),
  projectDetails: z.string().min(10, 'Please provide more details about your project').max(5000)
});

/**
 * @route   POST /api/v1/consultation
 * @desc    Submit consultation request (PUBLIC)
 * @access  Public
 */
router.post('/', asyncHandler(async (req, res) => {
  // Validate request body
  const validation = consultationSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.error.errors
    });
  }

  const { fullName, email, company, phone, projectDetails } = validation.data;

  // Create consultation request
  const consultation = await prisma.consultationRequest.create({
    data: {
      fullName,
      email,
      company,
      phone,
      projectDetails,
      status: 'PENDING'
    }
  });

  // TODO: Send notification email to admin
  // TODO: Send confirmation email to client

  res.status(201).json({
    success: true,
    message: 'Consultation request submitted successfully. We will contact you within 24 hours.',
    data: {
      id: consultation.id,
      email: consultation.email
    }
  });
}));

export default router;
