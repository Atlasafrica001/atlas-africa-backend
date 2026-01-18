import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/request.types';
import { verifyToken } from '../utils/jwt.util';
import { sendError } from '../utils/response.util';
import { prisma } from '../config/database';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches admin to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'UNAUTHORIZED', 'No token provided', 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      sendError(res, 'INVALID_TOKEN', 'Invalid or expired token', 401);
      return;
    }

    // Verify admin exists in database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, email: true, name: true },
    });

    if (!admin) {
      sendError(res, 'INVALID_TOKEN', 'Admin not found', 401);
      return;
    }

    // Attach admin to request
    req.admin = decoded;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    sendError(res, 'UNAUTHORIZED', 'Authentication failed', 401);
  }
};
