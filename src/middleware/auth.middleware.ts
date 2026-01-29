import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';

/**
 * Authentication Middleware - Phase 2 (Authorization header)
 * Reads JWT from Authorization header, not cookies
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please login.', 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = verifyToken(token);
    } catch (error) {
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
 * Optional Authentication Middleware
 * Attaches admin if token is valid, but doesn't fail if missing
 * Useful for public routes that have admin-only features
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    // No token? That's fine, continue without admin
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    // Try to verify token
    let decoded: JWTPayload;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      // Invalid token? Continue without admin
      return next();
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

    // Attach admin if found
    if (admin) {
      (req as any).admin = admin;
      (req as any).tokenPayload = decoded;
    }

    next();
  } catch (error) {
    // Any error? Just continue without admin
    next();
  }
};

/**
 * Backward compatibility export
 */
export const authenticate = authMiddleware;
