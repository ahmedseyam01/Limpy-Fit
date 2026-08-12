import { Trainee, MacroTargets, ActivityLevel, Goal } from '../types/nutrition';

export function calculateBMR(weightKg: number, heightCm: number, ageYears: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161);
  }
}

export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  switch (activityLevel) {
    case 'sedentary': return 1.2;
    case 'light': return 1.375;
    case 'moderate': return 1.55;
    case 'heavy': return 1.725;
    case 'athlete': return 1.9;
    default: return 1.55;
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * getActivityMultiplier(activityLevel));
}

export function calculateTargetCalories(tdee: number, goal: Goal): number {
  switch (goal) {
    case 'fat_loss': return Math.round(tdee * 0.80); // -20%
    case 'extreme_cut': return Math.round(tdee * 0.70); // -30%
    case 'muscle_gain': return Math.round(tdee * 1.15); // +15%
    case 'recomp': return Math.round(tdee * 0.95); // -5%
    case 'maintenance': return Math.round(tdee);
    default: return Math.round(tdee * 0.80);
  }
}

export function calculateMacros(
  targetCalories: number,
  weightKg: number,
  proteinGramsPerKg: number = 2.2,
  fatPercentageOfTotal: number = 25
): MacroTargets {
  // 1. Protein
  const proteinGrams = Math.round(weightKg * proteinGramsPerKg);
  const proteinCalories = proteinGrams * 4;

  // 2. Fats
  const fatCalories = Math.round(targetCalories * (fatPercentageOfTotal / 100));
  const fatsGrams = Math.round(fatCalories / 9);

  // 3. Carbs (Remaining)
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbsGrams = Math.round(remainingCalories / 4);

  return {
    calories: targetCalories,
    proteinGrams,
    carbsGrams,
    fatsGrams,
    proteinRatio: proteinGramsPerKg
  };
}

export function computeTraineeNutritionStats(trainee: Trainee): {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: MacroTargets;
} {
  const bmr = calculateBMR(trainee.weight, trainee.height, trainee.age, trainee.gender);
  const tdee = calculateTDEE(bmr, trainee.activityLevel);
  const targetCalories = calculateTargetCalories(tdee, trainee.goal);
  const macros = calculateMacros(targetCalories, trainee.weight);

  return { bmr, tdee, targetCalories, macros };
}
