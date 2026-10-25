import { useCallback, useState } from 'react';
import { ACCOUNT_CACHE_KEYS, LEGACY_SESSION_KEYS, STORAGE_KEYS } from '../constants';
import { login as apiLogin, type Session } from '../lib/api';
import { readJson, readString, removeKey, writeJson, writeString } from '../lib/storage';

const accountId = (s: Session) => (s.role === 'admin' ? 'admin' : `trainee:${s.traineeId}`);

function readSession(): Session | null {
  LEGACY_SESSION_KEYS.forEach(removeKey);
  const s = readJson<Session | null>(STORAGE_KEYS.session, null);
  return s?.token && (s.role === 'admin' || (s.role === 'trainee' && s.traineeId)) ? s : null;
}

export function clearAccountCache() {
  ACCOUNT_CACHE_KEYS.forEach(removeKey);
  removeKey(STORAGE_KEYS.cacheOwner);
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(readSession);

  /** Verifies credentials on the server. Throws on failure (see lib/api errors). */
  const login = useCallback(async (credential: string, password: string) => {
    const next = await apiLogin(credential, password);
    // Cached data from another account on this device must not leak into this one.
    // Data cached before accounts existed (no owner) is kept for the coach, so it gets merged into the cloud.
    const owner = readString(STORAGE_KEYS.cacheOwner);
    if (owner ? owner !== accountId(next) : next.role !== 'admin') clearAccountCache();
    writeString(STORAGE_KEYS.cacheOwner, accountId(next));
    writeJson(STORAGE_KEYS.session, next);
    setSession(next);
  }, []);

  /** Ends the session and removes this account's cached data from the device. */
  const logout = useCallback(() => {
    removeKey(STORAGE_KEYS.session);
    clearAccountCache();
    setSession(null);
  }, []);

  return { session, login, logout };
}
