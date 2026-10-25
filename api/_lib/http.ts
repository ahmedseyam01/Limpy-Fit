import type { IncomingMessage, ServerResponse } from 'http';
import { ConfigError, verifyToken, type Session } from './auth.js';
import { StoreUnavailableError } from './store.js';

export type ApiRequest = IncomingMessage & { body?: unknown };

const MAX_BODY_BYTES = 4 * 1024 * 1024;

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/** Uses the body already parsed by the platform when present, otherwise reads the raw stream. */
export async function readJsonBody<T = any>(req: ApiRequest): Promise<T> {
  if (req.body !== undefined) {
    return (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) as T;
  }
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY_BYTES) throw new SyntaxError('Body too large');
  }
  return JSON.parse(raw || '{}') as T;
}

export function getSession(req: ApiRequest): Session | null {
  const header = req.headers.authorization || '';
  return verifyToken(header.startsWith('Bearer ') ? header.slice(7) : undefined);
}

export function sendError(res: ServerResponse, err: unknown): void {
  if (err instanceof ConfigError) {
    console.error('Missing server configuration:', err.message);
    return sendJson(res, 500, { error: `Server is not configured: missing ${err.message}` });
  }
  if (err instanceof StoreUnavailableError) {
    console.error(err.message);
    return sendJson(res, 503, { error: 'Data store is temporarily unavailable, please retry.' });
  }
  if (err instanceof SyntaxError) return sendJson(res, 400, { error: 'Invalid JSON payload' });
  console.error(err);
  sendJson(res, 500, { error: 'Internal server error' });
}
