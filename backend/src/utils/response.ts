import { Response } from 'express';

// ─── Success Response ────────────────────────────────────────────────────────

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

// ─── Error Response ──────────────────────────────────────────────────────────

export function sendError(
  res: Response,
  message: string,
  code: string,
  statusCode = 400,
  fields?: Record<string, string>
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(fields && { fields }),
    },
  });
}

// ─── Common Error Helpers ─────────────────────────────────────────────────────

export const Errors = {
  unauthorized: (res: Response) =>
    sendError(res, 'Authentication required. Please log in.', 'UNAUTHORIZED', 401),

  forbidden: (res: Response) =>
    sendError(res, 'You do not have permission to perform this action.', 'FORBIDDEN', 403),

  notFound: (res: Response, entity = 'Resource') =>
    sendError(res, `${entity} not found.`, 'NOT_FOUND', 404),

  conflict: (res: Response, message: string) =>
    sendError(res, message, 'CONFLICT', 409),

  internal: (res: Response) =>
    sendError(res, 'An internal server error occurred.', 'INTERNAL_ERROR', 500),

  validation: (res: Response, message: string, fields?: Record<string, string>) =>
    sendError(res, message, 'VALIDATION_ERROR', 400, fields),
};
