import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Authenticate admin and return JWT token
   */
  async login(email: string, password: string) {
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      }
    });

    // Check if admin exists
    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      email: admin.email
    });

    // Return token and admin info (without password)
    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    };
  }
}
