import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export interface JwtPayload {
  adminId: number;
  email: string;
}

/**
 * Generate JWT token
 * @param payload Token payload
 * @returns JWT token string
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

/**
 * Verify JWT token
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
