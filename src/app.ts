import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcrypt';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// DATABASE DIAGNOSTIC ENDPOINT
app.get('/debug/database', async (req, res) => {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Count admins
    const adminCount = await prisma.admin.count();
    
    // List admins (no passwords)
    const admins = await prisma.admin.findMany({
      select: { 
        id: true, 
        email: true, 
        createdAt: true 
      }
    });
    
    res.json({
      success: true,
      database: 'connected',
      adminCount,
      admins
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      hint: error.code === 'P2021' 
        ? 'Table does not exist. Update build command to: npm install && npx prisma generate && npx prisma migrate deploy && npm run build'
        : 'Check Render logs for details'
    });
  }
});

// DATABASE INITIALIZATION ENDPOINT (HTTP-based setup)
app.post('/setup/initialize', async (req, res) => {
  try {
    console.log('🔧 Setup: Checking for admin user...');
    
    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@atlasafrica.com' }
    }).catch(() => null);
    
    if (existingAdmin) {
      console.log('✅ Setup: Admin already exists');
      return res.json({
        success: true,
        message: 'Admin already exists',
        admin: { email: existingAdmin.email }
      });
    }
    
    // Create admin
    console.log('🔧 Setup: Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.admin.create({
      data: {
        name: 'Admin',
        email: 'admin@atlasafrica.com',
        password: hashedPassword
      }
    });
    
    console.log('✅ Setup: Admin created successfully');
    res.json({
      success: true,
      message: 'Database initialized successfully',
      admin: { id: admin.id, email: admin.email }
    });
  } catch (error: any) {
    console.error('❌ Setup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      hint: error.code === 'P2021'
        ? 'Admin table does not exist. Update build command to include: npx prisma migrate deploy'
        : 'Check error details'
    });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
