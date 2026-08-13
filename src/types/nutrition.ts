export type Gender = 'male' | 'female';
export type Goal = 'fat_loss' | 'extreme_cut' | 'muscle_gain' | 'recomp' | 'maintenance';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete';
export type AuthRole = 'admin' | 'trainee' | null;

export interface AuthState {
  role: AuthRole;
  activeTraineeId?: string;
}

export interface Trainee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  targetWeight?: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  workoutDays: number;
  bodyFatPercentage?: number;
  notes?: string;
  createdAt: string;
  activePlanId?: string;
  progressLogs: ProgressLog[];
}

export interface ProgressLog {
  id: string;
  date: string;
  weight: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  notes?: string;
}

export interface MacroTargets {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  proteinRatio: number;
}

export type FoodCategory = 'protein' | 'carbs' | 'fats' | 'veggies' | 'fruits' | 'dairy' | 'supplements';

export interface FoodItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: FoodCategory;
  servingSizeGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  isEgyptianSpecialty?: boolean;
}

export interface FoodPortion {
  foodId: string;
  foodNameAr: string;
  foodNameEn: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  alternatives?: AlternativeItem[];
}

export interface AlternativeItem {
  foodId: string;
  foodNameAr: string;
  foodNameEn: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export type MealType = 'breakfast' | 'snack_1' | 'lunch' | 'pre_workout' | 'post_workout' | 'dinner' | 'snack_2';

export interface Meal {
  id: string;
  type: MealType;
  titleAr: string;
  titleEn: string;
  timing?: string;
  items: FoodPortion[];
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface Exercise {
  id: string;
  nameAr: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
}

export interface DaySchedule {
  dayIndex: number;
  dayNameAr: string;
  dayNameEn: string;
  workoutFocus?: string;
  exercises?: Exercise[];
  meals: Meal[];
}

export interface DietPlan {
  id: string;
  traineeId: string;
  traineeName: string;
  planName: string;
  createdAt: string;
  targetMacros: MacroTargets;
  actualMacros: MacroTargets;
  meals: Meal[];
  days?: DaySchedule[];
  supplements: string[];
  hydrationLiters: number;
  sleepHours: number;
  coachNotes: string;
}

export interface CoachProfile {
  name: string;
  title: string;
  brandName: string;
  slogan: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  themeColor: string;
  generalInstructions: string[];
}
