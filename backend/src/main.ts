import './config/env'; // Validate env vars first — exits if invalid
import express from 'express';
import cors from 'cors';
import { env } from './config/env';

// ─── Routers ──────────────────────────────────────────────────────────────────
import authRouter from './modules/auth/auth.router';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'UniPass API',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist.',
    },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[UnhandledError]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(env.PORT, () => {
  console.log(`\n🚀 UniPass API running on http://localhost:${env.PORT}`);
  console.log(`📋 Health check: http://localhost:${env.PORT}/api/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}\n`);
});

export default app;
