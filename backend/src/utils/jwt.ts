import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthTokenPayload {
  sub: number;   // user_id
  role: string;  // STUDENT | GUARD | ADMIN
  email: string;
}

export interface QRTokenPayload {
  ticket_id: number;
  screening_id: number;
  user_id: number;
  seat_id: number;
  seat_code: string;
  movie_id: number;
  movie_title: string;
  screening_date: string;
  start_time: string;
  end_time: string;
  screen_name: string;
  venue: string;
}

// ─── Auth JWT ────────────────────────────────────────────────────────────────

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as unknown as AuthTokenPayload;
}

// ─── QR Credential JWT ───────────────────────────────────────────────────────

export function signQRCredential(payload: QRTokenPayload): string {
  // Long-lived — validity is checked via DB ticket status, not expiry
  return jwt.sign(payload, env.QR_SECRET, { expiresIn: '365d' });
}

export function verifyQRCredential(token: string): QRTokenPayload {
  return jwt.verify(token, env.QR_SECRET) as unknown as QRTokenPayload;
}
