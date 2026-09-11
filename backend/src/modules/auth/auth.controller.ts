import { Request, Response } from 'express';
import { registerUser, loginUser, getMe } from './auth.service';
import { sendSuccess, Errors } from '../../utils/response';

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await registerUser(req.body);
    sendSuccess(res, result, 'Account created successfully.', 201);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'EMAIL_TAKEN') {
      Errors.conflict(res, e.message || 'Email already in use.');
    } else {
      console.error('[register]', err);
      Errors.internal(res);
    }
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await loginUser(req.body);
    sendSuccess(res, result, 'Logged in successfully.');
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (
      e.code === 'INVALID_CREDENTIALS' ||
      e.code === 'ACCOUNT_DISABLED'
    ) {
      Errors.validation(res, e.message || 'Invalid credentials.');
    } else {
      console.error('[login]', err);
      Errors.internal(res);
    }
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const user = await getMe(req.user!.sub);
    sendSuccess(res, user, 'User retrieved successfully.');
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'USER_NOT_FOUND') {
      Errors.notFound(res, 'User');
    } else {
      console.error('[me]', err);
      Errors.internal(res);
    }
  }
}
