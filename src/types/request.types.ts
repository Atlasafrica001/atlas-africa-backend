import { Request } from 'express';
import { JwtPayload } from '../utils/jwt.util';

// Extend Express Request to include admin from JWT
export interface AuthRequest extends Request {
  admin?: JwtPayload;
}

// Waitlist submission
export interface WaitlistSubmission {
  email: string;
}

// Consultation submission
export interface ConsultationSubmission {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  projectDetails: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Blog post creation
export interface CreateBlogPost {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  authorImage?: string;
  readTime?: string;
  status: 'published' | 'draft';
  featured: boolean;
  categories: string[];
}

// Blog post update
export interface UpdateBlogPost {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  author?: string;
  authorImage?: string;
  readTime?: string;
  status?: 'published' | 'draft';
  featured?: boolean;
  categories?: string[];
}

// Consultation status update
export interface UpdateConsultationStatus {
  status: 'pending' | 'contacted' | 'converted';
  adminNotes?: string;
}
