import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';

const authService = new AuthService();

export class AuthController {
  /**
   * Login - Set JWT in httpOnly cookie
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Authenticate user
    const { token, admin } = await authService.login(email, password);

    // Set cookie with secure options
    res.cookie('authToken', token, {
      httpOnly: true,           // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',       // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      domain: process.env.COOKIE_DOMAIN, // Optional: .yourdomain.com for subdomains
    });

    // Return admin info (without token in body for extra security)
    res.status(200).json({
      success: true,
      data: {
        admin,
        message: 'Login successful'
      }
    });
  });

  /**
   * Logout - Clear the cookie
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

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

  /**
   * Refresh Token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).admin; // From auth middleware

    // Generate new token
    const { generateToken } = require('../utils/jwt');
    const newToken = generateToken({
      id: admin.id,
      email: admin.email
    });

    // Set new cookie
    res.cookie('authToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Token refreshed successfully'
      }
    });
  });
}
