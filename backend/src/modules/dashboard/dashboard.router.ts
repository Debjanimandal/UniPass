import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import { dashboardStats } from './dashboard.controller';

const router = Router();

// Admin-only dashboard aggregates.
router.get('/stats', authenticate, requireRole('ADMIN'), dashboardStats);

export default router;
