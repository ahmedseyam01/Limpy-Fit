import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DEFAULT_COACH_EMAIL = 'coachahmed123@limbyfit.com';

export type Session = { role: 'admin' } | { role: 'trainee'; traineeId: string };

/** A required environment variable is missing on the server. */
export class ConfigError extends Error {}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new ConfigError('AUTH_SECRET (16+ characters)');
  return secret;
}

const b64url = (input: Buffer | string) => Buffer.from(input).toString('base64url');
const sign = (data: string) => createHmac('sha256', getAuthSecret()).update(data).digest('base64url');

/** Constant-time string comparison (hashing first makes lengths equal). */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function signToken(session: Session): string {
  const payload = b64url(JSON.stringify({ ...session, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    if (data.role === 'admin') return { role: 'admin' };
    if (data.role === 'trainee' && typeof data.traineeId === 'string') return { role: 'trainee', traineeId: data.traineeId };
  } catch {
    // malformed token
  }
  return null;
}

export function isCoachEmail(credential: string): boolean {
  const coachEmail = (process.env.COACH_EMAIL || DEFAULT_COACH_EMAIL).trim().toLowerCase();
  return credential.trim().toLowerCase() === coachEmail;
}

export function checkCoachPassword(password: string): boolean {
  const expected = process.env.COACH_PASSWORD;
  if (!expected) throw new ConfigError('COACH_PASSWORD');
  return safeEqual(password, expected);
}
