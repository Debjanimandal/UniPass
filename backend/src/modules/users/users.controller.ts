import { Request, Response } from 'express';
import { sendSuccess, Errors } from '../../utils/response';
import {
  CreateUserSchema,
  UpdateUserSchema,
  listUsers,
  getUserDetail,
  createUser,
  updateUser,
} from './users.service';

// GET /api/users
export async function getUsers(_req: Request, res: Response): Promise<void> {
  try {
    const result = await listUsers();
    sendSuccess(res, result, 'Users retrieved successfully.');
  } catch (err) {
    console.error('[getUsers]', err);
    Errors.internal(res);
  }
}

// GET /api/users/:id
export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      Errors.validation(res, 'Invalid user id.');
      return;
    }
    const user = await getUserDetail(id);
    sendSuccess(res, user, 'User retrieved successfully.');
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'NOT_FOUND') {
      Errors.notFound(res, 'User');
    } else {
      console.error('[getUser]', err);
      Errors.internal(res);
    }
  }
}

// POST /api/users
export async function addUser(req: Request, res: Response): Promise<void> {
  try {
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { fields[e.path.join('.')] = e.message; });
      Errors.validation(res, 'Validation failed. Please check the fields.', fields);
      return;
    }
    const user = await createUser(parsed.data);
    sendSuccess(res, user, 'User created successfully.', 201);
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'EMAIL_TAKEN') {
      Errors.conflict(res, e.message || 'Email already in use.');
    } else {
      console.error('[addUser]', err);
      Errors.internal(res);
    }
  }
}

// PATCH /api/users/:id
export async function editUser(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      Errors.validation(res, 'Invalid user id.');
      return;
    }
    const parsed = UpdateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { fields[e.path.join('.')] = e.message; });
      Errors.validation(res, 'Validation failed. Please check the fields.', fields);
      return;
    }
    const user = await updateUser(id, parsed.data);
    sendSuccess(res, user, 'User updated successfully.');
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === 'NOT_FOUND') {
      Errors.notFound(res, 'User');
    } else {
      console.error('[editUser]', err);
      Errors.internal(res);
    }
  }
}
