import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_COACH_PROFILE, 
  INITIAL_TRAINEES, 
  SAMPLE_DIET_PLAN 
} from './data/initialData';
import { Trainee, DietPlan, CoachProfile, Meal, DaySchedule } from './types/nutrition';
import { LimbyLogo } from './components/LimbyLogo';
import { PdfExportView } from './components/PdfExportView';
import { Navbar } from './components/Navbar';
import { 
  UserPlus, 
  Trash2, 
  FileText, 
  Plus, 
  ArrowRight, 
  Dumbbell, 
  Calendar,
  Copy,
  Check,
  X,
  Sparkles,
  Search,
  ChevronLeft,
  AlertTriangle
} from 'lucide-react';

export function App() {
  // Persistence
  const [coachProfile, setCoachProfile] = useState<CoachProfile>(() => {
    const saved = localStorage.getItem('limby_coach_profile');
    return saved ? JSON.parse(saved) : DEFAULT_COACH_PROFILE;
  });

  const [trainees, setTrainees] = useState<Trainee[]>(() => {
    const saved = localStorage.getItem('limby_trainees');
    return saved ? JSON.parse(saved) : INITIAL_TRAINEES;
  });

  const [dietPlans, setDietPlans] = useState<DietPlan[]>(() => {
    const saved = localStorage.getItem('limby_plans');
    return saved ? JSON.parse(saved) : [SAMPLE_DIET_PLAN];
  });

  // Current View: 'list' | 'plan' | 'pdf' | 'settings'
  const [currentView, setCurrentView] = useState<'list' | 'plan' | 'pdf' | 'settings'>('list');
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(trainees[0]?.id || '');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Delete Confirmation Modal State
  const [traineeToDelete, setTraineeToDelete] = useState<Trainee | null>(null);

  // New Trainee Form State
  const [newTraineeName, setNewTraineeName] = useState('');
  const [newTraineePhone, setNewTraineePhone] = useState('');
  const [newTraineeWeight, setNewTraineeWeight] = useState(80);
  const [newTraineeHeight, setNewTraineeHeight] = useState(175);
  const [newTraineeGoal, setNewTraineeGoal] = useState('تنشيف وحرق دهون');

  // Days list
  const daysNames = [
    { ar: 'السبت', en: 'Saturday' },
    { ar: 'الأحد', en: 'Sunday' },
    { ar: 'الإثنين', en: 'Monday' },
    { ar: 'الثلاثاء', en: 'Tuesday' },
    { ar: 'الأربعاء', en: 'Wednesday' },
    { ar: 'الخميس', en: 'Thursday' },
    { ar: 'الجمعة', en: 'Friday' }
  ];

  // Save effects
  useEffect(() => {
    localStorage.setItem('limby_trainees', JSON.stringify(trainees));
  }, [trainees]);

  useEffect(() => {
    localStorage.setItem('limby_plans', JSON.stringify(dietPlans));
  }, [dietPlans]);

  // Active Trainee & Plan
  const selectedTrainee = trainees.find(t => t.id === selectedTraineeId) || trainees[0];
  
  // Build standard 7-day 5-meal schedule with Atwater calculations
  const default7Days: DaySchedule[] = daysNames.map((d, idx) => ({
    dayIndex: idx,
    dayNameAr: d.ar,
    dayNameEn: d.en,
    meals: [
      { id: `m1-${idx}`, type: 'breakfast', titleAr: '1. وجبة الإفطار', titleEn: 'Breakfast', items: [{ foodId: 'f1', foodNameAr: 'شوفان 60ج + 4 بياض بيض + 1 بيضة كاملة', foodNameEn: 'Oats & Eggs', grams: 150, calories: 360, protein: 32, carbs: 40, fats: 8 }], totalCalories: 360, totalProtein: 32, totalCarbs: 40, totalFats: 8, notes: '' },
      { id: `m2-${idx}`, type: 'snack_1', titleAr: '2. وجبة سناك صباحي', titleEn: 'Morning Snack', items: [{ foodId: 'f2', foodNameAr: 'ثمرة موز 100ج + 20ج زبدة فول سوداني', foodNameEn: 'Banana & PB', grams: 120, calories: 246, protein: 7, carbs: 32, fats: 10 }], totalCalories: 246, totalProtein: 7, totalCarbs: 32, totalFats: 10, notes: '' },
      { id: `m3-${idx}`, type: 'lunch', titleAr: '3. وجبة الغداء الرئيسية', titleEn: 'Lunch', items: [{ foodId: 'f3', foodNameAr: '180ج صدور دجاج مشوية + 200ج أرز بسمتي + سلطة', foodNameEn: 'Chicken & Rice', grams: 380, calories: 503, protein: 54, carbs: 56, fats: 7 }], totalCalories: 503, totalProtein: 54, totalCarbs: 56, totalFats: 7, notes: '' },
      { id: `m4-${idx}`, type: 'post_workout', titleAr: '4. وجبة قبل/بعد التمرين', titleEn: 'Workout Snack', items: [{ foodId: 'f4', foodNameAr: 'سكوب واي بروتين + موز', foodNameEn: 'Whey Protein', grams: 130, calories: 238, protein: 30, carbs: 25, fats: 2 }], totalCalories: 238, totalProtein: 30, totalCarbs: 25, totalFats: 2, notes: '' },
      { id: `m5-${idx}`, type: 'dinner', titleAr: '5. وجبة العشاء', titleEn: 'Dinner', items: [{ foodId: 'f5', foodNameAr: '200ج جبنة قريش + 10ج زيت زيتون + خيار', foodNameEn: 'Cottage Cheese', grams: 210, calories: 270, protein: 28, carbs: 8, fats: 14 }], totalCalories: 270, totalProtein: 28, totalCarbs: 8, totalFats: 14, notes: '' }
    ]
  }));

  const activePlan: DietPlan = dietPlans.find(p => p.traineeId === selectedTraineeId) || {
    id: `plan-${selectedTraineeId}`,
    traineeId: selectedTraineeId,
    traineeName: selectedTrainee?.name || '',
    planName: `نظام ${selectedTrainee?.name || ''} الأسبوعي (7 أيام)`,
    createdAt: new Date().toISOString().split('T')[0],
    targetMacros: { calories: 2000, proteinGrams: 150, carbsGrams: 200, fatsGrams: 55, proteinRatio: 2 },
    actualMacros: { calories: 2000, proteinGrams: 150, carbsGrams: 200, fatsGrams: 55, proteinRatio: 2 },
    meals: default7Days[0].meals,
    days: default7Days,
    supplements: ['ماء: 4 ليتر يومياً', 'كرياتين مونوهيدرات: 5 جرام', 'مولتي فيتامين: كبسولة صباحاً'],
    hydrationLiters: 4,
    sleepHours: 8,
    coachNotes: 'نظام غذائي أسبوعي متكامل تم إعداده خصيصاً لك بواسطة الكابتن.'
  };

  const currentDaysSchedule = activePlan.days && activePlan.days.length === 7 ? activePlan.days : default7Days;
  const currentDayMeals = currentDaysSchedule[activeDayIndex]?.meals || default7Days[0].meals;

  // Copy active day meals to all 7 days of the week
  const handleCopyDayToAll = () => {
    const currentMealsCopy = JSON.parse(JSON.stringify(currentDayMeals));
    const updatedDays: DaySchedule[] = currentDaysSchedule.map((d, idx) => ({
      ...d,
      meals: currentMealsCopy.map((m: Meal) => ({ ...m, id: `m-${idx}-${Date.now()}-${m.id}` }))
    }));

    const updatedPlan: DietPlan = {
      ...activePlan,
      days: updatedDays,
      meals: currentMealsCopy
    };

    savePlanToState(updatedPlan);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Update Meal text for active day
  const handleUpdateMealText = (mealIdx: number, text: string) => {
    const updatedMeals = [...currentDayMeals];
    updatedMeals[mealIdx] = {
      ...updatedMeals[mealIdx],
      items: [
        {
          foodId: `f-custom-${mealIdx}`,
          foodNameAr: text,
          foodNameEn: text,
          grams: 100,
          calories: 300,
          protein: 25,
          carbs: 30,
          fats: 5
        }
      ]
    };

    const updatedDays = [...currentDaysSchedule];
    updatedDays[activeDayIndex] = {
      ...updatedDays[activeDayIndex],
      meals: updatedMeals
    };

    const updatedPlan: DietPlan = {
      ...activePlan,
      days: updatedDays,
      meals: updatedMeals
    };

    savePlanToState(updatedPlan);
  };

  const savePlanToState = (plan: DietPlan) => {
    setDietPlans(prev => {
      const idx = prev.findIndex(p => p.traineeId === selectedTraineeId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = plan;
        return copy;
      }
      return [plan, ...prev];
    });
  };

  // Add Trainee
  const handleAddTrainee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraineeName.trim()) return;

    const newTrainee: Trainee = {
      id: `tr-${Date.now()}`,
      name: newTraineeName,
      phone: newTraineePhone || '+20 100 000 0000',
      age: 25,
      gender: 'male',
      height: Number(newTraineeHeight),
      weight: Number(newTraineeWeight),
      goal: 'fat_loss',
      activityLevel: 'moderate',
      workoutDays: 5,
      notes: newTraineeGoal,
      createdAt: new Date().toISOString().split('T')[0],
      progressLogs: []
    };

    const updatedTrainees = [newTrainee, ...trainees];
    setTrainees(updatedTrainees);
    localStorage.setItem('limby_trainees', JSON.stringify(updatedTrainees));
    
    setSelectedTraineeId(newTrainee.id);
    setShowAddModal(false);
    setNewTraineeName('');
    setNewTraineePhone('');
    setCurrentView('plan');
  };

  // Confirm and Perform Delete Trainee reliably
  const confirmDeleteTrainee = () => {
    if (!traineeToDelete) return;
    const targetId = traineeToDelete.id;

    const updatedTrainees = trainees.filter(t => t.id !== targetId);
    const updatedPlans = dietPlans.filter(p => p.traineeId !== targetId);

    setTrainees(updatedTrainees);
    setDietPlans(updatedPlans);

    localStorage.setItem('limby_trainees', JSON.stringify(updatedTrainees));
    localStorage.setItem('limby_plans', JSON.stringify(updatedPlans));

    if (selectedTraineeId === targetId && updatedTrainees.length > 0) {
      setSelectedTraineeId(updatedTrainees[0].id);
    }

    setTraineeToDelete(null);
  };

  // Filtered Trainees Search
  const filteredTrainees = trainees.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased pb-16 select-none">
      {/* Brand Navigation Bar */}
      <Navbar
        coachProfile={coachProfile}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAddModal={() => setShowAddModal(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* VIEW 1: TRAINEES LIST (الصفحة الرئيسية للمشتركين) */}
        {currentView === 'list' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-full bg-[#9CFF00]/5 blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9CFF00] animate-pulse shadow-[0_0_10px_#9CFF00]"></span>
                    <span className="text-xs font-mono text-[#9CFF00] font-bold uppercase tracking-widest">
                      LIMBY FIT PRIVATE CLIENTS
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    قائمة المشتركين  ({trainees.length})
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    إدارة المشتركين البرايفيت، كتابة النظام الغذائي الأسبوعي (7 أيام)، واستخراج تقارير الـ PDF.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(156,255,0,0.35)] hover:shadow-[0_0_35px_rgba(156,255,0,0.55)] transition-all cursor-pointer shrink-0"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span className="font-extrabold">+ إضافة مشترك جديد</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-5 relative max-w-md">
                <Search className="w-4 h-4 text-gray-500 absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن مشترك بالاسم أو الهدف..."
                  className="w-full bg-[#0D0D0D] border border-[#262626] focus:border-[#9CFF00] text-white text-xs rounded-2xl py-2.5 pr-10 pl-3 outline-none transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Trainees Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTrainees.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTraineeId(t.id);
                    setCurrentView('plan');
                  }}
                  className="bg-[#161616] border border-[#262626] hover:border-[#9CFF00]/60 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] shadow-xl group space-y-4"
                >
                  {/* Trainee Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#222222] border border-[#333333] group-hover:border-[#9CFF00] font-black text-[#9CFF00] flex items-center justify-center text-base shadow-sm shrink-0">
                        {t.name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#9CFF00] transition-colors leading-tight">
                          {t.name}
                        </h3>
                        <span className="text-[11px] text-gray-400 font-mono block mt-0.5">
                          {t.phone}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#0D0D0D] border border-[#262626] px-2.5 py-1 rounded-xl text-[10px] text-[#9CFF00] font-mono font-bold shrink-0">
                      {t.weight} كجم | {t.height} سم
                    </div>
                  </div>

                  {/* Goal Badge */}
                  {t.notes && (
                    <div className="bg-[#0D0D0D] border border-[#222222] p-2.5 rounded-2xl text-xs text-gray-300 font-medium">
                      🎯 <span className="font-bold text-white">الهدف:</span> {t.notes}
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-[#222222] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTraineeId(t.id);
                          setCurrentView('plan');
                        }}
                        className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(156,255,0,0.25)] transition-all cursor-pointer"
                      >
                        <Dumbbell className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>تصميم النظام 📝</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTraineeId(t.id);
                          setCurrentView('pdf');
                        }}
                        className="bg-[#222222] hover:bg-[#2F2F2F] text-white border border-[#383838] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>PDF 📄</span>
                      </button>
                    </div>

                    {/* RELIABLE DELETE BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTraineeToDelete(t);
                      }}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/25 border border-red-500/20 transition-all cursor-pointer shrink-0"
                      title="مسح المشترك"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: 7-DAY DIET PLAN BUILDER FOR TRAINEE */}
        {currentView === 'plan' && selectedTrainee && (
          <div className="space-y-6">
            {/* Trainee Profile Banner */}
            <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-[#9CFF00] font-mono font-bold uppercase tracking-widest block">
                  7-DAY WEEKLY DIET PLANNER
                </span>
                <h1 className="text-2xl font-black text-white mt-0.5">{selectedTrainee.name}</h1>
                <p className="text-xs text-gray-400 mt-1">
                  الوزن: {selectedTrainee.weight} كجم | الطول: {selectedTrainee.height} سم | الهدف: {selectedTrainee.notes || 'تنشيف'}
                </p>
              </div>

              <button
                onClick={() => setCurrentView('pdf')}
                className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(156,255,0,0.4)] cursor-pointer"
              >
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <span>تصدير PDF الأسبوعي 📄</span>
              </button>
            </div>

            {/* 7-DAY PILLS BAR */}
            <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#9CFF00]" />
                  اختر اليوم لتصميم وجباته (7 أيام الأسبوع):
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyDayToAll}
                    className="bg-[#222222] hover:bg-[#333333] border border-[#3A3A3A] text-[#9CFF00] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ وجبات ({daysNames[activeDayIndex].ar}) لكل أيام الأسبوع 📋</span>
                  </button>

                  {copiedNotification && (
                    <span className="text-xs text-[#9CFF00] font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> تم النسخ!
                    </span>
                  )}
                </div>
              </div>

              {/* Days Selector Pills */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {daysNames.map((d, idx) => {
                  const isActive = activeDayIndex === idx;
                  return (
                    <button
                      key={d.en}
                      onClick={() => setActiveDayIndex(idx)}
                      className={`py-2.5 px-1.5 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer ${
                        isActive
                          ? 'bg-[#9CFF00] text-black font-black shadow-[0_0_15px_rgba(156,255,0,0.3)] scale-105'
                          : 'bg-[#0A0A0A] text-gray-400 hover:text-white border border-[#262626]'
                      }`}
                    >
                      <span className="block">{d.ar}</span>
                      <span className={`text-[9px] block font-mono ${isActive ? 'text-black' : 'text-gray-600'}`}>{d.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meals Editor for Selected Day */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#9CFF00]" />
                  وجبات يوم ({daysNames[activeDayIndex].ar}) — (5 وجبات يومياً):
                </h3>
              </div>

              {currentDayMeals.map((meal, idx) => {
                const item = meal.items[0];
                const p = item?.protein || meal.totalProtein || 0;
                const c = item?.carbs || meal.totalCarbs || 0;
                const f = item?.fats || meal.totalFats || 0;
                const exactCal = Math.round((p * 4) + (c * 4) + (f * 9));

                return (
                  <div key={meal.id} className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                      <span className="text-xs font-bold text-white">{meal.titleAr}</span>
                      <span className="text-[10px] text-[#9CFF00] font-mono font-bold bg-[#0A0A0A] px-2.5 py-1 rounded-xl border border-[#262626]">
                        {exactCal} kcal | P:{p}g C:{c}g F:{f}g
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={meal.items[0]?.foodNameAr || ''}
                      onChange={(e) => handleUpdateMealText(idx, e.target.value)}
                      placeholder="اكتب تفاصيل الوجبة والكميات بنفسك.. (مثال: 60ج شوفان + 4 بياض بيض + 1 بيضة كاملة)"
                      className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#9CFF00] text-white rounded-xl p-3 text-xs outline-none resize-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* Save & Export Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setCurrentView('list')}
                className="px-5 py-3 rounded-2xl bg-[#222222] text-gray-300 text-xs font-bold cursor-pointer"
              >
                رجوع للقائمة
              </button>
              <button
                onClick={() => setCurrentView('pdf')}
                className="px-6 py-3 rounded-2xl bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black text-xs shadow-[0_0_20px_rgba(156,255,0,0.4)] cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <span>حفظ وتصدير PDF الأسبوعي 📄</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: BRANDED PDF EXPORT */}
        {currentView === 'pdf' && selectedTrainee && (
          <PdfExportView
            trainee={selectedTrainee}
            plan={activePlan}
            coachProfile={coachProfile}
            onBack={() => setCurrentView('plan')}
          />
        )}
      </main>

      {/* CUSTOM CONFIRM DELETE MODAL */}
      {traineeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#161616] border border-red-500/30 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">مسح المشترك ({traineeToDelete.name})</h3>
              <p className="text-xs text-gray-400 mt-1">هل أنت تأكد من إلغاء وتأكيد مسح هذا المشترك ونظامه النهائيات؟</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setTraineeToDelete(null)}
                className="w-1/2 py-2.5 rounded-xl bg-[#222222] text-gray-300 text-xs font-bold cursor-pointer hover:bg-[#333333]"
              >
                إلغاء
              </button>

              <button
                onClick={confirmDeleteTrainee}
                className="w-1/2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs shadow-lg cursor-pointer transition-all"
              >
                تأكيد المسح 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW TRAINEE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="text-base font-black text-white">إضافة مشترك جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTrainee} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">اسم المشترك *</label>
                <input
                  type="text"
                  required
                  value={newTraineeName}
                  onChange={(e) => setNewTraineeName(e.target.value)}
                  placeholder="مثال: محمود علي"
                  className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#9CFF00] text-white rounded-xl p-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">رقم الهاتف / الواتساب</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newTraineePhone}
                  onChange={(e) => setNewTraineePhone(e.target.value)}
                  placeholder="+20 100 000 0000"
                  className="w-full bg-[#0A0A0A] border border-[#262626] text-white font-mono rounded-xl p-3 outline-none text-left"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">الوزن (كجم)</label>
                  <input
                    type="number"
                    value={newTraineeWeight}
                    onChange={(e) => setNewTraineeWeight(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#262626] text-[#9CFF00] font-black rounded-xl p-3 outline-none text-center"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-bold mb-1">الطول (سم)</label>
                  <input
                    type="number"
                    value={newTraineeHeight}
                    onChange={(e) => setNewTraineeHeight(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-[#262626] text-white font-bold rounded-xl p-3 outline-none text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">الهدف (Goal)</label>
                <input
                  type="text"
                  value={newTraineeGoal}
                  onChange={(e) => setNewTraineeGoal(e.target.value)}
                  placeholder="مثال: تنشيف وحرق دهون"
                  className="w-full bg-[#0A0A0A] border border-[#262626] text-white rounded-xl p-3 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#262626] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#222222] text-gray-300 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#9CFF00] text-black font-black shadow-[0_0_15px_rgba(156,255,0,0.3)] cursor-pointer"
                >
                  حفظ المشترك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
