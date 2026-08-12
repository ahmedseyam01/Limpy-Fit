export type Gender = 'male' | 'female';

export type Goal = 'fat_loss' | 'extreme_cut' | 'muscle_gain' | 'recomp' | 'maintenance';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete';

export interface Trainee {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  height: number; // in cm
  weight: number; // in kg
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
  weight: number; // in kg
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
  proteinRatio: number; // e.g. 2.2 g/kg
}

export type FoodCategory = 'protein' | 'carbs' | 'fats' | 'veggies' | 'fruits' | 'dairy' | 'supplements';

export interface FoodItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: FoodCategory;
  servingSizeGrams: number; // base reference e.g. 100g
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

export interface DaySchedule {
  dayIndex: number; // 0: السبت, 1: الأحد, 2: الإثنين, 3: الثلاثاء, 4: الأربعاء, 5: الخميس, 6: الجمعة
  dayNameAr: string;
  dayNameEn: string;
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
  meals: Meal[]; // Legacy / Default day meals
  days?: DaySchedule[]; // Full 7-Day Schedule with 5 meals per day
  supplements: string[];
  hydrationLiters: number;
  sleepHours: number;
  coachNotes: string;
}

export interface CoachProfile {
  name: string;
  title: string;
  brandName: string; // LIMBY FIT
  slogan: string; // FUEL YOUR PROGRESS
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  themeColor: string; // #9CFF00
  generalInstructions: string[];
}
