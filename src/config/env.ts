import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL URL'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // CORS (optional, has defaults in app.ts)
  CORS_ORIGIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    const validated = envSchema.parse(process.env);
    
    console.log('✅ Environment validation passed');
    console.log('   NODE_ENV:', validated.NODE_ENV);
    console.log('   PORT:', validated.PORT);
    console.log('   DATABASE_URL:', validated.DATABASE_URL.substring(0, 30) + '...');
    console.log('   JWT_SECRET:', '[HIDDEN - ' + validated.JWT_SECRET.length + ' chars]');
    console.log('   JWT_EXPIRES_IN:', validated.JWT_EXPIRES_IN);
    console.log('   CORS_ORIGIN:', validated.CORS_ORIGIN || 'Not set (using defaults)');
    
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      console.error('');
      error.errors.forEach(err => {
        console.error(`  ⚠️  ${err.path.join('.')}: ${err.message}`);
      });
      console.error('');
      console.error('Please check your .env file or environment variables in Render.');
      console.error('');
    }
    process.exit(1);
  }
}

export const env = validateEnv();