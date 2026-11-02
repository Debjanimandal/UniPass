import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { getUsers, getUser, addUser, editUser } from './users.controller';

const router = Router();

// All user-management routes are ADMIN-only.
router.get('/', authenticate, requireRole('ADMIN'), getUsers);
router.get('/:id', authenticate, requireRole('ADMIN'), getUser);
router.post('/', authenticate, requireRole('ADMIN'), addUser);
router.patch('/:id', authenticate, requireRole('ADMIN'), editUser);

export default router;
