import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  // ─── Database ────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL:   z.string().min(1, 'DIRECT_URL is required'),

  // ─── Supabase API ────────────────────────────────────────────
  SUPABASE_URL:              z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY:         z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // ─── JWT / QR Secrets ────────────────────────────────────────
  JWT_SECRET:    z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  QR_SECRET:     z.string().min(32, 'QR_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // ─── Server ──────────────────────────────────────────────────
  PORT:     z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ─── Business Rules ──────────────────────────────────────────
  ADMISSION_GRACE_MINUTES: z.string().default('30').transform(Number),

  // ─── Timezone ────────────────────────────────────────────────
  TZ: z.string().default('UTC'),

  // ─── CORS ────────────────────────────────────────────────────
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Invalid or missing environment variables:\n');
  const errors = parsed.error.flatten().fieldErrors;
  for (const [field, messages] of Object.entries(errors)) {
    console.error(`  ${field}: ${messages?.join(', ')}`);
  }
  console.error('\n  → Copy backend/.env.example to backend/.env and fill in all values.\n');
  process.exit(1);
}

export const env = parsed.data;
