import type { Goal } from '../types/nutrition';

export const STORAGE_KEYS = {
  session: 'limby_session',
  /** Which account the cached data below belongs to. */
  cacheOwner: 'limby_cache_owner',
  coachProfile: 'limby_coach_profile',
  trainees: 'limby_trainees',
  traineesBackup: 'limby_trainees_backup',
  plans: 'limby_plans',
  plansBackup: 'limby_plans_backup',
  deletedIds: 'limby_deleted_ids',
  firebaseConfig: 'limby_firebase_config'
} as const;

/** Pre-auth keys that are no longer used (old sessions must log in again through the server). */
export const LEGACY_SESSION_KEYS = ['limby_auth_role', 'limby_active_trainee_id'] as const;

/** Per-account cached data, cleared on logout or when another account logs in on this device. */
export const ACCOUNT_CACHE_KEYS = [
  STORAGE_KEYS.trainees,
  STORAGE_KEYS.traineesBackup,
  STORAGE_KEYS.plans,
  STORAGE_KEYS.plansBackup,
  STORAGE_KEYS.coachProfile,
  STORAGE_KEYS.deletedIds
] as const;

export const WEEK_DAYS = [
  { ar: 'السبت', en: 'Saturday' },
  { ar: 'الأحد', en: 'Sunday' },
  { ar: 'الإثنين', en: 'Monday' },
  { ar: 'الثلاثاء', en: 'Tuesday' },
  { ar: 'الأربعاء', en: 'Wednesday' },
  { ar: 'الخميس', en: 'Thursday' },
  { ar: 'الجمعة', en: 'Friday' }
] as const;

export const GOAL_LABELS_AR: Record<Goal, string> = {
  fat_loss: 'تنشيف وحرق دهون 🔥',
  extreme_cut: 'تنشيف قاسي سريع ⚡',
  muscle_gain: 'تضخيم وبناء عضلات 💪',
  recomp: 'إعادة تشكيل الجسم Recomp ⚖️',
  maintenance: 'تثبيت وزن وصحة عامة 🛡️'
};

export { DEFAULT_TRAINEE_PASSWORD } from '../../shared/sync';
export const CREDENTIALS_EMAIL_DOMAIN = 'limbyfit.com';

export type AdminView = 'list' | 'plan' | 'pdf' | 'settings';
