import type { SyncData } from '../../shared/sync';

export type Session = { token: string; role: 'admin' } | { token: string; role: 'trainee'; traineeId: string };

/** The session is no longer valid (expired token or removed account). */
export class UnauthorizedError extends Error {}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  const res = await fetch(path, {
    cache: 'no-store',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) throw new UnauthorizedError(json.error || 'unauthorized');
  if (!res.ok) throw new ApiError(json.error || `Request failed (${res.status})`, res.status);
  return json as T;
}

export async function login(credential: string, password: string): Promise<Session> {
  const res = await request<{ token: string; role: 'admin' | 'trainee'; traineeId?: string }>('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ credential, password })
  });
  return res.role === 'trainee' && res.traineeId
    ? { token: res.token, role: 'trainee', traineeId: res.traineeId }
    : { token: res.token, role: 'admin' };
}

export const getSyncData = (token: string) => request<{ data: SyncData }>('/api/sync', { token }).then(r => r.data);

export const postSyncData = (token: string, body: unknown) =>
  request<{ data: SyncData }>('/api/sync', { method: 'POST', token, body: JSON.stringify(body) }).then(r => r.data);
