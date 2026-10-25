import { useCallback, useEffect, useRef, useState } from 'react';
import type { CoachProfile, DietPlan, Trainee } from '../types/nutrition';
import { hasUnsyncedChanges, mergeSyncData, type SyncData } from '../../shared/sync';
import { DEFAULT_COACH_PROFILE } from '../data/initialData';
import { STORAGE_KEYS } from '../constants';
import type { Session } from '../lib/api';
import { readArray, readJson, readString, removeKey, writeJson } from '../lib/storage';
import { createSyncClient, type SyncClient } from '../lib/cloudSync';
import {
  deletePlanFromCloud,
  deleteTraineeFromCloud,
  subscribeToCloudCoachProfile,
  subscribeToCloudDietPlans,
  subscribeToCloudTrainees,
  syncCoachProfileToCloud,
  syncPlanToCloud,
  syncTraineeToCloud
} from '../lib/firebase';

/** Firestore plan writes are debounced since plans are edited on every keystroke. */
const PLAN_FIRESTORE_DEBOUNCE_MS = 800;

function usePersisted<T>(key: string, value: T, legacyBackupKey?: string) {
  useEffect(() => {
    writeJson(key, value);
    // The old duplicate "backup" key would resurrect deleted data if left behind.
    if (legacyBackupKey) removeKey(legacyBackupKey);
  }, [key, value, legacyBackupKey]);
}

const hasCachedData = () => readString(STORAGE_KEYS.trainees) !== null || readString(STORAGE_KEYS.plans) !== null;

/**
 * Single source of truth for trainees, plans and the coach profile of the logged-in account.
 * Changes are cached in localStorage and merged with the server, so every device of the same
 * account shows the same data and none of them can wipe what the others saved.
 */
