import { Response } from 'express';
import { AuthRequest } from '../types/request.types';
import { sendSuccess, sendError } from '../utils/response.util';
import adminService from '../services/admin.service';
import { WaitlistService } from '../services/waitlist.service';
import consultationService from '../services/consultation.service';
import blogService from '../services/blog.service';
import uploadService from '../services/upload.service';

export class AdminController {
  // Stats endpoint
  async getStats(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await adminService.getStats();
      sendSuccess(res, stats);
    } catch (error: any) {
      console.error('Get stats error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to fetch stats', 500);
    }
  }

  // Waitlist endpoints
  async getWaitlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const notified = req.query.notified === 'true' ? true : req.query.notified === 'false' ? false : undefined;

      const result = await WaitlistService.getAll({ page, limit, notified });
      const stats = await WaitlistService.getStats();

      sendSuccess(res, Object.assign({}, result, { stats }));
    } catch (error: any) {
      console.error('Get waitlist error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to fetch waitlist', 500);
    }
  }

  async notifyWaitlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const entry = await WaitlistService.markAsNotified(id);
      sendSuccess(res, entry, 'User marked as notified');
    } catch (error: any) {
      console.error('Notify waitlist error:', error);
      if (error.code === 'P2025') {
        sendError(res, 'NOT_FOUND', 'Waitlist entry not found', 404);
      } else {
        sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to update waitlist entry', 500);
      }
    }
  }

  async deleteWaitlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await WaitlistService.delete(id);
      sendSuccess(res, null, 'Waitlist entry deleted successfully');
    } catch (error: any) {
      console.error('Delete waitlist error:', error);
      if (error.code === 'P2025') {
        sendError(res, 'NOT_FOUND', 'Waitlist entry not found', 404);
      } else {
        sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to delete waitlist entry', 500);
      }
    }
  }

  async exportWaitlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      const notified = req.query.notified === 'true' ? true : req.query.notified === 'false' ? false : undefined;
      const csv = await WaitlistService.exportToCsv(notified);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="waitlist-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error: any) {
      console.error('Export waitlist error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to export waitlist', 500);
    }
  }

  // Consultation endpoints
  async getConsultations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as string;

      const result = await consultationService.getAll({ page, limit, status });
      const stats = await consultationService.getStats();

      sendSuccess(res, { ...result, stats });
    } catch (error: any) {
      console.error('Get consultations error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to fetch consultations', 500);
    }
  }

  async getConsultation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const consultation = await consultationService.getById(id);

      if (!consultation) {
        sendError(res, 'NOT_FOUND', 'Consultation not found', 404);
        return;
      }

      sendSuccess(res, consultation);
    } catch (error: any) {
      console.error('Get consultation error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to fetch consultation', 500);
    }
  }

  async updateConsultationStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const consultation = await consultationService.updateStatus(id, req.body);
      sendSuccess(res, consultation, 'Consultation status updated successfully');
    } catch (error: any) {
      console.error('Update consultation status error:', error);
      if (error.code === 'P2025') {
        sendError(res, 'NOT_FOUND', 'Consultation not found', 404);
      } else {
        sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to update consultation', 500);
      }
    }
  }

  async exportConsultations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const status = req.query.status as string;
      const csv = await consultationService.exportToCsv(status);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="consultations-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error: any) {
      console.error('Export consultations error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to export consultations', 500);
    }
  }

  // Blog endpoints
  async getAllBlogPosts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const featured = req.query.featured === 'true';

      const result = await blogService.getAllPosts({
        page,
        limit,
        status,
        featured: req.query.featured ? featured : undefined,
      });
      const stats = await blogService.getStats();

      sendSuccess(res, { ...result, stats });
    } catch (error: any) {
      console.error('Get all blog posts error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to fetch blog posts', 500);
    }
  }

  async getBlogPost(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const post = await blogService.getById(id);

      if (!post) {
        sendError(res, 'NOT_FOUND', 'Blog post not found', 404);
        return;
      }

      sendSuccess(res, post);
    } catch (error: any) {
      console.error('Get blog post error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to fetch blog post', 500);
    }
  }

  async createBlogPost(req: AuthRequest, res: Response): Promise<void> {
    try {
      const post = await blogService.create(req.body);
      sendSuccess(res, post, 'Blog post created successfully', 201);
    } catch (error: any) {
      console.error('Create blog post error:', error);
      if (error.code === 'P2002') {
        sendError(res, 'DUPLICATE_SLUG', 'A post with this title already exists', 409);
      } else {
        sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to create blog post', 500);
      }
    }
  }

  async updateBlogPost(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const post = await blogService.update(id, req.body);
      sendSuccess(res, post, 'Blog post updated successfully');
    } catch (error: any) {
      console.error('Update blog post error:', error);
      if (error.code === 'P2025') {
        sendError(res, 'NOT_FOUND', 'Blog post not found', 404);
      } else if (error.code === 'P2002') {
        sendError(res, 'DUPLICATE_SLUG', 'A post with this title already exists', 409);
      } else {
        sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to update blog post', 500);
      }
    }
  }

  async deleteBlogPost(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await blogService.delete(id);
      sendSuccess(res, null, 'Blog post deleted successfully');
    } catch (error: any) {
      console.error('Delete blog post error:', error);
      if (error.code === 'P2025') {
        sendError(res, 'NOT_FOUND', 'Blog post not found', 404);
      } else {
        sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to delete blog post', 500);
      }
    }
  }

  // Upload endpoint
  async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'NO_FILE', 'No file uploaded', 400);
        return;
      }

      const folder = (req.body.folder as string) || 'atlas-africa';
      const result = await uploadService.uploadImage(req.file, folder);

      sendSuccess(res, {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      }, 'Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload image error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to upload image', 500);
    }
  }
}

export default new AdminController();
