import { Request, Response } from 'express';
import {
  CreateMovieSchema,
  UpdateMovieSchema,
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from './movies.service';

// GET /api/movies?active=true
export async function listMovies(req: Request, res: Response) {
  try {
    const activeOnly = req.query.active === 'true';
    const category = req.query.category as string | undefined;
    const language = req.query.language as string | undefined;
    const search = req.query.search as string | undefined;
    const date = req.query.date as string | undefined;
    
    const movies = await getAllMovies({
      activeOnly,
      category,
      language,
      search,
      date,
    });
    res.json({ success: true, message: 'Movies fetched.', data: movies });
  } catch (err: any) {
    console.error('[listMovies]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// GET /api/movies/:id
export async function getMovie(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid movie ID.' } });
    const movie = await getMovieById(id);
    res.json({ success: true, message: 'Movie fetched.', data: movie });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[getMovie]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// POST /api/movies  — admin only
export async function addMovie(req: Request, res: Response) {
  try {
    const parsed = CreateMovieSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fields[e.path.join('.')] = e.message; });
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields } });
    }
    const movie = await createMovie(parsed.data);
    res.status(201).json({ success: true, message: 'Movie created successfully.', data: movie });
  } catch (err: any) {
    console.error('[addMovie]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// PATCH /api/movies/:id  — admin only
export async function editMovie(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid movie ID.' } });
    const parsed = UpdateMovieSchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      parsed.error.errors.forEach(e => { fields[e.path.join('.')] = e.message; });
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields } });
    }
    const movie = await updateMovie(id, parsed.data);
    res.json({ success: true, message: 'Movie updated successfully.', data: movie });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[editMovie]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}

// DELETE /api/movies/:id  — admin only
export async function removeMovie(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ success: false, error: { code: 'INVALID_ID', message: 'Invalid movie ID.' } });
    await deleteMovie(id);
    res.json({ success: true, message: 'Movie deleted successfully.', data: null });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') return res.status(404).json({ success: false, error: err });
    console.error('[removeMovie]', err);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An internal server error occurred.' } });
  }
}
