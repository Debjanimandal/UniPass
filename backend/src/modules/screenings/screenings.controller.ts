import { Request, Response } from 'express';
import {
  CreateScreeningSchema,
  UpdateScreeningSchema,
  BulkScreeningSchema,
  getAllScreenings,
  getScreeningById,
  createScreening,
  createBulkScreenings,
  updateScreening,
  deleteScreening,
} from './screenings.service';

// GET /api/screenings
export async function listScreenings(req: Request, res: Response) {
  try {
    const activeOnly = req.query.active === 'true';
    const movieId = req.query.movieId ? parseInt(req.query.movieId as string) : undefined;
    const screenId = req.query.screenId ? parseInt(req.query.screenId as string) : undefined;
    
    const screenings = await getAllScreenings({
      activeOnly,
      movieId,
      screenId,
    });
    res.json({ success: true, message: 'Screenings fetched.', data: screenings });
  } catch (err: any) {
    console.error('[listScreenings]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// GET /api/screenings/:id
export async function getScreening(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid screening ID.' } });
    const screening = await getScreeningById(id);
    res.json({ success: true, message: 'Screening fetched.', data: screening });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[getScreening]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// POST /api/screenings  — admin only
export async function addScreening(req: Request, res: Response) {
  try {
    const parsed = CreateScreeningSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fields[e.path.join('.')] = e.message; });
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields } });
    }
    const screening = await createScreening(parsed.data);
    res.status(201).json({ success: true, message: 'Screening created successfully.', data: screening });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[addScreening]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// POST /api/screenings/bulk  — admin only
export async function addBulkScreenings(req: Request, res: Response) {
  try {
    const parsed = BulkScreeningSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fields[e.path.join('.')] = e.message; });
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields } });
    }
    const screenings = await createBulkScreenings(parsed.data);
    res.status(201).json({ success: true, message: 'Screenings created successfully.', data: screenings });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND' || err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, error: err });
    }
    console.error('[addBulkScreenings]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// PATCH /api/screenings/:id  — admin only
export async function editScreening(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid screening ID.' } });
    const parsed = UpdateScreeningSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fields[e.path.join('.')] = e.message; });
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields } });
    }
    const screening = await updateScreening(id, parsed.data);
    res.json({ success: true, message: 'Screening updated successfully.', data: screening });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[editScreening]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// DELETE /api/screenings/:id  — admin only
export async function removeScreening(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid screening ID.' } });
    await deleteScreening(id);
    res.json({ success: true, message: 'Screening deleted successfully.', data: null });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[removeScreening]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}
