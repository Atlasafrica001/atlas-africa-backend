import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import waitlistRoutes from './routes/waitlist.routes';
import blogRoutes from './routes/blog.routes';
import adminRoutes from './routes/admin.routes';
import consultationPublicRoutes from './routes/consultation.routes';
import consultationAdminRoutes from './routes/consultation-admin.routes';
import settingsRoutes from './routes/settings.routes';


const app: Application = express();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. TRUST PROXY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.set('trust proxy', 1);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. REQUEST ID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(requestIdMiddleware);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. SECURITY HEADERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. CORS - PHASE 2 (Simple, no credentials)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://atlas-africa.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

console.log('✅ Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: false, // Phase 2: No cookies needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. BODY PARSING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. LOGGING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}



app.use('/api/v1/waitlist', waitlistRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/consultation', consultationPublicRoutes);
app.use('/api/v1/admin/consultations', consultationAdminRoutes);
app.use('/api/v1/admin/settings', settingsRoutes);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. RATE LIMITING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use('/api/', apiLimiter);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV,
      auth: 'localStorage (Phase 2)'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. API ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use('/api/v1/auth', authRoutes);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. 404 HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use('*', notFoundHandler);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 11. ERROR HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use(errorHandler);



export default app;