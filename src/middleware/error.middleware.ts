import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { getRequestId } from './requestId.middleware';

/**
 * Global Error Handler Middleware
 * Catches all errors, logs them, and sends appropriate responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = getRequestId(req);
  
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOG ERROR (Always log, never expose to client)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ ERROR CAUGHT');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('Request ID:', requestId);
  console.error('Timestamp:', new Date().toISOString());
  console.error('Method:', req.method);
  console.error('Path:', req.path);
  console.error('IP:', req.ip);
  console.error('Type:', err.constructor.name);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CATEGORIZE ERROR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 1. AppError (our custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  
  // 2. Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));
    
    console.error('🔴 VALIDATION ERRORS:', JSON.stringify(details, null, 2));
  }
  
  // 3. Prisma Known Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    
    console.error('🔴 PRISMA ERROR:');
    console.error('   Code:', err.code);
    console.error('   Meta:', JSON.stringify(err.meta, null, 2));
    console.error('   Client Version:', err.clientVersion);
    
    switch (err.code) {
      case 'P2002':
        message = 'A record with this value already exists';
        details = { 
          field: err.meta?.target,
          code: err.code 
        };
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      case 'P2021':
        message = 'Table does not exist in database';
        statusCode = 500;
        details = { 
          code: err.code,
          hint: 'Database migration may be needed'
        };
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        break;
      default:
        message = 'Database operation failed';
        details = { code: err.code };
    }
  }
  
  // 4. Prisma Validation Errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided to database';
    console.error('🔴 PRISMA VALIDATION ERROR:', err.message);
  }
  
  // 5. Prisma Initialization Errors
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = 'Database connection failed';
    console.error('🔴 PRISMA INIT ERROR:');
    console.error('   Error code:', err.errorCode);
    console.error('   Message:', err.message);
  }
  
  // 6. Prisma Rust Panic
  else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    message = 'Database engine crashed';
    console.error('🔴 PRISMA RUST PANIC:', err.message);
  }

  // 7. JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }
  
  // 8. Multer Errors (File Upload)
  else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    details = { type: (err as any).code };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SEND RESPONSE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const response: any = {
    success: false,
    error: message,
    requestId, // Include request ID for debugging
  };

  // Add details if available
  if (details) {
    response.details = details;
  }

  // In development, add extra debug info
  if (process.env.NODE_ENV === 'development') {
    response.debug = {
      type: err.constructor.name,
      message: err.message,
      // DO NOT include stack trace even in development
      // Stack traces should only be in logs
    };
  }

  // Send response
  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 * Catches all routes that don't exist
 */
export const notFoundHandler = (
  req: Request,
  res: Response
) => {
  const requestId = getRequestId(req);
  
  console.warn(`⚠️ [${requestId}] 404 Not Found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    requestId
  });
};
