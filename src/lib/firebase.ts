/// <reference types="vite/client" />
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  Firestore 
} from 'firebase/firestore';
import { Trainee, DietPlan, CoachProfile } from '../types/nutrition';

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const LOCAL_STORAGE_FIREBASE_KEY = 'limby_firebase_config';

/**
 * Retrieves the stored or environment Firebase configuration
 */
export function getStoredFirebaseConfig(): FirebaseConfig | null {
  // Check Vite environment variables first
  const envConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  // Fallback to localStorage saved config
  const saved = localStorage.getItem(LOCAL_STORAGE_FIREBASE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig): boolean {
  if (!config.apiKey || !config.projectId) return false;
  localStorage.setItem(LOCAL_STORAGE_FIREBASE_KEY, JSON.stringify(config));
  initFirebase();
  return true;
}

export function removeFirebaseConfig(): void {
  localStorage.removeItem(LOCAL_STORAGE_FIREBASE_KEY);
  dbInstance = null;
  appInstance = null;
}

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function initFirebase(): Firestore | null {
  const config = getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    dbInstance = null;
    return null;
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApps()[0];
    }
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  } catch (err) {
    console.warn('Failed to initialize Firebase:', err);
    dbInstance = null;
    return null;
  }
}

export function getDb(): Firestore | null {
  if (!dbInstance) {
    return initFirebase();
  }
  return dbInstance;
}

export function isFirebaseConnected(): boolean {
  return !!getDb();
}

// ----------------------------------------------------
// Real-time Cloud Data Sync Handlers
// ----------------------------------------------------

/** Subscribe to Trainees collection in Firestore */
export function subscribeToCloudTrainees(onData: (trainees: Trainee[]) => void): () => void {
  const db = getDb();
  if (!db) return () => {};

  const colRef = collection(db, 'trainees');
  return onSnapshot(colRef, (snapshot) => {
    const traineesList: Trainee[] = [];
    snapshot.forEach((docSnap) => {
      traineesList.push(docSnap.data() as Trainee);
    });
    // Sort by creation date newest first
    traineesList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onData(traineesList);
  }, (err) => {
    console.warn('Error subscribing to Cloud Trainees:', err);
  });
}

/** Sync individual Trainee to Firestore */
export async function syncTraineeToCloud(trainee: Trainee): Promise<void> {
  const db = getDb();
  if (!db || !trainee.id) return;
  try {
    await setDoc(doc(db, 'trainees', trainee.id), trainee, { merge: true });
  } catch (err) {
    console.warn('Cloud sync trainee error:', err);
  }
}

/** Delete Trainee from Firestore */
export async function deleteTraineeFromCloud(traineeId: string): Promise<void> {
  const db = getDb();
  if (!db || !traineeId) return;
  try {
    await deleteDoc(doc(db, 'trainees', traineeId));
  } catch (err) {
    console.warn('Cloud delete trainee error:', err);
  }
}

/** Subscribe to Diet Plans collection in Firestore */
export function subscribeToCloudDietPlans(onData: (plans: DietPlan[]) => void): () => void {
  const db = getDb();
  if (!db) return () => {};

  const colRef = collection(db, 'plans');
  return onSnapshot(colRef, (snapshot) => {
    const plansList: DietPlan[] = [];
    snapshot.forEach((docSnap) => {
      plansList.push(docSnap.data() as DietPlan);
    });
    onData(plansList);
  }, (err) => {
    console.warn('Error subscribing to Cloud Plans:', err);
  });
}

/** Sync individual Diet Plan to Firestore */
export async function syncPlanToCloud(plan: DietPlan): Promise<void> {
  const db = getDb();
  if (!db || !plan.traineeId) return;
  try {
    await setDoc(doc(db, 'plans', plan.traineeId), plan, { merge: true });
  } catch (err) {
    console.warn('Cloud sync plan error:', err);
  }
}

/** Delete Diet Plan from Firestore */
export async function deletePlanFromCloud(traineeId: string): Promise<void> {
  const db = getDb();
  if (!db || !traineeId) return;
  try {
    await deleteDoc(doc(db, 'plans', traineeId));
  } catch (err) {
    console.warn('Cloud delete plan error:', err);
  }
}

/** Subscribe to Coach Profile document in Firestore */
export function subscribeToCloudCoachProfile(onData: (profile: CoachProfile) => void): () => void {
  const db = getDb();
  if (!db) return () => {};

  const docRef = doc(db, 'settings', 'coachProfile');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onData(docSnap.data() as CoachProfile);
    }
  }, (err) => {
    console.warn('Error subscribing to Cloud Coach Profile:', err);
  });
}

/** Sync Coach Profile to Firestore */
export async function syncCoachProfileToCloud(profile: CoachProfile): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    await setDoc(doc(db, 'settings', 'coachProfile'), profile, { merge: true });
  } catch (err) {
    console.warn('Cloud sync profile error:', err);
  }
}
