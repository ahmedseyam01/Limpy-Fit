import { useCallback, useEffect, useRef, useState } from 'react';
import type { CoachProfile, DietPlan, Trainee } from '../types/nutrition';
import { DEFAULT_COACH_PROFILE, INITIAL_TRAINEES } from '../data/initialData';
import { STORAGE_KEYS } from '../constants';
import { readArray, readJson, removeKey, writeJson } from '../lib/storage';
import { initCloudAutoSync, schedulePush, type CloudPayload } from '../lib/cloudSync';
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

/**
 * Single source of truth for trainees, plans and the coach profile:
 * persists to localStorage and keeps every device in sync through the cloud store.
 */
export function useAppData() {
  const [coachProfile, setCoachProfile] = useState<CoachProfile>(() =>
    readJson(STORAGE_KEYS.coachProfile, DEFAULT_COACH_PROFILE)
  );
  const [trainees, setTrainees] = useState<Trainee[]>(
    () => readArray<Trainee>([STORAGE_KEYS.trainees, STORAGE_KEYS.traineesBackup]) ?? INITIAL_TRAINEES
  );
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(
    () => readArray<DietPlan>([STORAGE_KEYS.plans, STORAGE_KEYS.plansBackup]) ?? []
  );

  usePersisted(STORAGE_KEYS.trainees, trainees, STORAGE_KEYS.traineesBackup);
  usePersisted(STORAGE_KEYS.plans, dietPlans, STORAGE_KEYS.plansBackup);
  usePersisted(STORAGE_KEYS.coachProfile, coachProfile);

  const deletedIdsRef = useRef<string[]>(readJson<string[]>(STORAGE_KEYS.deletedIds, []));
  const localChangeRef = useRef(false);
  const stateRef = useRef({ trainees, dietPlans, coachProfile });
  stateRef.current = { trainees, dietPlans, coachProfile };

  const rememberDeleted = useCallback((ids: string[] = []) => {
    const merged = new Set([...deletedIdsRef.current, ...ids]);
    if (merged.size !== deletedIdsRef.current.length) {
      deletedIdsRef.current = [...merged];
      writeJson(STORAGE_KEYS.deletedIds, deletedIdsRef.current);
    }
    return merged;
  }, []);

  // Upload only after local edits (not after applying remote data, which would echo it back).
  useEffect(() => {
    if (!localChangeRef.current) return;
    localChangeRef.current = false;
    schedulePush({ trainees, plans: dietPlans, coachProfile, deletedTraineeIds: deletedIdsRef.current });
  }, [trainees, dietPlans, coachProfile]);

  useEffect(() => {
    const applyRemote = (cloud: CloudPayload) => {
      const deleted = rememberDeleted(cloud.deletedTraineeIds);
      if (Array.isArray(cloud.trainees)) setTrainees(cloud.trainees.filter(t => !deleted.has(t.id)));
      if (Array.isArray(cloud.plans)) setDietPlans(cloud.plans.filter(p => !deleted.has(p.traineeId)));
      if (cloud.coachProfile) setCoachProfile(cloud.coachProfile);
    };

    const stopAutoSync = initCloudAutoSync({
      onRemoteData: applyRemote,
      // Cloud store was never populated (cold start): seed it with this device's data.
      onEmptyCloud: () => {
        const { trainees: t, dietPlans: p, coachProfile: c } = stateRef.current;
        if (t.length > 0) schedulePush({ trainees: t, plans: p, coachProfile: c, deletedTraineeIds: deletedIdsRef.current }, true);
      }
    });

    // Optional Firebase listeners (no-op unless Firebase is configured)
    const unsubTrainees = subscribeToCloudTrainees(list => {
      const deleted = new Set(deletedIdsRef.current);
      setTrainees(list.filter(t => !deleted.has(t.id)));
    });
    const unsubPlans = subscribeToCloudDietPlans(setDietPlans);
    const unsubProfile = subscribeToCloudCoachProfile(setCoachProfile);

    return () => {
      stopAutoSync();
      unsubTrainees();
      unsubPlans();
      unsubProfile();
    };
  }, [rememberDeleted]);

  const planTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const addTrainee = useCallback((trainee: Trainee) => {
    localChangeRef.current = true;
    setTrainees(prev => [trainee, ...prev]);
    void syncTraineeToCloud(trainee);
  }, []);

  const updateTrainee = useCallback((trainee: Trainee) => {
    localChangeRef.current = true;
    setTrainees(prev => prev.map(t => (t.id === trainee.id ? trainee : t)));
    void syncTraineeToCloud(trainee);
  }, []);

  const deleteTrainee = useCallback(
    (traineeId: string) => {
      rememberDeleted([traineeId]);
      localChangeRef.current = true;
      setTrainees(prev => prev.filter(t => t.id !== traineeId));
      setDietPlans(prev => prev.filter(p => p.traineeId !== traineeId));
      void deleteTraineeFromCloud(traineeId);
      void deletePlanFromCloud(traineeId);
    },
    [rememberDeleted]
  );

  const savePlan = useCallback((plan: DietPlan) => {
    localChangeRef.current = true;
    setDietPlans(prev => {
      const idx = prev.findIndex(p => p.traineeId === plan.traineeId);
      if (idx < 0) return [plan, ...prev];
      const next = prev.slice();
      next[idx] = plan;
      return next;
    });

    const timers = planTimersRef.current;
    clearTimeout(timers.get(plan.traineeId));
    timers.set(
      plan.traineeId,
      setTimeout(() => {
        timers.delete(plan.traineeId);
        void syncPlanToCloud(plan);
      }, PLAN_FIRESTORE_DEBOUNCE_MS)
    );
  }, []);

  const updateCoachProfile = useCallback((profile: CoachProfile) => {
    localChangeRef.current = true;
    setCoachProfile(profile);
    void syncCoachProfileToCloud(profile);
  }, []);

  return {
    coachProfile,
    trainees,
    dietPlans,
    addTrainee,
    updateTrainee,
    deleteTrainee,
    savePlan,
    updateCoachProfile
  };
}
