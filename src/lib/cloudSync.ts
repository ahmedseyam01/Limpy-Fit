import type { Trainee, DietPlan, CoachProfile } from '../types/nutrition';

const PRIMARY_SYNC_ENDPOINT = '/api/sync';
const FALLBACK_SYNC_ENDPOINT = 'https://limpy-fit.vercel.app/api/sync';

/** Coalesce rapid edits (typing) into one upload. */
const PUSH_DEBOUNCE_MS = 800;
/** How often other devices' changes are pulled while the tab is visible. */
const POLL_INTERVAL_MS = 4000;
const PUSH_RETRY_MS = 5000;

export interface CloudPayload {
  trainees: Trainee[];
  plans: DietPlan[];
  deletedTraineeIds?: string[];
  coachProfile?: CoachProfile;
  lastUpdated: number;
}

export type CloudSnapshot = Omit<CloudPayload, 'lastUpdated'>;

let lastSyncTimestamp = 0;
let pendingSnapshot: CloudSnapshot | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<boolean> | null = null;

const ENDPOINTS: string[] = (() => {
  const host = typeof window !== 'undefined' ? window.location.origin : '';
  return host && !host.includes('limpy-fit.vercel.app')
    ? [PRIMARY_SYNC_ENDPOINT, FALLBACK_SYNC_ENDPOINT]
    : [PRIMARY_SYNC_ENDPOINT];
})();

/** True while local changes are waiting to be (or being) uploaded. */
export const hasPendingPush = () => pendingSnapshot !== null || inFlight !== null;

/** Fetches the latest global cloud data across all devices. */
export async function fetchCloudData(): Promise<CloudPayload | null> {
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!res.ok) continue;
      const json = await res.json();
      const payload = json.data || json;
      if (payload && (payload.trainees || payload.lastUpdated !== undefined)) {
        return payload as CloudPayload;
      }
    } catch {
      // try next endpoint
    }
  }
  return null;
}

async function postPayload(payload: CloudPayload): Promise<boolean> {
  const body = JSON.stringify({ name: 'LimpyFitDataStore', data: payload });
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      if (res.ok) return true;
    } catch {
      // try next endpoint
    }
  }
  return false;
}

async function flushPush(): Promise<void> {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  // Uploads are serialized so an older snapshot can never land after a newer one.
  while (inFlight) await inFlight;
  if (!pendingSnapshot) return;

  const snapshot = pendingSnapshot;
  pendingSnapshot = null;
  const timestamp = Date.now();
  lastSyncTimestamp = timestamp;

  inFlight = postPayload({ ...snapshot, lastUpdated: timestamp });
  try {
    const ok = await inFlight;
    if (!ok) {
      // Keep the data queued (unless something newer replaced it) and retry later.
      if (!pendingSnapshot) pendingSnapshot = snapshot;
      if (!pushTimer) pushTimer = setTimeout(flushPush, PUSH_RETRY_MS);
    }
  } finally {
    inFlight = null;
  }
}

/**
 * Queues the full current state for upload. Rapid calls are debounced and only the
 * latest snapshot is sent; deleted IDs from coalesced calls are merged, never lost.
 */
export function schedulePush(snapshot: CloudSnapshot, immediate = false): void {
  const deleted = new Set([...(pendingSnapshot?.deletedTraineeIds ?? []), ...(snapshot.deletedTraineeIds ?? [])]);
  pendingSnapshot = { ...snapshot, deletedTraineeIds: [...deleted] };

  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(flushPush, immediate ? 0 : PUSH_DEBOUNCE_MS);
}

interface AutoSyncHandlers {
  /** Called with newer data written by another device. */
  onRemoteData: (data: CloudPayload) => void;
  /** Called once if the cloud store has never been written to. */
  onEmptyCloud?: () => void;
}

/** Starts polling for remote changes and syncing on focus / tab switches. */
export function initCloudAutoSync({ onRemoteData, onEmptyCloud }: AutoSyncHandlers): () => void {
  let emptyHandled = false;
  let checking = false;

  const checkCloudUpdates = async () => {
    // Never overwrite local edits that haven't been uploaded yet.
    if (checking || hasPendingPush() || document.visibilityState === 'hidden') return;
    checking = true;
    try {
      const cloud = await fetchCloudData();
      if (!cloud || hasPendingPush()) return;

      if (!cloud.lastUpdated) {
        if (!emptyHandled) {
          emptyHandled = true;
          onEmptyCloud?.();
        }
        return;
      }
      if (cloud.lastUpdated > lastSyncTimestamp) {
        lastSyncTimestamp = cloud.lastUpdated;
        onRemoteData(cloud);
      }
    } finally {
      checking = false;
    }
  };

  const handleVisibility = () => {
    if (document.visibilityState === 'hidden') {
      // Push pending edits right away before the page may be frozen or closed.
      if (pendingSnapshot) void flushPush();
    } else {
      void checkCloudUpdates();
    }
  };
  const handleFocus = () => void checkCloudUpdates();

  void checkCloudUpdates();
  const intervalId = setInterval(checkCloudUpdates, POLL_INTERVAL_MS);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}
