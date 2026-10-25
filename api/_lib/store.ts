import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { emptySyncData, normalizeSyncData, type SyncData } from '../../shared/sync.js';
import { getAuthSecret } from './auth.js';

/**
 * Persistent store behind /api/sync. Data is encrypted (AES-256-GCM, key derived from AUTH_SECRET)
 * before it leaves the server, so the storage URL alone reveals nothing.
 *
 * Set SYNC_STORE_URL to use a different restful-api.dev object. Data still in the old
 * plain-text format is read once and re-saved encrypted.
 */
const LEGACY_STORE_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b110019ffca18b3114bd';

/** The store could not be read; callers must not save, or they could overwrite real data. */
export class StoreUnavailableError extends Error {}

let memoryStore: SyncData | null = null;
const useMemoryStore = () => process.env.SYNC_STORE_MEMORY === '1';
const storeUrl = () => process.env.SYNC_STORE_URL || LEGACY_STORE_URL;

const encryptionKey = () => createHash('sha256').update(`limby-store:${getAuthSecret()}`).digest();

function encrypt(data: SyncData): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), body].map(b => b.toString('base64')).join('.');
}

function decrypt(payload: string): SyncData {
  const [iv, tag, body] = payload.split('.').map(p => Buffer.from(p, 'base64'));
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  decipher.setAuthTag(tag);
  const json = Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
  return normalizeSyncData(JSON.parse(json));
}

async function putRemote(data: SyncData): Promise<void> {
  const res = await fetch(storeUrl(), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'LimpyFitDataStore', data: { enc: encrypt(data) } })
  });
  if (!res.ok) throw new StoreUnavailableError(`Store write failed (${res.status})`);
}

export async function readStore(): Promise<SyncData> {
  if (useMemoryStore()) return structuredClone(memoryStore ?? emptySyncData());

  let json: { data?: { enc?: string } & Partial<SyncData> };
  try {
    const res = await fetch(storeUrl(), { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`status ${res.status}`);
    json = await res.json();
  } catch (err) {
    throw new StoreUnavailableError(`Store read failed: ${(err as Error).message}`);
  }

  const raw = json?.data;
  if (!raw) return emptySyncData();
  if (typeof raw.enc === 'string') {
    try {
      return decrypt(raw.enc);
    } catch {
      // Wrong AUTH_SECRET or corrupted data: refuse to continue rather than overwrite it.
      throw new StoreUnavailableError('Store could not be decrypted (was AUTH_SECRET changed?)');
    }
  }

  // Legacy plain-text data: migrate it to the encrypted format right away.
  const legacy = normalizeSyncData(raw);
  await putRemote(legacy).catch(err => console.warn('Store migration failed:', err));
  return legacy;
}

export async function writeStore(data: SyncData): Promise<void> {
  if (useMemoryStore()) {
    memoryStore = structuredClone(data);
    return;
  }
  await putRemote(data);
}
