import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

const authService = new AuthService();

export class AuthController {
  refreshToken(arg0: string, authMiddleware: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: import("express").NextFunction) => Promise<void>, refreshToken: any) {
    throw new Error('Method not implemented.');
  }
  /**
   * Login - Return JWT in response body (Phase 2 compatible)
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Authenticate user
    const { token, admin } = await authService.login(email, password);

    // Return token in response body (Phase 2 - localStorage)
    res.status(200).json({
      success: true,
      data: {
        token,
        admin
      }
    });
  });

  /**
   * Logout - Just returns success (token removed on frontend)
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Logout successful'
      }
    });
  });

  /**
   * Get Current Admin
   */
  getCurrentAdmin = asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).admin; // Set by auth middleware

    res.status(200).json({
      success: true,
      data: { admin }
    });
  });
}