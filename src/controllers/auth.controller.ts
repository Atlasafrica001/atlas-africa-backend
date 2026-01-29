import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';

const authService = new AuthService();

export class AuthController {
  [x: string]: any;
  /**
   * Login - With debug logging
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 LOGIN ATTEMPT');
    console.log('Body received:', JSON.stringify(req.body));
    console.log('Email:', req.body.email);
    console.log('Password length:', req.body.password?.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const { email, password } = req.body;

      console.log('✅ Calling auth service...');
      const result = await authService.login(email, password);
      
      console.log('✅ Auth service succeeded');
      console.log('Token generated:', result.token ? 'YES' : 'NO');

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ LOGIN ERROR');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      console.log('Error statusCode:', error.statusCode);
      console.log('Full error:', JSON.stringify(error, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      throw error; // Re-throw for error middleware
    }
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Logout successful'
      }
    });
  });

  getCurrentAdmin = asyncHandler(async (req: Request, res: Response) => {
    const admin = (req as any).admin;

    res.status(200).json({
      success: true,
      data: { admin }
    });
  });
}