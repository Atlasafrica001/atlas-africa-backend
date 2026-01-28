import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Validation Middleware
 * Shows detailed validation errors
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Log what we're validating
      console.log('🔍 Validating request body:', JSON.stringify(req.body));
      
      // Validate
      await schema.parseAsync(req.body);
      
      console.log('✅ Validation passed');
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Log detailed validation errors
        console.error('❌ Validation failed:');
        error.errors.forEach(err => {
          console.error(`   - Field: ${err.path.join('.')} | ${err.message}`);
        });
        
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        // Pass to error handler with details
        const validationError = new Error('Validation failed') as any;
        validationError.statusCode = 422;
        validationError.details = errors;
        validationError.isValidation = true;
        
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};