import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware
 * Generates or extracts a unique ID for each request
 * Adds it to request object and response headers for tracing
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get request ID from header (if provided by client) or generate new one
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  
  // Attach to request object for use in logging/error handling
  (req as any).id = requestId;
  
  // Send back in response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log the request with ID
  const timestamp = new Date().toISOString();
  console.log(`[${requestId}] ${timestamp} ${req.method} ${req.path} - IP: ${req.ip}`);
  
  next();
};

/**
 * Helper to get request ID from request object
 */
export const getRequestId = (req: Request): string => {
  return (req as any).id || 'unknown';
};
