import { prisma } from '../config/database';
import { comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { LoginCredentials } from '../types/request.types';

export class AuthService {
  async login(credentials: LoginCredentials) {
    const admin = await prisma.admin.findUnique({
      where: { email: credentials.email },
    });

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(credentials.password, admin.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
    });

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    };
  }

  async verifyAdmin(adminId: number) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });

    return admin;
  }
}

export default new AuthService();
