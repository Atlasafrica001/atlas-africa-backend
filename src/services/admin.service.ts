import { prisma } from '../lib/prisma';

export class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      waitlistCount,
      totalViews,
      recentPosts
    ] = await Promise.all([
      // Total posts
      prisma.blogPost.count(),
      
      // Published posts
      prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
      
      // Draft posts
      prisma.blogPost.count({ where: { status: 'DRAFT' } }),
      
      // Waitlist entries
      prisma.waitlist.count(),
      
      // Total post views
      prisma.blogPost.aggregate({
        _sum: { views: true }
      }),
      
      // Recent posts (last 7 days)
      prisma.blogPost.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    return {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
        recent: recentPosts
      },
      waitlist: waitlistCount,
      views: totalViews._sum.views || 0
    };
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(limit: number = 10) {
    const [recentPosts, recentWaitlist] = await Promise.all([
      // Recent blog posts
      prisma.blogPost.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          views: true
        }
      }),
      
      // Recent waitlist entries
      prisma.waitlist.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      })
    ]);

    // Combine and sort by date
    const activities = [
      ...recentPosts.map(post => ({
        type: 'post' as const,
        id: post.id,
        title: post.title,
        status: post.status,
        timestamp: post.createdAt,
        meta: { views: post.views }
      })),
      ...recentWaitlist.map(entry => ({
        type: 'waitlist' as const,
        id: entry.id,
        title: `${entry.name} joined waitlist`,
        status: 'NEW',
        timestamp: entry.createdAt,
        meta: { email: entry.email }
      }))
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return activities;
  }

  /**
   * Get top performing posts
   */
  async getTopPosts(limit: number = 5) {
    const topPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      orderBy: { views: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
        categories: true
      }
    });

    return topPosts;
  }

  /**
   * Get posts by status breakdown
   */
  async getPostsByStatus() {
    const posts = await prisma.blogPost.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    return posts.map(group => ({
      status: group.status,
      count: group._count.status
    }));
  }

  /**
   * Get category distribution
   */
  async getCategoryStats() {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { categories: true }
    });

    // Count posts per category
    const categoryCount: Record<string, number> = {};
    posts.forEach(post => {
      post.categories.forEach(category => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get posting trends (last 30 days)
   */
  async getPostingTrends() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const posts = await prisma.blogPost.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        createdAt: true,
        status: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by date
    const trendData: Record<string, { published: number; drafts: number }> = {};
    
    posts.forEach(post => {
      const date = post.createdAt.toISOString().split('T')[0];
      if (!trendData[date]) {
        trendData[date] = { published: 0, drafts: 0 };
      }
      if (post.status === 'PUBLISHED') {
        trendData[date].published++;
      } else {
        trendData[date].drafts++;
      }
    });

    return Object.entries(trendData).map(([date, data]) => ({
      date,
      ...data
    }));
  }
}
