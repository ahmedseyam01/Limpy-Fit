import type { DaySchedule, DietPlan, Meal, Trainee } from '../types/nutrition';
import { WEEK_DAYS } from '../constants';
import { todayIso } from './trainee';

type MealTemplate = Pick<Meal, 'type' | 'titleAr' | 'titleEn'> & {
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

// Standard 5-meal day used for every new plan (food names start blank for the coach to fill).
const MEAL_TEMPLATES: MealTemplate[] = [
  { type: 'breakfast', titleAr: '1. وجبة الإفطار', titleEn: 'Breakfast', grams: 150, calories: 360, protein: 32, carbs: 40, fats: 8 },
  { type: 'snack_1', titleAr: '2. وجبة سناك صباحي', titleEn: 'Morning Snack', grams: 120, calories: 246, protein: 7, carbs: 32, fats: 10 },
  { type: 'lunch', titleAr: '3. وجبة الغداء الرئيسية', titleEn: 'Lunch', grams: 380, calories: 503, protein: 54, carbs: 56, fats: 7 },
  { type: 'post_workout', titleAr: '4. وجبة قبل/بعد التمرين', titleEn: 'Workout Snack', grams: 130, calories: 238, protein: 30, carbs: 25, fats: 2 },
  { type: 'dinner', titleAr: '5. وجبة العشاء', titleEn: 'Dinner', grams: 210, calories: 270, protein: 28, carbs: 8, fats: 14 }
];

function createDefaultMeals(dayIdx: number): Meal[] {
  return MEAL_TEMPLATES.map(({ grams, calories, protein, carbs, fats, ...meta }, i) => ({
    ...meta,
    id: `m${i + 1}-${dayIdx}`,
    items: [{ foodId: `f${i + 1}`, foodNameAr: '', foodNameEn: '', grams, calories, protein, carbs, fats }],
    totalCalories: calories,
    totalProtein: protein,
    totalCarbs: carbs,
    totalFats: fats,
    notes: ''
  }));
}

export function createDefaultWeek(): DaySchedule[] {
  return WEEK_DAYS.map((d, idx) => ({
    dayIndex: idx,
    dayNameAr: d.ar,
    dayNameEn: d.en,
    workoutFocus: '',
    exercises: [],
    meals: createDefaultMeals(idx)
  }));
}

export function createDefaultPlan(traineeId: string, traineeName = ''): DietPlan {
  const days = createDefaultWeek();
  const macros = { calories: 2000, proteinGrams: 150, carbsGrams: 200, fatsGrams: 55, proteinRatio: 2 };
  return {
    id: `plan-${traineeId}`,
    traineeId,
    traineeName,
    planName: `نظام ${traineeName} الأسبوعي (7 أيام)`,
    createdAt: todayIso(),
    targetMacros: macros,
    actualMacros: { ...macros },
    meals: days[0].meals,
    days,
    supplements: ['ماء: 4 ليتر يومياً', 'كرياتين مونوهيدرات: 5 جرام', 'مولتي فيتامين: كبسولة صباحاً'],
    hydrationLiters: 4,
    sleepHours: 8,
    coachNotes: 'نظام غذائي أسبوعي متكامل تم إعداده خصيصاً لك بواسطة الكابتن.'
  };
}

export function findPlanForTrainee(plans: DietPlan[], trainee: Trainee): DietPlan {
  return plans.find(p => p.traineeId === trainee.id) ?? createDefaultPlan(trainee.id, trainee.name);
}

/**
 * Returns a full 7-day schedule. Legacy plans without `days` repeat their single `meals` list
 * across the week, unless `fallback` (e.g. default blank days for the editor) is given.
 */
export function getWeekSchedule(plan: DietPlan, fallback?: DaySchedule[]): DaySchedule[] {
  if (plan.days && plan.days.length === 7) return plan.days;
  if (fallback) return fallback;
  return WEEK_DAYS.map((d, idx) => ({
    dayIndex: idx,
    dayNameAr: d.ar,
    dayNameEn: d.en,
    meals: plan.meals || []
  }));
}

export function sumMacros(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.totalCalories || 0),
      protein: acc.protein + (m.totalProtein || 0),
      carbs: acc.carbs + (m.totalCarbs || 0),
      fats: acc.fats + (m.totalFats || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}
