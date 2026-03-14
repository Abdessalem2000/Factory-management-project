import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Authentication middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid token or user deactivated.'
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
      return;
    }
    next(error);
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user?.id);
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found or deactivated.'
        });
      }

      // Admin has all permissions
      if (user.role === 'admin') {
        return next();
      }

      // Check specific permission
      if (!user.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
