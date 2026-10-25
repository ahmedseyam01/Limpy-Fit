import type { Goal } from '../types/nutrition';

export const STORAGE_KEYS = {
  authRole: 'limby_auth_role',
  activeTraineeId: 'limby_active_trainee_id',
  coachProfile: 'limby_coach_profile',
  trainees: 'limby_trainees',
  traineesBackup: 'limby_trainees_backup',
  plans: 'limby_plans',
  plansBackup: 'limby_plans_backup',
  deletedIds: 'limby_deleted_ids',
  firebaseConfig: 'limby_firebase_config'
} as const;

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

export const DEFAULT_TRAINEE_PASSWORD = 'fit1234';
export const CREDENTIALS_EMAIL_DOMAIN = 'limbyfit.com';

export type AdminView = 'list' | 'plan' | 'pdf' | 'settings';
