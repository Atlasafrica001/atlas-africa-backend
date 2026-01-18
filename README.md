# Atlas Africa Backend API

Backend API for the Atlas Africa creative agency website. Built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 15+
- Cloudinary account (for image uploads)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 3. Set up database
npx prisma migrate dev --name init
npx prisma generate

# 4. Seed database with admin user and sample data
npm run prisma:seed

# 5. Start development server
npm run dev
```

Server will start on `http://localhost:5000`

**Default Admin Credentials:**
- Email: `admin@atlasafrica.com`
- Password: `Admin@123`

⚠️ **Change the password immediately after first login!**

---

## 📁 Project Structure

```
atlas-africa-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── src/
│   ├── config/                # Configuration files
│   │   ├── database.ts        # Prisma client
│   │   ├── jwt.ts             # JWT config
│   │   └── cloudinary.ts      # Cloudinary config
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts       # JWT authentication
│   │   ├── validate.middleware.ts   # Zod validation
│   │   ├── rateLimit.middleware.ts  # Rate limiting
│   │   └── error.middleware.ts      # Error handling
│   ├── validators/            # Zod schemas
│   │   ├── waitlist.validator.ts
│   │   ├── consultation.validator.ts
│   │   ├── auth.validator.ts
│   │   └── blog.validator.ts
│   ├── services/              # Business logic
│   │   ├── waitlist.service.ts
│   │   ├── consultation.service.ts
│   │   ├── blog.service.ts
│   │   ├── auth.service.ts
│   │   ├── admin.service.ts
│   │   └── upload.service.ts
│   ├── controllers/           # Request handlers
│   │   ├── waitlist.controller.ts
│   │   ├── consultation.controller.ts
│   │   ├── blog.controller.ts
│   │   ├── auth.controller.ts
│   │   └── admin.controller.ts
│   ├── routes/                # API routes
│   │   ├── public/            # Public routes
│   │   │   ├── waitlist.routes.ts
│   │   │   ├── consultation.routes.ts
│   │   │   ├── blog.routes.ts
│   │   │   └── auth.routes.ts
│   │   └── admin/             # Protected admin routes
│   │       ├── waitlist.routes.ts
│   │       ├── consultation.routes.ts
│   │       ├── blog.routes.ts
│   │       ├── stats.routes.ts
│   │       └── upload.routes.ts
│   ├── types/                 # TypeScript types
│   │   ├── request.types.ts
│   │   └── response.types.ts
│   ├── utils/                 # Utility functions
│   │   ├── response.util.ts
│   │   ├── password.util.ts
│   │   ├── jwt.util.ts
│   │   └── slug.util.ts
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/atlas_africa

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_RATE_LIMIT_MAX=500
UPLOAD_RATE_LIMIT_MAX=20
UPLOAD_RATE_LIMIT_WINDOW_MS=3600000
```

---

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://api.atlasafrica.com/api/v1`

### Authentication
Admin routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format
All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": [ ... ]  // Optional validation details
  }
}
```

---

## 🛠️ REMAINING IMPLEMENTATION (CRITICAL FILES)

The following files need to be created for full functionality:

### Services Layer

#### 1. `src/services/waitlist.service.ts`
```typescript
import { prisma } from '../config/database';
import { WaitlistEntry } from '@prisma/client';

export class WaitlistService {
  async create(email: string): Promise<WaitlistEntry> {
    return await prisma.waitlistEntry.create({
      data: { email },
    });
  }

