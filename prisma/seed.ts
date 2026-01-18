import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create initial admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@atlasafrica.com' },
    update: {},
    create: {
      email: 'admin@atlasafrica.com',
      password: hashedPassword,
      name: 'Atlas Admin',
    },
  });

  console.log('✅ Admin user created:', {
    email: admin.email,
    name: admin.name,
  });

  console.log('\n📧 Login Credentials:');
  console.log('   Email: admin@atlasafrica.com');
  console.log('   Password: Admin@123');
  console.log('\n⚠️  IMPORTANT: Change password after first login!\n');

  // Seed sample blog posts
  const samplePosts = [
    {
      title: 'The Death of Conventional Marketing',
      slug: 'the-death-of-conventional-marketing',
      excerpt: "The rules have changed. Learn how the world's most innovative brands are breaking the mold and creating movements, not just campaigns.",
      content: "It's a war of ATTENTION out there and brands with only 'HUGS EVERY MARKETER' slogans are losing badly. Meanwhile, the disruptors are winning today and I just think we should be listening to success a little bit differently. I'm marketing and I'm thinking about it only way to about it not because to get some.",
      author: 'Miss Erin',
      authorImage: '/blog-author-1.png',
      readTime: '5 min read',
      views: 1243,
      status: 'PUBLISHED' as const,
      featured: true,
      categories: ['Hot', 'Featured Entrepreneurs', 'Real-life Disruptive Marketing 2025'],
      publishedAt: new Date('2026-01-06'),
    },
    {
      title: 'What Is Unconventional Marketing',
      slug: 'what-is-unconventional-marketing',
      excerpt: "Unconventional marketing breaks all traditional rules to create memorable brand experiences that resonate deeply with audiences.",
      content: "Unconventional marketing is about thinking outside the box, challenging the status quo, and creating campaigns that people actually remember. It's about being bold, being different, and being willing to take risks that others won't.",
      author: 'Miss Erin',
      authorImage: '/blog-author-2.png',
      readTime: '4 min read',
      views: 856,
      status: 'PUBLISHED' as const,
      featured: false,
      categories: ['Marketing Strategy', 'Innovation'],
      publishedAt: new Date('2024-12-12'),
    },
    {
      title: 'Disruptive Marketing Strategies for 2026',
      slug: 'disruptive-marketing-strategies-for-2026',
      excerpt: "Discover the cutting-edge marketing strategies that will dominate 2026 and help your brand stand out in a crowded marketplace.",
      content: "The future of marketing is here, and it's more disruptive than ever. From AI-powered personalization to community-driven campaigns, these are the strategies that will define success in 2026. Brands that adapt will thrive, while those that cling to old methods will be left behind.",
      author: 'Miss Erin',
      authorImage: '/blog-author-2.png',
      readTime: '6 min read',
      views: 432,
      status: 'DRAFT' as const,
      featured: false,
      categories: ['Trends', 'Strategy', 'Future of Marketing'],
    },
  ];

  for (const post of samplePosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log('✅ Sample blog posts created');

  // Seed sample waitlist entries
  const sampleWaitlist = [
    { name: 'Tunde Bakare', email: 'tunde@email.com', notified: true },
    { name: 'Amina Hassan', email: 'amina.hassan@email.com', notified: true },
    { name: 'Chidi Okonkwo', email: 'chidi.o@email.com', notified: false },
    { name: 'Fatima Yusuf', email: 'fatima.yusuf@email.com', notified: true },
    { name: 'Emeka Nwosu', email: 'emeka.nwosu@email.com', notified: false },
  ];

  for (const entry of sampleWaitlist) {
    await prisma.waitlistEntry.upsert({
      where: { email: entry.email },
      update: {},
      create: entry,
    });
  }

  console.log('✅ Sample waitlist entries created');

  // Seed sample consultations
  const sampleConsultations = [
    {
      fullName: 'Sarah Johnson',
      email: 'sarah@techstart.com',
      company: 'TechStart Inc',
      phone: '+234 801 234 5678',
      projectDetails: 'Looking for comprehensive brand strategy and social media management for our new product launch.',
      status: 'PENDING' as const,
    },
    {
      fullName: 'David Chen',
      email: 'david@growthlab.com',
      company: 'GrowthLab',
      phone: '+234 802 345 6789',
      projectDetails: 'Need digital marketing services to increase online visibility and drive conversions.',
      status: 'CONTACTED' as const,
    },
    {
      fullName: 'Amara Okafor',
      email: 'amara@nnamdifoods.ng',
      company: 'Nnamdi Foods',
      phone: '+234 803 456 7890',
      projectDetails: 'Interested in content creation and photography for our food products.',
      status: 'CONVERTED' as const,
    },
  ];

  for (const consultation of sampleConsultations) {
    await prisma.consultationRequest.create({
      data: consultation,
    });
  }

  console.log('✅ Sample consultation requests created');

  console.log('\n🎉 Seeding completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
