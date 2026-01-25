import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { AppError } from '../utils/errors';
import { prisma } from '../lib/prisma';

/**
 * Authentication Middleware
 * Verifies JWT token from httpOnly cookie
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookie (not from Authorization header anymore)
    const token = req.cookies.authToken;

    if (!token) {
      throw new AppError('Authentication required. Please login.', 401);
    }

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      // Token invalid or expired
      res.clearCookie('authToken'); // Clear invalid cookie
      throw new AppError('Invalid or expired token. Please login again.', 401);
    }

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!admin) {
      res.clearCookie('authToken');
      throw new AppError('Admin account not found.', 401);
    }

    // Attach admin to request object
    (req as any).admin = admin;
    (req as any).tokenPayload = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Auth Middleware
 * Doesn't fail if no token, just doesn't set req.admin
 * Useful for endpoints that work with or without auth
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.authToken;

    if (token) {
      try {
        const decoded = verifyToken(token);
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, createdAt: true, updatedAt: true }
        });

        if (admin) {
          (req as any).admin = admin;
          (req as any).tokenPayload = decoded;
        }
      } catch (error) {
        // Invalid token, but don't fail - just continue without auth
        console.warn('Optional auth failed:', error);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
