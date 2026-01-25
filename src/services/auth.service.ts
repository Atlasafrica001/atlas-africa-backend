import { prisma } from '../lib/prisma';
import { generateToken } from '../utils/jwt';
import { comparePassword } from '../utils/password.utils';
import { AppError } from '../utils/errors';

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
        createdAt: true,
        updatedAt: true,
      }
    });

    // Always use constant-time comparison to prevent timing attacks
    // Check password even if admin doesn't exist (prevents user enumeration)
    const hashedPassword = admin?.password || '$2b$12$dummy.hash.to.prevent.timing.attacks';
    const isPasswordValid = await comparePassword(password, hashedPassword);

    // Check if admin exists AND password is valid
    if (!admin || !isPasswordValid) {
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
        email: admin.email,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      }
    };
  }

  /**
   * Get admin by ID (for /me endpoint)
   */
  async getAdminById(id: number) {
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    return admin;
  }
}
