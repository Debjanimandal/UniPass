import { Request, Response } from 'express';
import {
  BulkCreateSeatsSchema,
  UpdateSeatSchema,
  getSeatsByScreenId,
  getSeatById,
  generateSeatLayout,
  updateSeat,
  deleteSeat,
} from './seats.service';

// GET /api/seats?screenId=1
export async function listSeats(req: Request, res: Response) {
  try {
    const screenId = parseInt(String(req.query.screenId), 10);
    if (isNaN(screenId)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'screenId query param is required.' } });
    }
    const seats = await getSeatsByScreenId(screenId);
    res.json({ success: true, data: seats });
  } catch (err) {
    console.error('[listSeats]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// POST /api/seats/bulk
export async function addBulkSeats(req: Request, res: Response) {
  try {
    const parsed = BulkCreateSeatsSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fields[e.path.join('.')] = e.message; });
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields } });
    }
    const result = await generateSeatLayout(parsed.data);
    res.status(201).json({ success: true, message: 'Seats layout generated successfully.', data: result });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND' || err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, error: err });
    }
    console.error('[addBulkSeats]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// PATCH /api/seats/:id
export async function editSeat(req: Request, res: Response) {
  try {
    const seatId = parseInt(String(req.params.id), 10);
    if (isNaN(seatId)) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid ID' } });

    const parsed = UpdateSeatSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fields[e.path.join('.')] = e.message; });
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields } });
    }
    
    const seat = await updateSeat(seatId, parsed.data);
    res.json({ success: true, message: 'Seat updated successfully.', data: seat });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[editSeat]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// DELETE /api/seats/:id
export async function removeSeat(req: Request, res: Response) {
  try {
    const seatId = parseInt(String(req.params.id), 10);
    if (isNaN(seatId)) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid ID' } });

    await deleteSeat(seatId);
    res.json({ success: true, message: 'Seat deleted successfully.' });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    if (err.code === 'VALIDATION_ERROR') return res.status(400).json({ success: false, error: err });
    console.error('[removeSeat]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}
