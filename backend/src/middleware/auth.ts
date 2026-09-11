import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, AuthTokenPayload } from '../utils/jwt';
import { Errors } from '../utils/response';

// Extend Express Request to carry decoded user
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

/**
 * JWT authentication middleware.
 * Extracts Bearer token from Authorization header,
 * verifies it, and attaches decoded payload to req.user.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    Errors.unauthorized(res);
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyAuthToken(token);
    req.user = payload;
    next();
  } catch {
    Errors.unauthorized(res);
  }
}
