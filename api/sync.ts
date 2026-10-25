import type { ServerResponse } from 'http';
import type { ProgressLog } from '../src/types/nutrition.js';
import { mergeSyncData, type SyncData } from '../shared/sync.js';
import { getSession, readJsonBody, sendError, sendJson, type ApiRequest } from './_lib/http.js';
import { readStore, writeStore } from './_lib/store.js';

const MAX_PROGRESS_LOGS = 1000;

/** What a trainee may see: their own record and plan, plus the coach's public profile. */
function scopeToTrainee(store: SyncData, traineeId: string): SyncData | null {
  const trainee = store.trainees.find(t => t.id === traineeId);
  if (!trainee) return null;
  return {
    trainees: [trainee],
    plans: store.plans.filter(p => p.traineeId === traineeId),
    deletedTraineeIds: [],
    coachProfile: store.coachProfile,
    lastUpdated: store.lastUpdated
  };
}

function isValidLog(log: unknown): log is ProgressLog {
  const l = log as ProgressLog;
  return !!l && typeof l.id === 'string' && typeof l.date === 'string' && Number.isFinite(l.weight);
}

/**
 * GET  /api/sync → current data (coach: everything, trainee: own data only)
 * POST /api/sync → coach: { data } merged into the store
 *                  trainee: { progress: { weight, progressLogs, updatedAt } } for their own record
 * Requires `Authorization: Bearer <token>` from /api/auth.
 */
export default async function handler(req: ApiRequest, res: ServerResponse) {
  const session = getSession(req);
  if (!session) return sendJson(res, 401, { error: 'unauthorized' });

  try {
    if (req.method === 'GET') {
      const store = await readStore();
      if (session.role === 'admin') return sendJson(res, 200, { data: store });
      const scoped = scopeToTrainee(store, session.traineeId);
      return scoped ? sendJson(res, 200, { data: scoped }) : sendJson(res, 401, { error: 'account_removed' });
    }

    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

    const body = await readJsonBody<{ data?: Partial<SyncData>; progress?: Record<string, unknown> }>(req);
    const store = await readStore();

    if (session.role === 'admin') {
      if (!body.data || typeof body.data !== 'object') return sendJson(res, 400, { error: 'Missing data' });
      const merged = { ...mergeSyncData(store, body.data), lastUpdated: Date.now() };
      await writeStore(merged);
      return sendJson(res, 200, { data: merged });
    }

    // Trainee: only weight and progress logs of their own record can change.
    const idx = store.trainees.findIndex(t => t.id === session.traineeId);
    if (idx < 0) return sendJson(res, 401, { error: 'account_removed' });

    const { weight, progressLogs, updatedAt } = body.progress ?? {};
    if (!Number.isFinite(weight) || !Array.isArray(progressLogs) || !progressLogs.every(isValidLog)) {
      return sendJson(res, 400, { error: 'Invalid progress update' });
    }

    store.trainees[idx] = {
      ...store.trainees[idx],
      weight: weight as number,
      progressLogs: progressLogs.slice(0, MAX_PROGRESS_LOGS),
      // Keep the device's edit time (like coach edits) so a quick later edit is never treated as older.
      updatedAt: Number(updatedAt) || Date.now()
    };
    store.lastUpdated = Date.now();
    await writeStore(store);
    return sendJson(res, 200, { data: scopeToTrainee(store, session.traineeId) });
  } catch (err) {
    sendError(res, err);
  }
}
