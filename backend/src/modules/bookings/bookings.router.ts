import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import {
  getSeats,
  createBooking,
  myTickets,
  cancelBooking,
  scanTicket,
} from './bookings.controller';

const router = Router();

// ─── Public (authenticated) ────────────────────────────────────────────────────

// GET seat availability for a screening — any authenticated user can view
router.get(
  '/screenings/:screeningId/seats',
  authenticate,
  getSeats
);

// ─── Student routes ────────────────────────────────────────────────────────────

// POST book a ticket
router.post(
  '/',
  authenticate,
  requireRole('STUDENT'),
  createBooking
);

// GET my tickets (with QR codes)
router.get(
  '/my-tickets',
  authenticate,
  requireRole('STUDENT'),
  myTickets
);

// DELETE cancel a ticket
router.delete(
  '/:ticketId',
  authenticate,
  requireRole('STUDENT'),
  cancelBooking
);

// ─── Guard routes ──────────────────────────────────────────────────────────────

// POST scan a QR code at venue entry
router.post(
  '/scan',
  authenticate,
  requireRole('GUARD'),
  scanTicket
);

export default router;
