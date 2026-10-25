import type { SyncData } from '../../shared/sync';
import { getSyncData, postSyncData, UnauthorizedError } from './api';

/** Coalesce rapid edits (typing) into one upload. */
const PUSH_DEBOUNCE_MS = 800;
const PUSH_RETRY_MS = 5000;
/** How often other devices' changes are pulled while the tab is visible. */
const POLL_INTERVAL_MS = 4000;

interface SyncClientOptions {
  token: string;
  /** Data from the server (after a poll or as the result of an upload). Always merge it, never replace. */
  onRemoteData: (data: SyncData) => void;
  /** First pull finished (ok = reached the server). */
  onFirstLoad?: (ok: boolean) => void;
  /** Token expired or account removed. */
  onUnauthorized: () => void;
}

export type SyncClient = ReturnType<typeof createSyncClient>;

/**
 * Keeps one logged-in session in sync with /api/sync: debounced, serialized uploads
 * (only the latest body is sent, failed ones are retried) plus polling for other devices' changes.
 */
export function createSyncClient({ token, onRemoteData, onFirstLoad, onUnauthorized }: SyncClientOptions) {
  let lastRevision: number | null = null;
  let pendingBody: unknown = null;
  let pushTimer: ReturnType<typeof setTimeout> | null = null;
  let inFlight: Promise<boolean> | null = null;
  let checking = false;
  let stopped = false;
  let firstLoadDone = false;

  const receive = (data: SyncData) => {
    lastRevision = data.lastUpdated;
    if (!stopped) onRemoteData(data);
  };

  const handleUnauthorized = (err: unknown) => {
    if (!(err instanceof UnauthorizedError)) return false;
    stopped = true;
    onUnauthorized();
    return true;
  };

  const hasPendingPush = () => pendingBody !== null || inFlight !== null;

  /** Uploads the queued body now. Resolves true once nothing is left to upload. */
  async function flush(): Promise<boolean> {
    if (pushTimer) {
      clearTimeout(pushTimer);
      pushTimer = null;
    }
    // Uploads are serialized so an older body can never land after a newer one.
    while (inFlight) await inFlight;
    if (pendingBody === null) return true;

    const body = pendingBody;
    pendingBody = null;
    inFlight = postSyncData(token, body).then(
      data => {
        receive(data);
        return true;
      },
      err => {
        if (handleUnauthorized(err)) return false;
        // Keep it queued (unless something newer replaced it) and retry later.
        if (pendingBody === null) pendingBody = body;
        if (!pushTimer && !stopped) pushTimer = setTimeout(flush, PUSH_RETRY_MS);
        return false;
      }
    );
    try {
      return (await inFlight) && pendingBody === null;
    } finally {
      inFlight = null;
    }
  }

  function schedulePush(body: unknown, immediate = false) {
    if (stopped) return;
    pendingBody = body;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(flush, immediate ? 0 : PUSH_DEBOUNCE_MS);
  }

  async function checkForUpdates() {
    if (stopped || checking || hasPendingPush() || document.visibilityState === 'hidden') return;
    checking = true;
    let ok = false;
    try {
      const data = await getSyncData(token);
      ok = true;
      if (!hasPendingPush() && data.lastUpdated !== lastRevision) receive(data);
    } catch (err) {
      handleUnauthorized(err);
    } finally {
      checking = false;
      if (!firstLoadDone && !stopped) {
        firstLoadDone = true;
        onFirstLoad?.(ok);
      }
    }
  }

  const handleVisibility = () => {
    if (document.visibilityState === 'hidden') {
      // Push pending edits right away before the page may be frozen or closed.
      if (pendingBody !== null) void flush();
    } else {
      void checkForUpdates();
    }
  };
  const handleFocus = () => void checkForUpdates();

  void checkForUpdates();
  const intervalId = setInterval(checkForUpdates, POLL_INTERVAL_MS);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibility);

  return {
    schedulePush,
    flush,
    hasPendingPush,
    stop() {
      stopped = true;
      clearInterval(intervalId);
      if (pushTimer) clearTimeout(pushTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    }
  };
}
