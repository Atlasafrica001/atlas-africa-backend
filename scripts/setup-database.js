#!/usr/bin/env node

/**
 * Automatic Database Setup Script
 * Runs migrations and seeds database on startup
 * Use this in Render's start command
 */

const { execSync } = require('child_process');

console.log('🚀 Starting database setup...\n');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated\n');

  // Step 2: Run migrations
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations completed\n');

  // Step 3: Seed database
  console.log('🌱 Seeding database...');
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded\n');

  console.log('🎉 Database setup complete!\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.error('\nContinuing anyway - app might not work correctly');
  console.error('Check Render logs for details\n');
  
  // Don't fail - let the app start anyway
  // We'll use HTTP endpoints to complete setup
  process.exit(0);
}