export function useAppData(session: Session, onUnauthorized: () => void) {
  const isAdmin = session.role === 'admin';

  const [coachProfile, setCoachProfile] = useState<CoachProfile>(() =>
    readJson(STORAGE_KEYS.coachProfile, DEFAULT_COACH_PROFILE)
  );
  const [trainees, setTrainees] = useState<Trainee[]>(
    () => readArray<Trainee>([STORAGE_KEYS.trainees, STORAGE_KEYS.traineesBackup]) ?? []
  );
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(
    () => readArray<DietPlan>([STORAGE_KEYS.plans, STORAGE_KEYS.plansBackup]) ?? []
  );
  /** False until the first server response on a device with no cached data (avoids flashing an empty list). */
  const [isReady, setIsReady] = useState(hasCachedData);
  const [isOffline, setIsOffline] = useState(false);

  usePersisted(STORAGE_KEYS.trainees, trainees, STORAGE_KEYS.traineesBackup);
  usePersisted(STORAGE_KEYS.plans, dietPlans, STORAGE_KEYS.plansBackup);
  usePersisted(STORAGE_KEYS.coachProfile, coachProfile);

  const deletedIdsRef = useRef<string[]>(readJson<string[]>(STORAGE_KEYS.deletedIds, []));
  const localChangeRef = useRef(false);
  const syncRef = useRef<SyncClient | null>(null);

  const stateRef = useRef({ trainees, dietPlans, coachProfile });
  stateRef.current = { trainees, dietPlans, coachProfile };

  /** Current local state in the shape the server uses. */
  const snapshot = (): SyncData => ({
    trainees: stateRef.current.trainees,
    plans: stateRef.current.dietPlans,
    coachProfile: stateRef.current.coachProfile,
    deletedTraineeIds: deletedIdsRef.current,
    lastUpdated: 0
  });

  /** What gets uploaded: the coach sends everything (merged server-side), a trainee only their progress. */
  const buildPushBody = (data: SyncData) => {
    if (isAdmin) return { data };
    const me = data.trainees.find(t => t.id === session.traineeId);
    return me ? { progress: { weight: me.weight, progressLogs: me.progressLogs ?? [], updatedAt: me.updatedAt } } : null;
  };

  // Upload only after local edits (not after applying server data, which would echo it back).
  useEffect(() => {
    if (!localChangeRef.current) return;
    localChangeRef.current = false;
    const body = buildPushBody(snapshot());
    if (body) syncRef.current?.schedulePush(body);
  }, [trainees, dietPlans, coachProfile]);

  useEffect(() => {
    const applyRemote = (remote: SyncData) => {
      const local = snapshot();
      const merged = mergeSyncData(local, remote);
      const deleted = new Set(merged.deletedTraineeIds);

      if (merged.deletedTraineeIds.length !== deletedIdsRef.current.length) {
        deletedIdsRef.current = merged.deletedTraineeIds;
        writeJson(STORAGE_KEYS.deletedIds, merged.deletedTraineeIds);
      }
      setTrainees(merged.trainees.filter(t => !deleted.has(t.id)));
      setDietPlans(merged.plans);
      if (merged.coachProfile) setCoachProfile(merged.coachProfile);
      setIsOffline(false);

      // This device has changes the server doesn't (e.g. made offline): send them up.
      if (hasUnsyncedChanges(local, remote)) {
        const body = buildPushBody(merged);
        if (body) syncRef.current?.schedulePush(body);
      }
    };

    const client = createSyncClient({
      token: session.token,
      onRemoteData: applyRemote,
      onFirstLoad: ok => {
        setIsReady(true);
        setIsOffline(!ok);
      },
      onUnauthorized
    });
    syncRef.current = client;

    // Optional Firebase listeners (coach only, no-op unless Firebase is configured); merged like server data.
    const unsubs = isAdmin
      ? [
          subscribeToCloudTrainees(list => applyRemote({ ...snapshot(), trainees: list, lastUpdated: 0 })),
          subscribeToCloudDietPlans(list => applyRemote({ ...snapshot(), plans: list, lastUpdated: 0 })),
          subscribeToCloudCoachProfile(profile => applyRemote({ ...snapshot(), coachProfile: profile, lastUpdated: 0 }))
        ]
      : [];

    return () => {
      client.stop();
      syncRef.current = null;
      unsubs.forEach(u => u());
    };
    // The session is fixed for this hook's lifetime (the app remounts on login/logout), so run once.
  }, []);

  const planTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const addTrainee = useCallback((trainee: Trainee) => {
    const stamped = { ...trainee, updatedAt: Date.now() };
    localChangeRef.current = true;
    setTrainees(prev => [stamped, ...prev]);
    void syncTraineeToCloud(stamped);
  }, []);

  const updateTrainee = useCallback((trainee: Trainee) => {
    const stamped = { ...trainee, updatedAt: Date.now() };
    localChangeRef.current = true;
    setTrainees(prev => prev.map(t => (t.id === stamped.id ? stamped : t)));
    void syncTraineeToCloud(stamped);
  }, []);

  const deleteTrainee = useCallback((traineeId: string) => {
    deletedIdsRef.current = [...new Set([...deletedIdsRef.current, traineeId])];
    writeJson(STORAGE_KEYS.deletedIds, deletedIdsRef.current);
    localChangeRef.current = true;
    setTrainees(prev => prev.filter(t => t.id !== traineeId));
    setDietPlans(prev => prev.filter(p => p.traineeId !== traineeId));
    void deleteTraineeFromCloud(traineeId);
    void deletePlanFromCloud(traineeId);
  }, []);

  const savePlan = useCallback((plan: DietPlan) => {
    const stamped = { ...plan, updatedAt: Date.now() };
    localChangeRef.current = true;
    setDietPlans(prev => {
      const idx = prev.findIndex(p => p.traineeId === stamped.traineeId);
      if (idx < 0) return [stamped, ...prev];
      const next = prev.slice();
      next[idx] = stamped;
      return next;
    });

    const timers = planTimersRef.current;
    clearTimeout(timers.get(stamped.traineeId));
    timers.set(
      stamped.traineeId,
      setTimeout(() => {
        timers.delete(stamped.traineeId);
        void syncPlanToCloud(stamped);
      }, PLAN_FIRESTORE_DEBOUNCE_MS)
    );
  }, []);

  const updateCoachProfile = useCallback((profile: CoachProfile) => {
    const stamped = { ...profile, updatedAt: Date.now() };
    localChangeRef.current = true;
    setCoachProfile(stamped);
    void syncCoachProfileToCloud(stamped);
  }, []);

  /** Uploads anything still pending; resolves false if some changes could not be sent. */
  const flushPending = useCallback(() => syncRef.current?.flush() ?? Promise.resolve(true), []);

  return {
    coachProfile,
    trainees,
    dietPlans,
    isReady,
    isOffline,
    addTrainee,
    updateTrainee,
    deleteTrainee,
    savePlan,
    updateCoachProfile,
    flushPending
  };
}
