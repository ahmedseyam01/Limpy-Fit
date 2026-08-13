import { FoodItem, Trainee, CoachProfile, DietPlan } from '../types/nutrition';

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

export const INITIAL_FOOD_DATABASE: FoodItem[] = [
  // PROTEINS
  { id: 'f1', nameAr: 'صدور دجاج مشوية/مطهوة', nameEn: 'Cooked Chicken Breast', category: 'protein', servingSizeGrams: 100, calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  { id: 'f2', nameAr: 'لحم بقر أحمر صافي', nameEn: 'Lean Beef Steak', category: 'protein', servingSizeGrams: 100, calories: 200, protein: 26, carbs: 0, fats: 10 },
  { id: 'f3', nameAr: 'سمك سلمون مطهو', nameEn: 'Cooked Salmon Fillet', category: 'protein', servingSizeGrams: 100, calories: 206, protein: 22, carbs: 0, fats: 12 },
  { id: 'f4', nameAr: 'تونة مصفاة من الزيت', nameEn: 'Canned Tuna in Water', category: 'protein', servingSizeGrams: 100, calories: 116, protein: 26, carbs: 0, fats: 1 },
  { id: 'f5', nameAr: 'جبنة قريش قاطعة (أريش)', nameEn: 'Egyptian Cottage Cheese', category: 'protein', servingSizeGrams: 100, calories: 98, protein: 14, carbs: 3, fats: 4, isEgyptianSpecialty: true },
  { id: 'f6', nameAr: 'بياض بيض', nameEn: 'Egg Whites', category: 'protein', servingSizeGrams: 100, calories: 52, protein: 11, carbs: 0.7, fats: 0.2 },
  { id: 'f7', nameAr: 'بيض كامل مطهو', nameEn: 'Whole Egg', category: 'protein', servingSizeGrams: 100, calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  { id: 'f8', nameAr: 'واي بروتين آيزوليت', nameEn: 'Whey Protein Isolate', category: 'protein', servingSizeGrams: 30, calories: 120, protein: 25, carbs: 1, fats: 1 },
  { id: 'f9', nameAr: 'سمك بلطي/بوري مشوي', nameEn: 'Grilled Tilapia Fish', category: 'protein', servingSizeGrams: 100, calories: 128, protein: 26, carbs: 0, fats: 2.7, isEgyptianSpecialty: true },

  // CARBS
  { id: 'f10', nameAr: 'أرز بسمتي/أبيض مطهو', nameEn: 'Cooked Basmati Rice', category: 'carbs', servingSizeGrams: 100, calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  { id: 'f11', nameAr: 'شوفان كامل الخام', nameEn: 'Rolled Oats (Raw)', category: 'carbs', servingSizeGrams: 100, calories: 389, protein: 16.9, carbs: 66, fats: 6.9 },
  { id: 'f12', nameAr: 'بطاطا حلوة مشوية', nameEn: 'Baked Sweet Potato', category: 'carbs', servingSizeGrams: 100, calories: 90, protein: 2, carbs: 21, fats: 0.2 },
  { id: 'f13', nameAr: 'بطاطس مسلوقة/مطهوة', nameEn: 'Boiled Potato', category: 'carbs', servingSizeGrams: 100, calories: 87, protein: 1.9, carbs: 20, fats: 0.1 },
  { id: 'f14', nameAr: 'مكرونة مسلوقة', nameEn: 'Cooked Pasta', category: 'carbs', servingSizeGrams: 100, calories: 158, protein: 5.8, carbs: 31, fats: 0.9 },
  { id: 'f15', nameAr: 'توست بني بني كامل', nameEn: 'Whole Wheat Bread Toast', category: 'carbs', servingSizeGrams: 100, calories: 247, protein: 13, carbs: 41, fats: 3.4 },
  { id: 'f16', nameAr: 'كينوا مطهوة', nameEn: 'Cooked Quinoa', category: 'carbs', servingSizeGrams: 100, calories: 120, protein: 4.4, carbs: 21, fats: 1.9 },
  { id: 'f17', nameAr: 'خبز بلدي مصري (نصف رغيف)', nameEn: 'Egyptian Baladi Bread', category: 'carbs', servingSizeGrams: 50, calories: 130, protein: 4, carbs: 26, fats: 1, isEgyptianSpecialty: true },

  // FATS
  { id: 'f18', nameAr: 'زبدة فول سوداني طبيعية', nameEn: 'Natural Peanut Butter', category: 'fats', servingSizeGrams: 100, calories: 588, protein: 25, carbs: 20, fats: 50 },
  { id: 'f19', nameAr: 'زيت زيتون بكر ممتاز', nameEn: 'Extra Virgin Olive Oil', category: 'fats', servingSizeGrams: 10, calories: 88, protein: 0, carbs: 0, fats: 10 },
  { id: 'f20', nameAr: 'لوز نيء / مكسرات مشكلة', nameEn: 'Raw Almonds', category: 'fats', servingSizeGrams: 100, calories: 579, protein: 21, carbs: 22, fats: 50 },
  { id: 'f21', nameAr: 'أفوكادو طازج', nameEn: 'Fresh Avocado', category: 'fats', servingSizeGrams: 100, calories: 160, protein: 2, carbs: 8.5, fats: 15 },
  { id: 'f22', nameAr: 'زيت كوكوبول/جوز هند', nameEn: 'Coconut Oil', category: 'fats', servingSizeGrams: 10, calories: 86, protein: 0, carbs: 0, fats: 10 },

  // FRUITS & VEGGIES
  { id: 'f23', nameAr: 'موز طازج', nameEn: 'Fresh Banana', category: 'fruits', servingSizeGrams: 100, calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  { id: 'f24', nameAr: 'تفاح طازج', nameEn: 'Fresh Apple', category: 'fruits', servingSizeGrams: 100, calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },
  { id: 'f25', nameAr: 'توت / فراولة طازجة', nameEn: 'Fresh Strawberries', category: 'fruits', servingSizeGrams: 100, calories: 32, protein: 0.7, carbs: 7.7, fats: 0.3 },
  { id: 'f26', nameAr: 'بروكلي / سبانخ / خضار مشكل', nameEn: 'Steamed Broccoli', category: 'veggies', servingSizeGrams: 100, calories: 35, protein: 2.4, carbs: 7.2, fats: 0.4 },
  { id: 'f27', nameAr: 'خيار وخس وطماطم طازجة', nameEn: 'Fresh Salad Mix', category: 'veggies', servingSizeGrams: 150, calories: 25, protein: 1, carbs: 5, fats: 0.2 },

  // DAIRY & OTHERS
  { id: 'f28', nameAr: 'زبادي يوناني سادة', nameEn: 'Plain Greek Yogurt', category: 'dairy', servingSizeGrams: 100, calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
  { id: 'f29', nameAr: 'حليب خالي الدسم', nameEn: 'Skimmed Milk', category: 'dairy', servingSizeGrams: 100, calories: 35, protein: 3.4, carbs: 5, fats: 0.1 }
];

export const INITIAL_TRAINEES: Trainee[] = [
  {
    id: 'tr-1',
    name: 'أحمد حسن',
    phone: '+20 101 234 5678',
    email: 'ahmed@limbyfit.com',
    password: 'fit1234',
    age: 26,
    gender: 'male',
    height: 178,
    weight: 84,
    targetWeight: 75,
    goal: 'fat_loss',
    activityLevel: 'heavy',
    workoutDays: 5,
    bodyFatPercentage: 18,
    notes: 'يرغب في التنشيف مع الحفاظ على الكتلة العضلية.',
    createdAt: '2026-08-01',
    progressLogs: [
      { id: 'p1', date: '2026-08-01', weight: 87, waistCm: 90, chestCm: 104 },
      { id: 'p2', date: '2026-08-08', weight: 85.5, waistCm: 88, chestCm: 104 },
      { id: 'p3', date: '2026-08-11', weight: 84, waistCm: 86.5, chestCm: 104.5 }
    ]
  },
  {
    id: 'tr-2',
    name: 'محمد علي',
    phone: '+20 102 987 6543',
    email: 'mohamed@limbyfit.com',
    password: 'fit5678',
    age: 24,
    gender: 'male',
    height: 182,
    weight: 76,
    targetWeight: 82,
    goal: 'muscle_gain',
    activityLevel: 'heavy',
    workoutDays: 6,
    bodyFatPercentage: 12,
    notes: 'هدف تضخيم نظيف دون زيادات دهون عالية.',
    createdAt: '2026-08-05',
    progressLogs: [
      { id: 'p10', date: '2026-08-05', weight: 75 },
      { id: 'p11', date: '2026-08-11', weight: 76 }
    ]
  },
  {
    id: 'tr-3',
    name: 'يارا مصطفى',
    phone: '+20 109 555 4433',
    email: 'yara@limbyfit.com',
    password: 'fit9012',
    age: 23,
    gender: 'female',
    height: 165,
    weight: 62,
    targetWeight: 58,
    goal: 'recomp',
    activityLevel: 'moderate',
    workoutDays: 4,
    bodyFatPercentage: 24,
    notes: 'تحسين هيئة الجسم ونحت الخصر.',
    createdAt: '2026-08-10',
    progressLogs: [
      { id: 'p20', date: '2026-08-10', weight: 62 }
    ]
  }
];

export const SAMPLE_DIET_PLAN: DietPlan = {
  id: 'plan-1',
  traineeId: 'tr-1',
  traineeName: 'أحمد حسن',
  planName: 'نظام التنشيف الاحترافي - 2,020 سعرة',
  createdAt: '2026-08-11',
  targetMacros: {
    calories: 2020,
    proteinGrams: 180,
    carbsGrams: 200,
    fatsGrams: 55,
    proteinRatio: 2.2
  },
  actualMacros: {
    calories: 2020,
    proteinGrams: 180,
    carbsGrams: 200,
    fatsGrams: 55,
    proteinRatio: 2.2
  },
  meals: [
    {
      id: 'm1',
      type: 'breakfast',
      titleAr: 'وجبة الإفطار',
      titleEn: 'Breakfast',
      timing: '08:30 AM',
      items: [
        { foodId: 'f11', foodNameAr: 'شوفان كامل', foodNameEn: 'Rolled Oats', grams: 60, calories: 233, protein: 10, carbs: 40, fats: 4, alternatives: [
          { foodId: 'f15', foodNameAr: 'توست بني كامل', foodNameEn: 'Whole Wheat Toast', grams: 90, calories: 230, protein: 11, carbs: 38, fats: 3 },
          { foodId: 'f17', foodNameAr: 'خبز بلدي مصري', foodNameEn: 'Baladi Bread', grams: 90, calories: 234, protein: 7, carbs: 47, fats: 2 }
        ]},
        { foodId: 'f6', foodNameAr: 'بياض بيض', foodNameEn: 'Egg Whites', grams: 150, calories: 78, protein: 16.5, carbs: 1, fats: 0.3 },
        { foodId: 'f7', foodNameAr: 'بيض كامل', foodNameEn: 'Whole Egg', grams: 50, calories: 77, protein: 6.5, carbs: 0.5, fats: 5.5 }
      ],
      notes: 'يمكن عمل الشوفان بالماء مع إضافة القرفة وسكر دايت.',
      totalCalories: 388,
      totalProtein: 33,
      totalCarbs: 41.5,
      totalFats: 9.8
    },
    {
      id: 'm2',
      type: 'lunch',
      titleAr: 'وجبة الغداء الرئيسية',
      titleEn: 'Lunch',
      timing: '02:00 PM',
      items: [
        { foodId: 'f1', foodNameAr: 'صدور دجاج مشوية', foodNameEn: 'Grilled Chicken Breast', grams: 180, calories: 297, protein: 55.8, carbs: 0, fats: 6.5, alternatives: [
          { foodId: 'f2', foodNameAr: 'لحم بقر صافي', foodNameEn: 'Lean Beef', grams: 160, calories: 320, protein: 41, carbs: 0, fats: 16 },
          { foodId: 'f9', foodNameAr: 'سمك بلطي مشوي', foodNameEn: 'Grilled Tilapia', grams: 220, calories: 281, protein: 57, carbs: 0, fats: 6 }
        ]},
        { foodId: 'f10', foodNameAr: 'أرز بسمتي مطهو', foodNameEn: 'Cooked Basmati Rice', grams: 200, calories: 260, protein: 5.4, carbs: 56, fats: 0.6, alternatives: [
          { foodId: 'f12', foodNameAr: 'بطاطا حلوة مشوية', foodNameEn: 'Sweet Potato', grams: 260, calories: 234, protein: 5, carbs: 54, fats: 0.5 },
          { foodId: 'f13', foodNameAr: 'بطاطس مسلوقة', foodNameEn: 'Boiled Potato', grams: 270, calories: 235, protein: 5, carbs: 54, fats: 0.3 }
        ]},
        { foodId: 'f27', foodNameAr: 'طبق سلطة خضراء متنوع', foodNameEn: 'Green Salad', grams: 200, calories: 33, protein: 1.3, carbs: 6.6, fats: 0.3 }
      ],
      notes: 'تزن الكميات بعد الطبخ أو حساب الأرز 80ج قبل الطبخ.',
      totalCalories: 590,
      totalProtein: 62.5,
      totalCarbs: 62.6,
      totalFats: 7.4
    },
    {
      id: 'm3',
      type: 'pre_workout',
      titleAr: 'وجبة قبل التمرين',
      titleEn: 'Pre-Workout',
      timing: '05:00 PM',
      items: [
        { foodId: 'f23', foodNameAr: 'موز طازج', foodNameEn: 'Fresh Banana', grams: 120, calories: 107, protein: 1.3, carbs: 27.6, fats: 0.4 },
        { foodId: 'f18', foodNameAr: 'زبدة فول سوداني', foodNameEn: 'Peanut Butter', grams: 20, calories: 118, protein: 5, carbs: 4, fats: 10 }
      ],
      notes: 'تناول الوجبة قبل التمرين بـ 45-60 دقيقة.',
      totalCalories: 225,
      totalProtein: 6.3,
      totalCarbs: 31.6,
      totalFats: 10.4
    },
    {
      id: 'm4',
      type: 'post_workout',
      titleAr: 'وجبة بعد التمرين مباشرة',
      titleEn: 'Post-Workout',
      timing: '07:30 PM',
      items: [
        { foodId: 'f8', foodNameAr: 'واي بروتين آيزوليت', foodNameEn: 'Whey Protein Isolate', grams: 35, calories: 140, protein: 29, carbs: 1, fats: 1 },
        { foodId: 'f23', foodNameAr: 'موز طازج', foodNameEn: 'Fresh Banana', grams: 100, calories: 89, protein: 1.1, carbs: 23, fats: 0.3 }
      ],
      notes: 'خلط الواي بروتين بالماء الفاتر مباشرة بعد التمرين.',
      totalCalories: 229,
      totalProtein: 30.1,
      totalCarbs: 24,
      totalFats: 1.3
    },
    {
      id: 'm5',
      type: 'dinner',
      titleAr: 'وجبة العشاء',
      titleEn: 'Dinner',
      timing: '10:00 PM',
      items: [
        { foodId: 'f5', foodNameAr: 'جبنة قريش مصري', foodNameEn: 'Cottage Cheese', grams: 200, calories: 196, protein: 28, carbs: 6, fats: 8, alternatives: [
          { foodId: 'f28', foodNameAr: 'زبادي يوناني سادة', foodNameEn: 'Greek Yogurt', grams: 250, calories: 147, protein: 25, carbs: 9, fats: 1 },
          { foodId: 'f4', foodNameAr: 'تونة مصفاة', foodNameEn: 'Canned Tuna', grams: 130, calories: 150, protein: 33, carbs: 0, fats: 1.3 }
        ]},
        { foodId: 'f19', foodNameAr: 'زيت زيتون بكر', foodNameEn: 'Olive Oil', grams: 15, calories: 132, protein: 0, carbs: 0, fats: 15 },
        { foodId: 'f27', foodNameAr: 'خيار ورقيات طازجة', foodNameEn: 'Cucumbers & Leafy Greens', grams: 150, calories: 25, protein: 1, carbs: 5, fats: 0.2 }
      ],
      notes: 'وجبة غنية بكازين البروتين لبناء العضلات طوال فترة النوم.',
      totalCalories: 353,
      totalProtein: 29,
      totalCarbs: 11,
      totalFats: 23.2
    }
  ],
  supplements: [
    'كرياتين مونوهيدرات: 5 جرام يومياً بعد التمرين مباشرة مع عصير أو ماء.',
    'مولتي فيتامين: كبسولة واحدة صباحاً مع وجبة الإفطار.',
    'أوميجا 3: 2000 ملجم يومياً مع وجبة الغداء.',
    'مغنيسيوم جليسينات: 400 ملجم قبل النوم بـ 30 دقيقة لتحسين جودة النوم.'
  ],
  hydrationLiters: 4,
  sleepHours: 8,
  coachNotes: 'استمر بثبات، النتائج تظهر مع الالتزام اليومي بالتفاصيل. في حالة الشعور بالإرهاق، يمكنك استبدال أي وجبة ببديلاتها بنفس الجرامات المحددة.'
};
