import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@atlasafrica.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@atlasafrica.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', { email: admin.email, id: admin.id });
  console.log('📧 Email: admin@atlasafrica.com');
  console.log('🔑 Password: admin123');
  console.log('⚠️  IMPORTANT: Change this password in production!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
