import type { CoachProfile, Trainee } from '../types/nutrition';

export const DEFAULT_COACH_PROFILE: CoachProfile = {
  name: "Coach LIMBY",
  title: "Head Fitness & Sports Nutrition Specialist",
  brandName: "LIMBY FIT",
  slogan: "FUEL YOUR PROGRESS",
  logoUrl: "",
  phone: "+20 100 123 4567",
  whatsapp: "+20 100 123 4567",
  instagram: "@limby.coach",
  themeColor: "#9CFF00",
  generalInstructions: [
    "شرب من 3.5 إلى 4 ليتر ماء يومياً لزيادة الحرق وطرد السموم.",
    "قياس وإعداد الأطعمة وهي خام (قبل الطبخ) للحصول على أعلى دقة.",
    "الالتزام بالنظام بنسبة 90% للحصول على نتائج سريعة ومضمونة.",
    "قياس الوزن والقياسات أسبوعياً صباحاً على معدة فارغة بعد الحمام مباشرة.",
    "النوم من 7 إلى 8 ساعات متواصلة ليلاً لتعزيز الريكفري وهرمون النمو."
  ]
};

export const INITIAL_TRAINEES: Trainee[] = [];
