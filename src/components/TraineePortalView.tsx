import React, { useState } from 'react';
import { Trainee, DietPlan, CoachProfile, DaySchedule, ProgressLog } from '../types/nutrition';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { 
  Dumbbell, 
  Droplet, 
  Moon, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  Plus, 
  Clock,
  ArrowRightLeft,
  Apple,
  Info
} from 'lucide-react';

interface TraineePortalViewProps {
  trainee: Trainee;
  dietPlan?: DietPlan;
  coachProfile: CoachProfile;
  onLogout: () => void;
  onUpdateTraineeProgress: (updatedTrainee: Trainee) => void;
  onViewPdf: () => void;
}

export const TraineePortalView: React.FC<TraineePortalViewProps> = ({
  trainee,
  dietPlan,
  coachProfile,
  onLogout,
  onUpdateTraineeProgress,
  onViewPdf
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'plan' | 'progress' | 'notes'>('plan');
  
  // New Progress Log Input
  const [newWeight, setNewWeight] = useState<number>(trainee.weight);
  const [showLogModal, setShowLogModal] = useState(false);

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

  // Fallback 7-day schedule if plan doesn't have days array
  const daysSchedule: DaySchedule[] = (dietPlan && dietPlan.days && dietPlan.days.length === 7) 
    ? dietPlan.days 
    : daysNames.map((d, idx) => ({
        dayIndex: idx,
        dayNameAr: d.ar,
        dayNameEn: d.en,
        meals: dietPlan?.meals || []
      }));

  const currentDay = daysSchedule[activeDayIndex] || daysSchedule[0];
  const currentMeals = currentDay.meals;

  // Calculate total macros for current active day
  const dayCalories = currentMeals.reduce((acc, m) => acc + (m.totalCalories || 0), 0);
  const dayProtein = currentMeals.reduce((acc, m) => acc + (m.totalProtein || 0), 0);
  const dayCarbs = currentMeals.reduce((acc, m) => acc + (m.totalCarbs || 0), 0);
  const dayFats = currentMeals.reduce((acc, m) => acc + (m.totalFats || 0), 0);

  const targetCal = dietPlan?.targetMacros.calories || 2000;
  const targetProt = dietPlan?.targetMacros.proteinGrams || 150;

  // Handle adding progress log
  const handleAddProgressLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    const newLog: ProgressLog = {
      id: `p-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weight: Number(newWeight)
    };

    const updatedLogs = [newLog, ...(trainee.progressLogs || [])];
    const updatedTrainee: Trainee = {
      ...trainee,
      weight: Number(newWeight),
      progressLogs: updatedLogs
    };

    onUpdateTraineeProgress(updatedTrainee);
    setShowLogModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0A0A0A] text-white font-sans">
      <div className="flex-1">
      {/* Official LIMBY FIT Navbar */}
      <Navbar
        coachProfile={coachProfile}
        isTraineeView={true}
        traineeName={trainee.name}
        onViewPdf={onViewPdf}
        onLogout={onLogout}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        
        {/* Welcome Coach Banner */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-full bg-[#9CFF00]/5 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#9CFF00]/10 border border-[#9CFF00]/30 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-[#9CFF00] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>برنامج التغذية المعتمد من {coachProfile.name}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {dietPlan?.planName || `نظام ${trainee.name} الأسبوعي`}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                الوزن الحالي: <span className="text-[#9CFF00] font-bold">{trainee.weight} كجم</span> | الهدف: {trainee.notes || 'تنشيف وحرق دهون'}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#0D0D0D] border border-[#262626] p-3 rounded-2xl shrink-0 w-full sm:w-auto justify-around sm:justify-start">
              <div className="text-center px-3 border-l border-[#262626]">
                <span className="text-[10px] text-gray-400 block font-mono">الماء اليومي</span>
                <span className="text-sm font-black text-blue-400 flex items-center justify-center gap-1">
                  <Droplet className="w-3.5 h-3.5 fill-blue-400" />
                  {dietPlan?.hydrationLiters || 4}L
                </span>
              </div>

              <div className="text-center px-3">
                <span className="text-[10px] text-gray-400 block font-mono">ساعات النوم</span>
                <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                  <Moon className="w-3.5 h-3.5 fill-amber-400" />
                  {dietPlan?.sleepHours || 8}h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher 3-Tab Grid Bar (100% Mobile Ready) */}
        <div className="grid grid-cols-3 gap-1 bg-[#141414] border border-[#262626] p-1.5 rounded-2xl text-center shadow-md">
          <button
            onClick={() => setActiveTab('plan')}
            className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-[#9CFF00] text-black shadow-[0_0_12px_rgba(156,255,0,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span className="truncate">الجدول التغذوي</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-[#9CFF00] text-black shadow-[0_0_12px_rgba(156,255,0,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="truncate">متابعة الوزن ({trainee.progressLogs?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-[#9CFF00] text-black shadow-[0_0_12px_rgba(156,255,0,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="truncate">التعليمات</span>
          </button>
        </div>

        {/* TAB 1: 7-DAY DIET PLAN VIEW */}
        {activeTab === 'plan' && (
          <div className="space-y-5">
            
            {/* 7-Day Day Selector Bar - Fully Responsive Grid for Mobile & Desktop */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
              {daysSchedule.map((d, idx) => (
                <button
                  key={d.dayIndex}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`py-2 px-1 rounded-2xl text-center transition-all cursor-pointer border ${
                    activeDayIndex === idx
                      ? 'bg-[#9CFF00] text-black border-[#9CFF00] font-black shadow-[0_0_15px_rgba(156,255,0,0.35)] scale-[1.02]'
                      : 'bg-[#141414] text-gray-300 border-[#262626] hover:border-gray-600 font-bold'
                  }`}
                >
                  <span className="text-[9px] block font-mono opacity-80 leading-tight">اليوم {idx + 1}</span>
                  <span className="text-[11px] sm:text-xs block font-extrabold mt-0.5 leading-tight">{d.dayNameAr}</span>
                </button>
              ))}
            </div>

            {/* Daily Workout Focus Banner */}
            <div className="bg-[#141414] border border-[#9CFF00]/40 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(156,255,0,0.1)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#9CFF00]/10 border border-[#9CFF00]/30 text-[#9CFF00] flex items-center justify-center font-black shrink-0">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-mono block">جدول تمرين يوم ({daysSchedule[activeDayIndex]?.dayNameAr}):</span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white">
                    {daysSchedule[activeDayIndex]?.workoutFocus || 'استشفاء وراحة تامة 🧘‍♂️'}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] text-[#9CFF00] font-mono font-bold bg-[#9CFF00]/10 border border-[#9CFF00]/30 px-2.5 py-1 rounded-xl shrink-0">
                WORKOUT FOCUS 🏋️‍♂️
              </span>
            </div>

            {/* Daily Macro Summary Banner for Selected Day */}
            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[10px] text-gray-400 block font-mono">إجمالي السعرات</span>
                <span className="text-base sm:text-lg font-black text-[#9CFF00]">{Math.round(dayCalories)} kcal</span>
                <span className="text-[9px] text-gray-500 block">من {targetCal} kcal</span>
              </div>

              <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[10px] text-gray-400 block font-mono">البروتين اليومي</span>
                <span className="text-base sm:text-lg font-black text-white">{Math.round(dayProtein)}g</span>
                <span className="text-[9px] text-blue-400 block">من {targetProt}g</span>
              </div>

              <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[10px] text-gray-400 block font-mono">النشويات (Carbs)</span>
                <span className="text-base sm:text-lg font-black text-white">{Math.round(dayCarbs)}g</span>
                <span className="text-[9px] text-emerald-400 block">طاقة التمرين</span>
              </div>

              <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[10px] text-gray-400 block font-mono">الدهون الصحّية</span>
                <span className="text-base sm:text-lg font-black text-white">{Math.round(dayFats)}g</span>
                <span className="text-[9px] text-amber-400 block">الهرمونات</span>
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#9CFF00]" />
                <span>وجبات يوم ({currentDay.dayNameAr}) — {currentMeals.length} وجبة</span>
              </h3>

              {currentMeals.map((meal, mIdx) => (
                <div 
                  key={meal.id || mIdx}
                  className="bg-[#141414] border border-[#262626] hover:border-[#9CFF00]/40 rounded-3xl p-5 space-y-4 transition-all shadow-lg"
                >
                  {/* Meal Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#9CFF00]/10 border border-[#9CFF00]/30 text-[#9CFF00] font-black text-xs flex items-center justify-center">
                        #{mIdx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{meal.titleAr}</h4>
                        {meal.timing && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono mt-0.5">
                            <Clock className="w-3 h-3 text-[#9CFF00]" />
                            {meal.timing}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#0A0A0A] border border-[#222] px-3 py-1 rounded-xl text-xs font-mono font-bold text-[#9CFF00]">
                      {meal.totalCalories || 0} kcal
                    </div>
                  </div>

                  {/* Food Items */}
                  <div className="space-y-3">
                    {meal.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx}
                        className="bg-[#0D0D0D] border border-[#222222] rounded-2xl p-3 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C1C1C] pb-2">
                          <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9CFF00] shrink-0"></span>
                            <span>{item.foodNameAr}</span>
                          </span>
                          <span className="self-start sm:self-auto text-xs font-mono font-black text-[#9CFF00] bg-[#161616] px-2.5 py-1 rounded-lg border border-[#262626] flex items-center gap-1 shrink-0 shadow-sm">
                            <Scale className="w-3.5 h-3.5 text-[#9CFF00]" />
                            <span>الكمية: {item.grams} جرام</span>
                          </span>
                        </div>

                        {/* Nutrition details badge (100% Mobile Ready Grid) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] sm:text-xs font-mono pt-2 border-t border-[#1C1C1C]">
                          <div className="bg-[#141414] border border-[#222] px-2 py-1 rounded-lg text-gray-300 flex items-center justify-center gap-1 whitespace-nowrap">
                            <span>🔥</span>
                            <span className="text-[#9CFF00] font-bold">{item.calories}</span>
                            <span>سعرة</span>
                          </div>
                          <div className="bg-[#141414] border border-[#222] px-2 py-1 rounded-lg text-gray-300 flex items-center justify-center gap-1 whitespace-nowrap">
                            <span>🥩</span>
                            <span>بروتين:</span>
                            <span className="text-white font-bold">{item.protein}ج</span>
                          </div>
                          <div className="bg-[#141414] border border-[#222] px-2 py-1 rounded-lg text-gray-300 flex items-center justify-center gap-1 whitespace-nowrap">
                            <span>🍚</span>
                            <span>كارب:</span>
                            <span className="text-white font-bold">{item.carbs}ج</span>
                          </div>
                          <div className="bg-[#141414] border border-[#222] px-2 py-1 rounded-lg text-gray-300 flex items-center justify-center gap-1 whitespace-nowrap">
                            <span>🥑</span>
                            <span>دهون:</span>
                            <span className="text-white font-bold">{item.fats}ج</span>
                          </div>
                        </div>

                        {/* Food Alternatives If Available */}
                        {item.alternatives && item.alternatives.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#1C1C1C] space-y-1">
                            <span className="text-[10px] text-[#9CFF00] font-bold flex items-center gap-1">
                              <ArrowRightLeft className="w-3 h-3" />
                              البدائل المتاحة بنفس القيمة:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {item.alternatives.map((alt, altIdx) => (
                                <div 
                                  key={altIdx}
                                  className="bg-[#141414] border border-[#222] p-2 rounded-xl text-[11px] flex items-center justify-between text-gray-300"
                                >
                                  <span>🔄 {alt.foodNameAr}</span>
                                  <span className="font-mono font-bold text-[#9CFF00]">{alt.grams}ج</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Meal Notes */}
                  {meal.notes && (
                    <div className="p-2.5 bg-[#0D0D0D] border border-[#222] rounded-xl text-xs text-gray-300">
                      💡 <span className="font-bold text-white">طريقة التحضير/ملاحظة:</span> {meal.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Daily Workout Exercises Card for Trainee */}
            {currentDay.exercises && currentDay.exercises.length > 0 && (
              <div className="bg-[#141414] border border-[#262626] rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[#9CFF00]" />
                    <span>جدول تمارين يوم ({currentDay.dayNameAr}) 🏋️‍♂️</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#9CFF00] bg-[#0A0A0A] border border-[#222] px-3 py-1 rounded-xl">
                    {currentDay.exercises.length} تمارين
                  </span>
                </div>

                <div className="space-y-3">
                  {currentDay.exercises.map((ex, exIdx) => (
                    <div 
                      key={ex.id || exIdx}
                      className="bg-[#0D0D0D] border border-[#222222] hover:border-[#9CFF00]/30 rounded-2xl p-4 space-y-2 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[#1C1C1C] pb-2">
                        <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#9CFF00]/10 border border-[#9CFF00]/30 text-[#9CFF00] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            #{exIdx + 1}
                          </span>
                          <span>{ex.nameAr}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono pt-1 text-gray-300">
                        <span className="bg-[#141414] border border-[#222] px-2.5 py-1 rounded-lg">
                          🔥 <span className="text-[#9CFF00] font-bold">{ex.sets}</span> جولات
                        </span>
                        <span className="bg-[#141414] border border-[#222] px-2.5 py-1 rounded-lg">
                          🎯 <span className="text-white font-bold">{ex.reps}</span> تكرارات
                        </span>
                        {ex.restSeconds && (
                          <span className="bg-[#141414] border border-[#222] px-2.5 py-1 rounded-lg">
                            ⏱️ <span className="text-gray-400 font-bold">{ex.restSeconds}ث</span> راحة
                          </span>
                        )}
                      </div>

                      {ex.notes && (
                        <div className="text-[11px] text-gray-400 bg-[#141414] p-2 rounded-xl border border-[#1C1C1C] mt-2">
                          💡 <span className="text-gray-200 font-semibold">ملاحظة التكنيك:</span> {ex.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WEIGHT & PROGRESS LOGS */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#9CFF00]" />
                    <span>متابعة الوزن والقياسات الأسبوعية</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    سجل وزنك أسبوعياً صباحاً على معدة فارغة لمتابعة نسبة النزول مع الكابتن.
                  </p>
                </div>

                <button
                  onClick={() => setShowLogModal(true)}
                  className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(156,255,0,0.3)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>تسجيل وزن جديد</span>
                </button>
              </div>

              {/* Progress Logs List */}
              <div className="space-y-2.5 pt-2">
                {(!trainee.progressLogs || trainee.progressLogs.length === 0) ? (
                  <div className="text-center py-8 text-xs text-gray-500">
                    لا يوجد قياسات مسجلة بعد. اضغط "تسجيل وزن جديد" للبدء.
                  </div>
                ) : (
                  trainee.progressLogs.map((log, lIdx) => (
                    <div 
                      key={log.id || lIdx}
                      className="bg-[#0A0A0A] border border-[#222222] p-3.5 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#222] border border-[#333] font-mono text-[#9CFF00] font-bold text-xs flex items-center justify-center">
                          #{trainee.progressLogs.length - lIdx}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">قياس يوم {log.date}</span>
                          <span className="text-[10px] text-gray-500 font-mono">تسجيل المشترك</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-[#9CFF00] font-mono">{log.weight} كجم</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COACH INSTRUCTIONS & SUPPLEMENTS */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* General Instructions */}
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#9CFF00]" />
                <span>التعليمات الذهبية من الكابتن ({coachProfile.name})</span>
              </h3>

              <div className="space-y-2.5">
                {coachProfile.generalInstructions.map((inst, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-[#0D0D0D] border border-[#222222] rounded-2xl text-xs text-gray-300 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-lg bg-[#9CFF00]/10 text-[#9CFF00] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{inst}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplements List */}
            {dietPlan?.supplements && dietPlan.supplements.length > 0 && (
              <div className="bg-[#141414] border border-[#262626] rounded-3xl p-6 space-y-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#9CFF00]" />
                  <span>المكملات الغذائية الموصى بها</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dietPlan.supplements.map((supp, sIdx) => (
                    <div 
                      key={sIdx}
                      className="p-3.5 bg-[#0D0D0D] border border-[#222] rounded-2xl text-xs font-medium text-gray-200 flex items-center gap-2.5"
                    >
                      <span className="text-[#9CFF00]">💊</span>
                      <span>{supp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coach Specific Notes */}
            {dietPlan?.coachNotes && (
              <div className="bg-[#141414] border border-[#9CFF00]/30 rounded-3xl p-6 space-y-2">
                <span className="text-xs font-bold text-[#9CFF00] block">📝 ملاحظات خاصة بـ {trainee.name}:</span>
                <p className="text-xs text-gray-300 leading-relaxed bg-[#0D0D0D] p-3 rounded-2xl border border-[#222]">
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL FOR LOGGING NEW WEIGHT */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white">تسجيل الوزن الأسبوعي الجديد</h3>
            <p className="text-xs text-gray-400">أدخل وزنك صباح اليوم على معدة فارغة بالكيلوجرام.</p>

            <form onSubmit={handleAddProgressLog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">الوزن الحالي (كجم)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight === 0 || !newWeight ? '' : newWeight}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setNewWeight(e.target.value === '' ? ('' as any) : Number(e.target.value))}
                  className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#9CFF00] text-[#9CFF00] rounded-xl py-3 text-center text-lg font-black outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-[#262626] text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#9CFF00] text-black text-xs font-black shadow-[0_0_15px_rgba(156,255,0,0.3)] transition-all cursor-pointer"
                >
                  حفظ الوزن 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>

      {/* FOOTER */}
      <Footer className="mt-6" />
    </div>
  );
};
