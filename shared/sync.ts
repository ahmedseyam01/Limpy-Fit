/**
 * Sync rules shared by the browser and the API, so every device merges data the same way.
 *
 * Data is merged per trainee / per plan by `updatedAt` instead of replacing whole lists:
 * a device with an old or empty cache can never wipe what other devices saved.
 * Deletions only happen through `deletedTraineeIds` (tombstones).
 */
import type { CoachProfile, DietPlan, Trainee } from '../src/types/nutrition.js';

export const DEFAULT_TRAINEE_PASSWORD = 'limby2026';

export interface SyncData {
  trainees: Trainee[];
  plans: DietPlan[];
  deletedTraineeIds: string[];
  coachProfile?: CoachProfile;
  /** Server revision (ms). Changes on every save. */
  lastUpdated: number;
}

export const emptySyncData = (): SyncData => ({ trainees: [], plans: [], deletedTraineeIds: [], lastUpdated: 0 });

const stamp = (x?: { updatedAt?: number }) => x?.updatedAt ?? 0;

/** Newest first; ids are `tr-<timestamp>` so they break same-day ties. */
function sortTrainees(list: Trainee[]): Trainee[] {
  return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '') || b.id.localeCompare(a.id));
}

/** Keeps the newer copy of each item; on a tie `incoming` wins. Items missing from `incoming` are kept. */
function mergeById<T extends { updatedAt?: number }>(base: T[], incoming: T[], key: (x: T) => string): T[] {
  const map = new Map(base.map(x => [key(x), x]));
  for (const item of incoming) {
    const current = map.get(key(item));
    if (!current || stamp(item) >= stamp(current)) map.set(key(item), item);
  }
  return [...map.values()];
}

export function normalizeSyncData(raw: Partial<SyncData> | null | undefined): SyncData {
  return {
    trainees: Array.isArray(raw?.trainees) ? raw.trainees : [],
    plans: Array.isArray(raw?.plans) ? raw.plans : [],
    deletedTraineeIds: Array.isArray(raw?.deletedTraineeIds) ? raw.deletedTraineeIds : [],
    coachProfile: raw?.coachProfile,
    lastUpdated: typeof raw?.lastUpdated === 'number' ? raw.lastUpdated : 0
  };
}

export function mergeSyncData(base: SyncData, incoming: Partial<SyncData>): SyncData {
  const inc = normalizeSyncData(incoming);
  const deleted = new Set([...base.deletedTraineeIds, ...inc.deletedTraineeIds]);
  const profile =
    !inc.coachProfile || (base.coachProfile && stamp(base.coachProfile) > stamp(inc.coachProfile))
      ? base.coachProfile
      : inc.coachProfile;

  return {
    trainees: sortTrainees(mergeById(base.trainees, inc.trainees, t => t.id).filter(t => !deleted.has(t.id))),
    plans: mergeById(base.plans, inc.plans, p => p.traineeId).filter(p => !deleted.has(p.traineeId)),
    deletedTraineeIds: [...deleted],
    coachProfile: profile,
    lastUpdated: Math.max(base.lastUpdated, inc.lastUpdated)
  };
}

/** True if `local` has something `remote` doesn't (new or newer items) — i.e. it still needs uploading. */
export function hasUnsyncedChanges(local: SyncData, remote: SyncData): boolean {
  const deleted = new Set(remote.deletedTraineeIds);
  const ahead = <T extends { updatedAt?: number }>(mine: T[], theirs: T[], key: (x: T) => string) => {
    const map = new Map(theirs.map(x => [key(x), x]));
    return mine.some(x => {
      if (deleted.has(key(x))) return false;
      const other = map.get(key(x));
      return !other || stamp(x) > stamp(other);
    });
  };
  return (
    ahead(local.trainees, remote.trainees, t => t.id) ||
    ahead(local.plans, remote.plans, p => p.traineeId) ||
    local.deletedTraineeIds.some(id => !deleted.has(id)) ||
    (!!local.coachProfile && stamp(local.coachProfile) > stamp(remote.coachProfile))
  );
}

/** Matches a trainee by exact email, or by full phone number (ignoring formatting and country-code prefix). */
export function findTraineeByCredential(trainees: Trainee[], credential: string): Trainee | undefined {
  const cred = credential.trim().toLowerCase();
  const typedDigits = cred.replace(/[^0-9]/g, '').replace(/^0+/, '');
  return trainees.find(t => {
    if (t.email && t.email.toLowerCase() === cred) return true;
    return typedDigits.length >= 8 && !!t.phone && t.phone.replace(/[^0-9]/g, '').endsWith(typedDigits);
  });
}
