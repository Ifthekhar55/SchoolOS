import { Request, Response } from 'express';
import AuthService from '../services/authService';

const setAuthCookie = (res: Response, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      const result = await AuthService.login(email, password);
      setAuthCookie(res, result.refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: result.token,
        user: result.user,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('deactivated')) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'An error occurred during login',
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      setAuthCookie(res, result.refreshToken);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        token: result.token,
        user: result.user,
      });
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'An error occurred during registration',
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const isProduction = process.env.NODE_ENV === 'production';
      if (userId) {
        await AuthService.logout(userId);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        path: '/',
      });

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred during logout',
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const result = await AuthService.refreshToken(refreshToken);
      setAuthCookie(res, result.refreshToken);

      return res.status(200).json({
        success: true,
        token: result.token,
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);

      if (error.message.includes('Invalid refresh token')) {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'An error occurred while refreshing token',
      });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const user = await AuthService.getCurrentUser(userId);

      return res.status(200).json({
        success: true,
        ...user,
      });
    } catch (error: any) {
      console.error('Get current user error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching user',
      });
    }
  }
}

export default new AuthController();