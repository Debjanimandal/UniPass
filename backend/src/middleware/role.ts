import { Request, Response, NextFunction } from 'express';
import { Errors } from '../utils/response';

/**
 * Role-based authorization middleware factory.
 * Usage: router.get('/admin', authenticate, requireRole('ADMIN'), handler)
 *
 * @param roles - One or more allowed roles
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      Errors.unauthorized(res);
      return;
    }

    if (!roles.includes(req.user.role)) {
      Errors.forbidden(res);
      return;
    }

    next();
  };
}
