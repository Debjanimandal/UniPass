import { Request, Response } from 'express';
import { sendSuccess, Errors } from '../../utils/response';
import { getDashboardStats } from './dashboard.service';

// GET /api/dashboard/stats
export async function dashboardStats(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getDashboardStats();
    sendSuccess(res, data, 'Dashboard stats retrieved successfully.');
  } catch (err) {
    console.error('[dashboardStats]', err);
    Errors.internal(res);
  }
}
