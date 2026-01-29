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
    published?: boolean;
    featuredImage?: string;
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
        published: data.published || false,
        featuredImage: data.featuredImage,
      }
    });

    return post;
  }

  /**
   * Get all posts (with optional published filter)
   */
  async getAllPosts(published?: boolean) {
    const posts = await prisma.blogPost.findMany({
      where: published !== undefined ? { published } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return posts;
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

    if (!post.published && !includeUnpublished) {
      throw new AppError('Blog post not found', 404);
    }

    return post;
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

    return post;
  }

  /**
   * Update post
   */
  async updatePost(id: number, data: {
    title?: string;
    content?: string;
    excerpt?: string;
    published?: boolean;
    featuredImage?: string;
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

    return updated;
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

    const updated = await prisma.blogPost.update({
      where: { id },
      data: { published: !post.published }
    });

    return updated;
  }

  /**
   * Generate excerpt from content (first 160 chars)
   */
  private generateExcerpt(content: string): string {
    // Strip HTML tags and get first 160 characters
    const plain = content.replace(/<[^>]*>/g, '');
    return plain.length > 160 
      ? plain.substring(0, 160) + '...' 
      : plain;
  }
}
