import { Router } from 'express';
import { register, login, me, updateMe } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from './auth.service';

const router = Router();

// POST /api/auth/register — Public
router.post('/register', validate(RegisterSchema), register);

// POST /api/auth/login — Public
router.post('/login', validate(LoginSchema), login);

// GET /api/auth/me — Protected (any authenticated role)
router.get('/me', authenticate, me);

// PATCH /api/auth/me — Protected (update own profile)
router.patch('/me', authenticate, validate(UpdateProfileSchema), updateMe);

export default router;
