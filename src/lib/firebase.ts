/// <reference types="vite/client" />
import type { Firestore } from 'firebase/firestore';
import type { Trainee, DietPlan, CoachProfile } from '../types/nutrition';
import { STORAGE_KEYS } from '../constants';
import { readJson, removeKey, writeJson } from './storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

type FirestoreModule = typeof import('firebase/firestore');
interface FirestoreContext {
  db: Firestore;
  fs: FirestoreModule;
}

/** Retrieves the Firebase configuration from Vite env vars, falling back to the one saved in Settings. */
export function getStoredFirebaseConfig(): FirebaseConfig | null {
  const envConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  };
  if (envConfig.apiKey && envConfig.projectId) return envConfig;

  const saved = readJson<FirebaseConfig | null>(STORAGE_KEYS.firebaseConfig, null);
  return saved?.apiKey && saved.projectId ? saved : null;
}

let contextPromise: Promise<FirestoreContext | null> | null = null;

/**
 * Lazily loads the Firebase SDK only when a config exists, so the (large) SDK
 * is never downloaded by users who don't use Firebase sync.
 */
function getFirestoreContext(): Promise<FirestoreContext | null> {
  if (contextPromise) return contextPromise;
  const config = getStoredFirebaseConfig();
  if (!config) return Promise.resolve(null);

  contextPromise = (async () => {
    try {
      const [{ initializeApp, getApps }, fs] = await Promise.all([
        import('firebase/app'),
        import('firebase/firestore')
      ]);
      const app = getApps()[0] ?? initializeApp(config);
      return { db: fs.getFirestore(app), fs };
    } catch (err) {
      console.warn('Failed to initialize Firebase:', err);
      contextPromise = null;
      return null;
    }
  })();
  return contextPromise;
}

export function saveFirebaseConfig(config: FirebaseConfig): boolean {
  if (!config.apiKey || !config.projectId) return false;
  writeJson(STORAGE_KEYS.firebaseConfig, config);
  contextPromise = null;
  void getFirestoreContext();
  return true;
}

export function removeFirebaseConfig(): void {
  removeKey(STORAGE_KEYS.firebaseConfig);
  contextPromise = null;
}

export function isFirebaseConnected(): boolean {
  return getStoredFirebaseConfig() !== null;
}

// ----------------------------------------------------
// Real-time Cloud Data Sync Handlers
// ----------------------------------------------------

/** Subscribes once the SDK is ready; the returned function also cancels a pending subscription. */
function subscribe(
  start: (ctx: FirestoreContext) => () => void
): () => void {
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;
  void getFirestoreContext().then(ctx => {
    if (ctx && !cancelled) unsubscribe = start(ctx);
  });
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}

async function withDb(label: string, run: (ctx: FirestoreContext) => Promise<void>): Promise<void> {
  const ctx = await getFirestoreContext();
  if (!ctx) return;
  try {
    await run(ctx);
  } catch (err) {
    console.warn(`Cloud ${label} error:`, err);
  }
}

export function subscribeToCloudTrainees(onData: (trainees: Trainee[]) => void): () => void {
  return subscribe(({ db, fs }) =>
    fs.onSnapshot(
      fs.collection(db, 'trainees'),
      snapshot => {
        const list = snapshot.docs.map(d => d.data() as Trainee);
        // Newest first
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        onData(list);
      },
      err => console.warn('Error subscribing to Cloud Trainees:', err)
    )
  );
}

export function subscribeToCloudDietPlans(onData: (plans: DietPlan[]) => void): () => void {
  return subscribe(({ db, fs }) =>
    fs.onSnapshot(
      fs.collection(db, 'plans'),
      snapshot => onData(snapshot.docs.map(d => d.data() as DietPlan)),
      err => console.warn('Error subscribing to Cloud Plans:', err)
    )
  );
}

export function subscribeToCloudCoachProfile(onData: (profile: CoachProfile) => void): () => void {
  return subscribe(({ db, fs }) =>
    fs.onSnapshot(
      fs.doc(db, 'settings', 'coachProfile'),
      docSnap => {
        if (docSnap.exists()) onData(docSnap.data() as CoachProfile);
      },
      err => console.warn('Error subscribing to Cloud Coach Profile:', err)
    )
  );
}

export function syncTraineeToCloud(trainee: Trainee): Promise<void> {
  if (!trainee.id) return Promise.resolve();
  return withDb('sync trainee', ({ db, fs }) => fs.setDoc(fs.doc(db, 'trainees', trainee.id), trainee, { merge: true }));
}

export function deleteTraineeFromCloud(traineeId: string): Promise<void> {
  if (!traineeId) return Promise.resolve();
  return withDb('delete trainee', ({ db, fs }) => fs.deleteDoc(fs.doc(db, 'trainees', traineeId)));
}

export function syncPlanToCloud(plan: DietPlan): Promise<void> {
  if (!plan.traineeId) return Promise.resolve();
  return withDb('sync plan', ({ db, fs }) => fs.setDoc(fs.doc(db, 'plans', plan.traineeId), plan, { merge: true }));
}

export function deletePlanFromCloud(traineeId: string): Promise<void> {
  if (!traineeId) return Promise.resolve();
  return withDb('delete plan', ({ db, fs }) => fs.deleteDoc(fs.doc(db, 'plans', traineeId)));
}

export function syncCoachProfileToCloud(profile: CoachProfile): Promise<void> {
  return withDb('sync profile', ({ db, fs }) => fs.setDoc(fs.doc(db, 'settings', 'coachProfile'), profile, { merge: true }));
}
