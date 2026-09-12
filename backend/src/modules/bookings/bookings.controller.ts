import { Request, Response } from 'express';
import { z } from 'zod';
import {
  getScreeningSeats,
  bookTicket,
  getMyTickets,
  cancelTicket,
  verifyAndScanTicket,
  BookTicketSchema,
} from './bookings.service';
import { Errors, sendError } from '../../utils/response';

// ─── Helper: map service errors to HTTP responses ────────────────────────────

function handleServiceError(res: Response, err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown error';

  const errorMap: Record<string, [number, string]> = {
    SCREENING_NOT_FOUND:        [404, 'Screening not found.'],
    SCREENING_INACTIVE:         [400, 'This screening is no longer available.'],
    SEAT_NOT_FOUND:             [404, 'Seat not found on this screen.'],
    SEAT_ALREADY_BOOKED:        [409, 'This seat is already booked. Please choose another.'],
    ALREADY_BOOKED_THIS_SCREENING: [409, 'You already have a booking for this screening.'],
    TICKET_NOT_FOUND:           [404, 'Ticket not found.'],
    TICKET_ALREADY_SCANNED:     [400, 'This ticket has already been scanned.'],
    TICKET_ALREADY_CANCELLED:   [400, 'This ticket is already cancelled.'],
    TICKET_CANCELLED:           [400, 'This ticket has been cancelled.'],
    INVALID_QR_TOKEN:           [400, 'Invalid or expired QR code.'],
    QR_MISMATCH:                [400, 'QR data does not match ticket record.'],
  };

  const [status, msg] = errorMap[message] ?? [500, 'An unexpected error occurred.'];
  res.status(status).json({ success: false, error: { code: message, message: msg } });
}

// ─── GET /api/bookings/screenings/:screeningId/seats ─────────────────────────
// Returns all seats for a screening, annotated with isBooked flag.

export async function getSeats(req: Request, res: Response) {
  const screeningId = parseInt(Array.isArray(req.params.screeningId) ? req.params.screeningId[0] : req.params.screeningId, 10);
  if (isNaN(screeningId)) return sendError(res, 'screeningId must be a number', 'BAD_REQUEST', 400);

  try {
    const data = await getScreeningSeats(screeningId);
    res.json({ success: true, data });
  } catch (err) {
    handleServiceError(res, err);
  }
}

// ─── POST /api/bookings ───────────────────────────────────────────────────────
// Books a seat for the authenticated student.
// Returns ticket details + QR code PNG as base64 data URL.

export async function createBooking(req: Request, res: Response) {
  if (!req.user) return Errors.unauthorized(res);

  const parsed = BookTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message },
    });
  }

  try {
    const result = await bookTicket(req.user.sub, parsed.data);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    handleServiceError(res, err);
  }
}

// ─── GET /api/bookings/my-tickets ─────────────────────────────────────────────
// Returns all tickets for the authenticated student, each with a QR code.

export async function myTickets(req: Request, res: Response) {
  if (!req.user) return Errors.unauthorized(res);

  try {
    const tickets = await getMyTickets(req.user.sub);
    res.json({ success: true, data: tickets });
  } catch (err) {
    handleServiceError(res, err);
  }
}

// ─── DELETE /api/bookings/:ticketId ───────────────────────────────────────────
// Cancels a ticket owned by the authenticated student.

export async function cancelBooking(req: Request, res: Response) {
  if (!req.user) return Errors.unauthorized(res);

  const ticketId = parseInt(Array.isArray(req.params.ticketId) ? req.params.ticketId[0] : req.params.ticketId, 10);
  if (isNaN(ticketId)) return sendError(res, 'ticketId must be a number', 'BAD_REQUEST', 400);

  try {
    const result = await cancelTicket(req.user.sub, ticketId);
    res.json({ success: true, data: result });
  } catch (err) {
    handleServiceError(res, err);
  }
}

// ─── POST /api/bookings/scan ──────────────────────────────────────────────────
// Guard endpoint: verify and mark a QR ticket as scanned.

export async function scanTicket(req: Request, res: Response) {
  if (!req.user) return Errors.unauthorized(res);

  const { qrToken } = req.body as { qrToken?: string };
  if (!qrToken) return sendError(res, 'qrToken is required', 'BAD_REQUEST', 400);

  try {
    const result = await verifyAndScanTicket(req.user.sub, qrToken);
    res.json({ success: true, data: result });
  } catch (err) {
    handleServiceError(res, err);
  }
}
