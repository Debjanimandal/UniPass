import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import {
  listSeats,
  addBulkSeats,
  editSeat,
  removeSeat,
} from './seats.controller';

const router = Router();

// GET all seats for a screen (public or student allowed? Usually anyone can view layout to book)
router.get('/', listSeats);

// Only ADMIN can modify
router.post('/bulk', authenticate, requireRole('ADMIN'), addBulkSeats);
router.patch('/:id', authenticate, requireRole('ADMIN'), editSeat);
router.delete('/:id', authenticate, requireRole('ADMIN'), removeSeat);

export default router;
