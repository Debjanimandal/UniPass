import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import {
  listScreenings,
  getScreening,
  addScreening,
  addBulkScreenings,
  editScreening,
  removeScreening,
} from './screenings.controller';

const router = Router();

// Public / any authenticated user can list/view screenings
router.get('/', listScreenings);
router.get('/:id', getScreening);

// Only ADMIN can modify
router.post('/', authenticate, requireRole('ADMIN'), addScreening);
router.post('/bulk', authenticate, requireRole('ADMIN'), addBulkScreenings);
router.patch('/:id', authenticate, requireRole('ADMIN'), editScreening);
router.delete('/:id', authenticate, requireRole('ADMIN'), removeScreening);

export default router;
