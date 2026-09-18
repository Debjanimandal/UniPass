import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import { listMovies, getMovie, addMovie, editMovie, removeMovie } from './movies.controller';

const router = Router();

// ─── Admin-only guard ─────────────────────────────────────────────────────────
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required.' } });
    return;
  }
  next();
}

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/',    listMovies);
router.get('/:id', getMovie);

// ─── Admin-only routes ────────────────────────────────────────────────────────
router.post('/',       authenticate, requireAdmin, addMovie);
router.patch('/:id',   authenticate, requireAdmin, editMovie);
router.delete('/:id',  authenticate, requireAdmin, removeMovie);

export default router;
