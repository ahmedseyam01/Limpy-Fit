import type { DaySchedule, DietPlan, FoodPortion, Meal, Trainee } from '../types/nutrition';
import { WEEK_DAYS } from '../constants';
import { todayIso } from './trainee';

type MealTemplate = Pick<Meal, 'type' | 'titleAr' | 'titleEn'>;

// Standard 5-meal day used for every new plan. Food and macros start empty: the coach fills in real values.
const MEAL_TEMPLATES: MealTemplate[] = [
  { type: 'breakfast', titleAr: '1. وجبة الإفطار', titleEn: 'Breakfast' },
  { type: 'snack_1', titleAr: '2. وجبة سناك صباحي', titleEn: 'Morning Snack' },
  { type: 'lunch', titleAr: '3. وجبة الغداء الرئيسية', titleEn: 'Lunch' },
  { type: 'post_workout', titleAr: '4. وجبة قبل/بعد التمرين', titleEn: 'Workout Snack' },
  { type: 'dinner', titleAr: '5. وجبة العشاء', titleEn: 'Dinner' }
];

function createDefaultMeals(dayIdx: number): Meal[] {
  return MEAL_TEMPLATES.map((meta, i) => ({
    ...meta,
    id: `m${i + 1}-${dayIdx}`,
    items: [createFreeTextItem(i, '')],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
    notes: ''
  }));
}

/** A meal written as free text by the coach: it has no per-item quantity or macros of its own. */
export function createFreeTextItem(mealIdx: number, text: string): FoodPortion {
  return { foodId: `f-custom-${mealIdx}`, foodNameAr: text, foodNameEn: text, grams: 0, calories: 0, protein: 0, carbs: 0, fats: 0 };
}

/** Free-text items (and empty placeholders) must not show grams/macros: those numbers aren't real. */
export const isFreeTextItem = (item: FoodPortion) => item.foodId.startsWith('f-custom-') || !item.grams || !item.foodNameAr;

export type MacroSums = { calories: number; protein: number; carbs: number; fats: number };

export const hasMacros = (m: MacroSums) => m.calories > 0 || m.protein > 0 || m.carbs > 0 || m.fats > 0;

export const mealMacros = (m: Meal): MacroSums => ({
  calories: m.totalCalories || 0,
  protein: m.totalProtein || 0,
  carbs: m.totalCarbs || 0,
  fats: m.totalFats || 0
});

/** A day counts as filled once any meal has text or it has exercises. */
export const isDayFilled = (day?: DaySchedule) =>
  !!day && (day.meals.some(m => m.items.some(i => i.foodNameAr?.trim())) || (day.exercises?.length ?? 0) > 0);

/** Index of today in WEEK_DAYS (the week starts on Saturday). */
export const todayWeekIndex = (date = new Date()) => (date.getDay() + 1) % 7;

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

export function sumMacros(meals: Meal[]): MacroSums {
  return meals.map(mealMacros).reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fats: acc.fats + m.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}
