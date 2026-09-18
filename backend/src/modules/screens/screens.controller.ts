import { Request, Response } from 'express';
import {
  CreateScreenSchema,
  UpdateScreenSchema,
  getAllScreens,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
} from './screens.service';

// GET /api/screens?active=true
export async function listScreens(req: Request, res: Response) {
  try {
    const activeOnly = req.query.active === 'true';
    const search = req.query.search as string | undefined;
    const venue = req.query.venue as string | undefined;
    
    const screens = await getAllScreens({
      activeOnly,
      search,
      venue,
    });
    res.json({ success: true, message: 'Screens fetched.', data: screens });
  } catch (err: any) {
    console.error('[listScreens]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// GET /api/screens/:id
export async function getScreen(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid screen ID.' } });
    const screen = await getScreenById(id);
    res.json({ success: true, message: 'Screen fetched.', data: screen });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[getScreen]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// POST /api/screens  — admin only
export async function addScreen(req: Request, res: Response) {
  try {
    const parsed = CreateScreenSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fields[e.path.join('.')] = e.message; });
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields } });
    }
    const screen = await createScreen(parsed.data);
    res.status(201).json({ success: true, message: 'Screen created successfully.', data: screen });
  } catch (err: any) {
    console.error('[addScreen]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// PATCH /api/screens/:id  — admin only
export async function editScreen(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid screen ID.' } });
    const parsed = UpdateScreenSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fields[e.path.join('.')] = e.message; });
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields } });
    }
    const screen = await updateScreen(id, parsed.data);
    res.json({ success: true, message: 'Screen updated successfully.', data: screen });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[editScreen]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// DELETE /api/screens/:id  — admin only
export async function removeScreen(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid screen ID.' } });
    await deleteScreen(id);
    res.json({ success: true, message: 'Screen deleted successfully.', data: null });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[removeScreen]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}
