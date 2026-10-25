/**
 * Safe localStorage helpers. Every access is wrapped because storage can throw
 * (private mode, quota exceeded) or hold corrupted JSON.
 */

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Reads the first key holding a non-empty array (primary key, then legacy backups). */
export function readArray<T>(keys: readonly string[]): T[] | null {
  for (const key of keys) {
    const value = readJson<unknown>(key, null);
    if (Array.isArray(value) && value.length > 0) return value as T[];
  }
  return null;
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to persist "${key}"`, err);
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
