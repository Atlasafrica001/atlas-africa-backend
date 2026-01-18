import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import waitlistRoutes from './routes/public/waitlist.routes';
import consultationRoutes from './routes/public/consultation.routes';
import blogRoutes from './routes/public/blog.routes';
import authRoutes from './routes/public/auth.routes';

import adminWaitlistRoutes from './routes/admin/waitlist.routes';
import adminConsultationRoutes from './routes/admin/consultation.routes';
import adminBlogRoutes from './routes/admin/blog.routes';
import adminStatsRoutes from './routes/admin/stats.routes';
import adminUploadRoutes from './routes/admin/upload.routes';

dotenv.config();

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Atlas Africa API is running 🚀'
  });
});


// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Public API routes
app.use('/api/v1/waitlist', waitlistRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/auth', authRoutes);

// Admin API routes (protected)
app.use('/api/v1/admin/waitlist', adminWaitlistRoutes);
app.use('/api/v1/admin/consultations', adminConsultationRoutes);
app.use('/api/v1/admin/blog', adminBlogRoutes);
app.use('/api/v1/admin/stats', adminStatsRoutes);
app.use('/api/v1/admin/upload', adminUploadRoutes);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
