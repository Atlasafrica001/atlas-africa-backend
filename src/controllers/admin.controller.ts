import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../lib/prisma';

export class AdminController {
  /**
   * Get dashboard stats
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    // Get counts from database
    const [waitlistCount, blogCount, publishedBlogCount] = await Promise.all([
      prisma.waitlist.count(),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        waitlist: waitlistCount,
        blog: {
          total: blogCount,
          published: publishedBlogCount,
          drafts: blogCount - publishedBlogCount
        }
      }
    });
  });

  /**
   * Upload file (placeholder - implement with your upload service)
   */
  uploadFile = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement file upload logic
    // This is a placeholder
    res.status(501).json({
      success: false,
      error: 'File upload not implemented yet'
    });
  });

  /**
   * Get waitlist entries
   */
  getWaitlist = asyncHandler(async (req: Request, res: Response) => {
    const entries = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: { entries, total: entries.length }
    });
  });

  /**
   * Delete waitlist entry
   */
  deleteWaitlistEntry = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.waitlist.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      data: { message: 'Entry deleted' }
    });
  });
}