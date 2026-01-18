import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.util';

/**
 * Validation middleware factory
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        sendError(res, 'VALIDATION_ERROR', 'Invalid input', 422, details);
        return;
      }

      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 422);
    }
  };
};
