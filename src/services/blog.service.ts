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

  async getPublishedPosts(params?: {
    page?: number;
    limit?: number;
    featured?: boolean;
    category?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { status: 'PUBLISHED' };
    
    if (params?.featured !== undefined) {
      where.featured = params.featured;
    }

    if (params?.category) {
      where.categories = {
        has: params.category,
      };
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    featured?: boolean;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (params?.status) {
      where.status = params.status.toUpperCase() as BlogPostStatus;
    }

    if (params?.featured !== undefined) {
      where.featured = params.featured;
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
      
      // Set publishedAt when publishing
      if (data.status === 'published') {
        const existing = await this.getById(id);
        if (existing && !existing.publishedAt) {
          updateData.publishedAt = new Date();
        }
      } else if (data.status === 'draft') {
        updateData.publishedAt = null;
      }
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
