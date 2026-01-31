import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';

export class BlogService {
  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Create blog post
   */
  async createPost(data: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    author?: string;
    categories?: string[];
    publishedAt?: Date;
  }) {
    const slug = this.generateSlug(data.title);

    // Check if slug already exists
    const existing = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existing) {
      throw new AppError('A post with this title already exists', 409);
    }

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || this.generateExcerpt(data.content),
        coverImage: data.coverImage,
        author: data.author || 'Atlas Africa',
        categories: data.categories || [],
        status: data.publishedAt ? 'PUBLISHED' : 'DRAFT',
        publishedAt: data.publishedAt || null,
      }
    });

    return post;
  }

  /**
   * Get all posts (with optional status filter and category filter)
   */
  async getAllPosts(publishedOnly?: boolean, category?: string) {
    const posts = await prisma.blogPost.findMany({
      where: {
        ...(publishedOnly ? { status: 'PUBLISHED' } : {}),
        ...(category ? { categories: { has: category } } : {})
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        author: true,
        categories: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        views: true,
        readTime: true,
        featured: true,
      }
    });

    // Transform to match frontend expectations
    return posts.map(post => ({
      ...post,
      featuredImage: post.coverImage, // Alias for frontend
      published: post.status === 'PUBLISHED', // Alias for frontend
      category: post.categories[0] || null, // First category for backwards compatibility
    }));
  }

  /**
   * Get single post by slug
   */
  async getPostBySlug(slug: string, includeUnpublished: boolean = false) {
    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    if (post.status !== 'PUBLISHED' && !includeUnpublished) {
      throw new AppError('Blog post not found', 404);
    }

    // Increment views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });

    return {
      ...post,
      featuredImage: post.coverImage,
      published: post.status === 'PUBLISHED',
      category: post.categories[0] || null,
    };
  }

  /**
   * Get single post by ID (admin)
   */
  async getPostById(id: number) {
    const post = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    return {
      ...post,
      featuredImage: post.coverImage,
      published: post.status === 'PUBLISHED',
      category: post.categories[0] || null,
    };
  }

  /**
   * Update post
   */
  async updatePost(id: number, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    coverImage?: string;
    author?: string;
    categories?: string[];
    publishedAt?: Date;
  }) {
    const post = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    // Generate new slug if title changed
    let slug = post.slug;
    if (data.title && data.title !== post.title) {
      slug = this.generateSlug(data.title);

      // Check if new slug conflicts
      const existing = await prisma.blogPost.findUnique({
        where: { slug }
      });

      if (existing && existing.id !== id) {
        throw new AppError('A post with this title already exists', 409);
      }
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        slug,
        excerpt: data.excerpt || (data.content ? this.generateExcerpt(data.content) : post.excerpt),
      }
    });

    return {
      ...updated,
      featuredImage: updated.coverImage,
      published: updated.status === 'PUBLISHED',
      category: updated.categories[0] || null,
    };
  }

  /**
   * Delete post
   */
  async deletePost(id: number) {
    const post = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    await prisma.blogPost.delete({
      where: { id }
    });

    return { message: 'Blog post deleted successfully' };
  }

  /**
   * Toggle publish status
   */
  async togglePublish(id: number) {
    const post = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const publishedAt = newStatus === 'PUBLISHED' ? new Date() : null;

    const updated = await prisma.blogPost.update({
      where: { id },
      data: { 
        status: newStatus,
        publishedAt
      }
    });

    return {
      ...updated,
      featuredImage: updated.coverImage,
      published: updated.status === 'PUBLISHED',
      category: updated.categories[0] || null,
    };
  }

  /**
   * Get all unique categories
   */
  async getAllCategories(): Promise<string[]> {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { categories: true }
    });

    const allCategories = posts.flatMap(post => post.categories);
    return [...new Set(allCategories)].sort();
  }

  /**
   * Generate excerpt from content (first 160 chars)
   */
  private generateExcerpt(content: string): string {
    const plain = content.replace(/<[^>]*>/g, '');
    return plain.length > 160 
      ? plain.substring(0, 160) + '...' 
      : plain;
  }
}
