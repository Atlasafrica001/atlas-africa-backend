import { Request, Response } from 'express';
import { AuthRequest } from '../types/request.types';
import { sendSuccess, sendError } from '../utils/response.util';
import authService from '../services/auth.service';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'Invalid credentials') {
        sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401);
      } else {
        sendError(res, 'INTERNAL_SERVER_ERROR', 'Login failed', 500);
      }
    }
  }

  async verify(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
        return;
      }

      const admin = await authService.verifyAdmin(req.admin.adminId);

      if (!admin) {
        sendError(res, 'INVALID_TOKEN', 'Admin not found', 401);
        return;
      }

      sendSuccess(res, { valid: true, admin });
    } catch (error: any) {
      console.error('Verify error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Verification failed', 500);
    }
  }
}

export default new AuthController();