  async getAll() {
    return await prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsNotified(id: number): Promise<WaitlistEntry> {
    return await prisma.waitlistEntry.update({
      where: { id },
      data: { notified: true },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.waitlistEntry.delete({ where: { id } });
  }

  async getStats() {
    const total = await prisma.waitlistEntry.count();
    const notified = await prisma.waitlistEntry.count({
      where: { notified: true },
    });
    return {
      total,
      notified,
      pending: total - notified,
    };
  }
}

export default new WaitlistService();
```

#### 2. `src/services/consultation.service.ts`
```typescript
import { prisma } from '../config/database';
import { ConsultationRequest, ConsultationStatus } from '@prisma/client';
import { ConsultationSubmission, UpdateConsultationStatus } from '../types/request.types';

export class ConsultationService {
  async create(data: ConsultationSubmission): Promise<ConsultationRequest> {
    return await prisma.consultationRequest.create({
      data,
    });
  }

  async getAll() {
    return await prisma.consultationRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: number): Promise<ConsultationRequest | null> {
    return await prisma.consultationRequest.findUnique({
      where: { id },
    });
  }

  async updateStatus(
    id: number,
    data: UpdateConsultationStatus
  ): Promise<ConsultationRequest> {
    return await prisma.consultationRequest.update({
      where: { id },
      data: {
        status: data.status.toUpperCase() as ConsultationStatus,
        adminNotes: data.adminNotes,
      },
    });
  }

  async getStats() {
    const total = await prisma.consultationRequest.count();
    const pending = await prisma.consultationRequest.count({
      where: { status: 'PENDING' },
    });
    const contacted = await prisma.consultationRequest.count({
      where: { status: 'CONTACTED' },
    });
    const converted = await prisma.consultationRequest.count({
      where: { status: 'CONVERTED' },
    });

    // Calculate new this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await prisma.consultationRequest.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    return { total, pending, contacted, converted, newThisMonth };
  }
}

export default new ConsultationService();
```

#### 3. `src/services/blog.service.ts`
```typescript
import { prisma } from '../config/database';
import { BlogPost, BlogPostStatus } from '@prisma/client';
import { CreateBlogPost, UpdateBlogPost } from '../types/request.types';
import { generateSlug } from '../utils/slug.util';

export class BlogService {
  async create(data: CreateBlogPost): Promise<BlogPost> {
    const slug = generateSlug(data.title);

    return await prisma.blogPost.create({
      data: {
        ...data,
        slug,
        status: data.status.toUpperCase() as BlogPostStatus,
        publishedAt: data.status === 'published' ? new Date() : null,
      },
    });
  }

  async getPublishedPosts() {
    return await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getAllPosts() {
    return await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (post && post.status === 'PUBLISHED') {
      // Increment views
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });
    }

    return post;
  }

  async getById(id: number): Promise<BlogPost | null> {
    return await prisma.blogPost.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateBlogPost): Promise<BlogPost> {
    const updateData: any = { ...data };

    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    if (data.status) {
      updateData.status = data.status.toUpperCase() as BlogPostStatus;
      updateData.publishedAt = data.status === 'published' ? new Date() : null;
    }

    return await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.blogPost.delete({ where: { id } });
  }

  async getStats() {
    const total = await prisma.blogPost.count();
    const published = await prisma.blogPost.count({
      where: { status: 'PUBLISHED' },
    });
    const drafts = total - published;

    const posts = await prisma.blogPost.findMany({
      select: { views: true },
    });
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);

    return { total, published, drafts, totalViews };
  }
}

export default new BlogService();
```

#### 4. `src/services/auth.service.ts`
```typescript
import { prisma } from '../config/database';
import { comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { LoginCredentials } from '../types/request.types';

export class AuthService {
  async login(credentials: LoginCredentials) {
    const admin = await prisma.admin.findUnique({
      where: { email: credentials.email },
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(credentials.password, admin.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
    });

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  async verifyAdmin(adminId: number) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });

    return admin;
  }
}

export default new AuthService();
```

#### 5. `src/services/admin.service.ts`
```typescript
import waitlistService from './waitlist.service';
import consultationService from './consultation.service';
import blogService from './blog.service';

export class AdminService {
  async getStats() {
    const consultations = await consultationService.getStats();
    const waitlist = await waitlistService.getStats();
    const blog = await blogService.getStats();

    return {
      consultations,
      waitlist,
      blog,
      services: {
        active: 6,  // Hardcoded as per frontend
        total: 6,
      },
    };
  }
}

export default new AdminService();
```

#### 6. `src/services/upload.service.ts`
```typescript
import { cloudinary } from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'atlas-africa'
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Upload failed'));
          }
        }
      ).end(file.buffer);
    });
  }
}

export default new UploadService();
```

---

### Controllers Layer

Create controller files that use the services. Each controller should:
1. Import the corresponding service
2. Handle request/response
3. Use `sendSuccess` and `sendError` from utils
4. Include proper error handling

Example pattern for `src/controllers/waitlist.controller.ts`:
```typescript
import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import waitlistService from '../services/waitlist.service';

export class WaitlistController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const entry = await waitlistService.create(email);
      sendSuccess(res, entry, 'Successfully added to waitlist!', 201);
    } catch (error: any) {
      if (error.code === 'P2002') {
        sendError(res, 'DUPLICATE_EMAIL', 'This email is already on the waitlist', 409);
      } else {
        sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to add to waitlist', 500);
      }
    }
  }

  // Add other methods: getAll, markAsNotified, delete, export
}

export default new WaitlistController();
```

---

### Routes Layer

Create route files that connect endpoints to controllers. Example for `src/routes/public/waitlist.routes.ts`:
```typescript
import { Router } from 'express';
import waitlistController from '../../controllers/waitlist.controller';
import { validate } from '../../middleware/validate.middleware';
import { waitlistSchema } from '../../validators/waitlist.validator';
import { waitlistRateLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.post(
  '/',
  waitlistRateLimiter,
  validate(waitlistSchema),
  waitlistController.create
);

export default router;
```

---

## 🧪 Testing

```bash
# Test the API with curl or Postman

# Health check
curl http://localhost:5000/health

# Submit to waitlist
curl -X POST http://localhost:5000/api/v1/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Admin login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@atlasafrica.com","password":"Admin@123"}'

# Get admin stats (requires token)
curl http://localhost:5000/api/v1/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚢 Deployment

### Database Migration (Production)
```bash
npx prisma migrate deploy
```

### Environment Setup
1. Set all environment variables in your hosting platform
2. Ensure `NODE_ENV=production`
3. Use strong `JWT_SECRET`
4. Configure Cloudinary credentials
5. Set correct `FRONTEND_URL`

### Recommended Platforms
- **Backend:** Railway, Render, or Fly.io
- **Database:** Supabase, Neon, or Railway Postgres
- **File Storage:** Cloudinary (already configured)

---

## 📝 Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database
npm run prisma:reset     # Reset database
```

---

## 🔐 Security Features

- ✅ Helmet.js for security headers
- ✅ CORS configured for frontend only
- ✅ Rate limiting on all endpoints
- ✅ JWT authentication for admin routes
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Input validation with Zod
- ✅ Prisma parameterized queries
- ✅ Environment variable security

---

## 📄 License

MIT License - Atlas Africa

---

## 👥 Support

For issues or questions, contact: admin@atlasafrica.com

---

## ✅ Implementation Checklist

- [x] Project setup
- [x] Database schema
- [x] Configuration files
- [x] Middleware
- [x] Validators
- [x] Utilities
- [x] Type definitions
- [x] Express app setup
- [x] Server entry point
- [ ] **Services (6 files) - CREATE THESE**
- [ ] **Controllers (5 files) - CREATE THESE**
- [ ] **Routes (9 files) - CREATE THESE**

**Next Steps:** Create the services, controllers, and routes following the patterns shown above.
