import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { asyncHandler } from '../utils/asyncHandler';

const adminService = new AdminService();

export class AdminController {
  /**
   * Get dashboard statistics
   */
  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  });

  /**
   * Get recent activity
   */
  getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const activity = await adminService.getRecentActivity(limit);

    res.status(200).json({
      success: true,
      data: { activity }
    });
  });

  /**
   * Get top posts
   */
  getTopPosts = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const posts = await adminService.getTopPosts(limit);

    res.status(200).json({
      success: true,
      data: { posts }
    });
  });

  /**
   * Get posts by status
   */
  getPostsByStatus = asyncHandler(async (req: Request, res: Response) => {
    const statusData = await adminService.getPostsByStatus();

    res.status(200).json({
      success: true,
      data: { statusData }
    });
  });

  /**
   * Get category statistics
   */
  getCategoryStats = asyncHandler(async (req: Request, res: Response) => {
    const categories = await adminService.getCategoryStats();

    res.status(200).json({
      success: true,
      data: { categories }
    });
  });

  /**
   * Get posting trends
   */
  getPostingTrends = asyncHandler(async (req: Request, res: Response) => {
    const trends = await adminService.getPostingTrends();

    res.status(200).json({
      success: true,
      data: { trends }
    });
  });
}
