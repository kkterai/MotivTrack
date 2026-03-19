import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../../types/index.js';

/**
 * Middleware to check if user has required role(s)
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is a parent (Admin or Delivery)
 */
export const requireParent = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  const parentRoles: Role[] = ['admin_parent', 'delivery_parent'];
  
  if (!parentRoles.includes(req.user.role)) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Parent access required',
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user is an Admin Parent (full permissions)
 */
export const requireAdminParent = requireRole('admin_parent');

/**
 * Middleware to check if user is a Child
 */
export const requireChild = requireRole('child');

/**
 * Middleware to check if user is a Teacher
 */
export const requireTeacher = requireRole('teacher');
