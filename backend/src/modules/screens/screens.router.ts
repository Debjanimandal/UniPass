import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/role';
import {
  listScreens,
  getScreen,
  addScreen,
  editScreen,
  removeScreen,
} from './screens.controller';

const router = Router();

// Public / any authenticated user can list/view screens
router.get('/', listScreens);
router.get('/:id', getScreen);

// Only ADMIN can modify
router.post('/', authenticate, requireRole('ADMIN'), addScreen);
router.patch('/:id', authenticate, requireRole('ADMIN'), editScreen);
router.delete('/:id', authenticate, requireRole('ADMIN'), removeScreen);

export default router;
