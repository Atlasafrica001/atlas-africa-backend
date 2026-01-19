import jwt, { SignOptions } from 'jsonwebtoken';
import { AppError } from './errors';

interface JWTPayload {
  id: number;
  email: string;
}

/**
 * Generate JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new AppError('JWT_SECRET is not defined', 500);
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const options: SignOptions = {
    expiresIn: typeof expiresIn === 'string' && /^\d+$/.test(expiresIn)
      ? parseInt(expiresIn, 10)
      : expiresIn as SignOptions['expiresIn'],
    issuer: 'atlas-africa-api',
  };

  return jwt.sign(payload, secret, options);



};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new AppError('JWT_SECRET is not defined', 500);
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401);
    }
    throw new AppError('Token verification failed', 401);
  }
};
