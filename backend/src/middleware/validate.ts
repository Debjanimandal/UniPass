import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { Errors } from '../utils/response';

/**
 * Zod request body validation middleware factory.
 * Usage: router.post('/path', validate(MySchema), handler)
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fields: Record<string, string> = {};
      const zodError = result.error as ZodError;
      
      for (const issue of zodError.issues) {
        const field = issue.path.join('.');
        if (field) fields[field] = issue.message;
      }

      Errors.validation(
        res,
        'Validation failed. Please check the highlighted fields.',
        fields
      );
      return;
    }

    // Replace req.body with the validated (and potentially transformed) data
    req.body = result.data;
    next();
  };
}
