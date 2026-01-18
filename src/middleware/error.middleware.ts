import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

/**
 * Global error handler middleware
 * Catches all unhandled errors and sends structured error response
 */
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'field';
      sendError(
        res,
        'DUPLICATE_ENTRY',
        `${field} already exists`,
        409
      );
      return;
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      sendError(res, 'NOT_FOUND', 'Resource not found', 404);
      return;
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    sendError(res, 'INVALID_TOKEN', 'Invalid token', 401);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendError(res, 'INVALID_TOKEN', 'Token expired', 401);
    return;
  }

  // Default error response
  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
    500
  );
};

/**
 * 404 Not Found handler
 * Should be registered after all routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 'NOT_FOUND', `Route ${req.originalUrl} not found`, 404);
};
