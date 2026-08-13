import React, { useRef } from 'react';
import { Trainee, DietPlan, CoachProfile } from '../types/nutrition';
import { LimbyLogo } from './LimbyLogo';
import { 
  Printer, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

interface PdfExportViewProps {
  trainee: Trainee;
  plan: DietPlan;
  coachProfile: CoachProfile;
  onBack: () => void;
}

export const PdfExportView: React.FC<PdfExportViewProps> = ({
  trainee,
  plan,
  coachProfile,
  onBack
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const getGoalText = (goal: string) => {
    if (trainee.notes) return trainee.notes;
    switch (goal) {
      case 'fat_loss': return 'تنشيف وحرق دهون';
      case 'extreme_cut': return 'تنشيف قاسي وسريع';
      case 'muscle_gain': return 'تضخيم وبناء عضلات';
      case 'recomp': return 'إعادة تشكيل الجسم';
      default: return 'تثبيت الوزن وتغذية صحية';
    }
  };

  const daysList = plan.days && plan.days.length === 7 ? plan.days : [
    { dayIndex: 0, dayNameAr: 'السبت', dayNameEn: 'Saturday', meals: plan.meals },
    { dayIndex: 1, dayNameAr: 'الأحد', dayNameEn: 'Sunday', meals: plan.meals },
    { dayIndex: 2, dayNameAr: 'الإثنين', dayNameEn: 'Monday', meals: plan.meals },
    { dayIndex: 3, dayNameAr: 'الثلاثاء', dayNameEn: 'Tuesday', meals: plan.meals },
    { dayIndex: 4, dayNameAr: 'الأربعاء', dayNameEn: 'Wednesday', meals: plan.meals },
    { dayIndex: 5, dayNameAr: 'الخميس', dayNameEn: 'Thursday', meals: plan.meals },
    { dayIndex: 6, dayNameAr: 'الجمعة', dayNameEn: 'Friday', meals: plan.meals }
  ];

  // Dynamic Macro Totals Calculation
  let displayCalories = 0;
  let displayProtein = 0;
  let displayCarbs = 0;
  let displayFats = 0;

  const firstDayMeals = daysList[0]?.meals || plan.meals || [];
  firstDayMeals.forEach(m => {
    let mP = m.totalProtein || 0;
    let mC = m.totalCarbs || 0;
    let mF = m.totalFats || 0;
    if ((!mP && !mC && !mF) && m.items && m.items.length > 0) {
      m.items.forEach(it => {
        mP += it.protein || 0;
        mC += it.carbs || 0;
        mF += it.fats || 0;
      });
    }
    displayProtein += mP;
    displayCarbs += mC;
    displayFats += mF;
  });

  displayCalories = Math.round((displayProtein * 4) + (displayCarbs * 4) + (displayFats * 9));

  if (displayCalories === 0) {
    displayCalories = 1617;
    displayProtein = 151;
    displayCarbs = 161;
    displayFats = 41;
  }

  return (
    <div className="space-y-6 pb-24 select-none">
      {/* Top Action Toolbar (Scrolls naturally with document, hidden in print) */}
      <div className="no-print bg-[#161616] border border-[#2A2A2A] rounded-3xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-[#222222] hover:bg-[#2A2A2A] px-4 py-2.5 rounded-2xl transition-colors cursor-pointer w-full sm:w-auto"
        >
          <ArrowRight className="w-4 h-4 text-[#9CFF00]" />
          <span>الرجوع للتعديل</span>
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(156,255,0,0.35)] transition-all cursor-pointer w-full sm:w-auto"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>طباعة أو حفظ PDF بضغطة زر (Print/Save PDF)</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#262626] hover:bg-[#333333] border border-[#3A3A3A] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>تحميل مباشر</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE DOCUMENT CONTAINER */}
      <div ref={printRef} className="print-page bg-[#0A0A0A] text-white max-w-4xl mx-auto space-y-8">
        
        {/* ==================== PAGE 1: LUXURY COVER PAGE (مع مسافة علوية كبيرة واسعة) ==================== */}
        <div className="pdf-page-break border border-[#242424] rounded-3xl p-6 sm:p-8 pt-12 sm:pt-16 mt-6 bg-gradient-to-b from-[#141414] via-[#0D0D0D] to-[#0A0A0A] relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#9CFF00]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Cover Header Bar */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-5">
            <div className="font-mono text-right">
              <span className="text-[11px] text-[#9CFF00] uppercase block tracking-widest font-bold">CERTIFIED NUTRITION PLAN</span>
              <span className="text-xs text-gray-400 block mt-1 font-mono">DATE: {plan.createdAt}</span>
            </div>

            <LimbyLogo size="md" showSubtitle={true} />
          </div>

          {/* Cover Main Title Box */}
          <div className="text-center space-y-2.5 py-2">
            <span className="inline-block px-4 py-1 rounded-full text-[11px] font-mono font-bold bg-[#9CFF00]/10 border border-[#9CFF00]/30 text-[#9CFF00]">
              OFFICIAL TRAINEE REPORT
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white italic tracking-tight uppercase leading-tight">
              PERSONAL <span className="text-[#9CFF00]">NUTRITION PLAN</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-mono tracking-widest uppercase">
              CUSTOM DIET & MACRO SCHEDULE PREPARED FOR YOUR GOALS
            </p>
          </div>

          {/* Trainee Profile Badges Grid */}
          <div className="bg-[#111111] border border-[#222222] p-5 rounded-2xl grid grid-cols-2 gap-4">
            <div className="text-right">
              <span className="text-xs text-gray-500 font-bold block">اسم المتدرب (Client)</span>
              <span className="text-base font-black text-white block mt-1">{trainee.name}</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-500 font-bold block">الهدف (Goal)</span>
              <span className="text-sm font-black text-[#9CFF00] block mt-1">{getGoalText(trainee.goal)}</span>
            </div>

            <div className="text-right border-t border-[#222222] pt-3">
              <span className="text-xs text-gray-500 font-bold block">الوزن والطول</span>
              <span className="text-sm font-bold text-white block mt-1">{trainee.weight} كجم | {trainee.height} سم</span>
            </div>

            <div className="text-right border-t border-[#222222] pt-3">
              <span className="text-xs text-gray-500 font-bold block">الكابتن المسؤول (Coach)</span>
              <span className="text-sm font-black text-[#9CFF00] block mt-1">{coachProfile.name}</span>
            </div>
          </div>

          {/* Cover Footer */}
          <div className="pt-3 border-t border-[#222222] flex items-center justify-between text-xs text-gray-500 font-mono">
            <span className="text-[#9CFF00] font-bold">FUEL YOUR PROGRESS</span>
            <span>{coachProfile.brandName} © 2026</span>
          </div>
        </div>


        {/* ==================== PAGE 2: NUTRITION SUMMARY PAGE (مع مسافة علوية كبيرة واسعة) ==================== */}
        <div className="pdf-page-break border border-[#242424] rounded-3xl p-4 sm:p-8 pt-8 sm:pt-16 mt-6 bg-[#0D0D0D] space-y-6">
          {/* Header */}
          <div className="text-right pb-3 border-b border-[#222222]">
            <h2 className="text-base sm:text-xl font-black text-white flex items-center justify-end gap-2">
              <span>الاحتياج اليومي للماكروز والسعرات (Nutrition Summary)</span>
              <Flame className="w-5 h-5 text-[#9CFF00] shrink-0" />
            </h2>
          </div>

          {/* Top 4 Macro Cards Row (2 cols on mobile, 4 on desktop & print) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-[#141414] border-2 border-[#9CFF00] rounded-2xl p-3 sm:p-4 text-center shadow-[0_0_15px_rgba(156,255,0,0.15)]">
              <span className="text-[11px] sm:text-xs text-gray-400 font-bold block">إجمالي السعرات</span>
              <span className="text-xl sm:text-3xl font-black text-[#9CFF00] block mt-1">{displayCalories}</span>
              <span className="text-[9px] text-gray-500 font-mono">kcal / day</span>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-[11px] sm:text-xs text-gray-400 font-bold block">البروتين اليومي</span>
              <span className="text-xl sm:text-3xl font-black text-white block mt-1">{Math.round(displayProtein)}g</span>
              <span className="text-[9px] text-blue-400 font-mono">Protein Target</span>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-[11px] sm:text-xs text-gray-400 font-bold block">النشويات اليومية</span>
              <span className="text-xl sm:text-3xl font-black text-white block mt-1">{Math.round(displayCarbs)}g</span>
              <span className="text-[9px] text-emerald-400 font-mono">Carbs Target</span>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-3 sm:p-4 text-center">
              <span className="text-[11px] sm:text-xs text-gray-400 font-bold block">الدهون الصحية</span>
              <span className="text-xl sm:text-3xl font-black text-white block mt-1">{Math.round(displayFats)}g</span>
              <span className="text-[9px] text-amber-400 font-mono">Healthy Fats</span>
            </div>
          </div>

          {/* Middle 2 Cards: Hydration & Supplements (1 col on mobile, 2 on desktop & print) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-4">
            <div className="bg-[#141414] border border-[#222222] p-4 rounded-2xl space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center justify-end gap-1.5 flex-wrap">
                <span className="font-mono text-[#9CFF00] text-[10px] sm:text-xs font-semibold">(Hydration & Rules)</span>
                <span>قواعد وإرشادات التغذية</span>
                <ShieldCheck className="w-4 h-4 text-[#9CFF00] shrink-0" />
              </h3>
              <ul className="space-y-2.5 text-xs text-gray-300 text-right">
                <li className="flex items-start justify-end gap-2">
                  <span className="text-right">ناول {plan.hydrationLiters || 4} ليتر ماء يومياً على الأقل.</span>
                  <span className="font-bold text-white whitespace-nowrap shrink-0">💧 الماء:</span>
                </li>
                <li className="flex items-start justify-end gap-2">
                  <span className="text-right">النوم من 7 إلى 8 ساعات يومياً لتسريع استشفاء العضلات.</span>
                  <span className="font-bold text-white whitespace-nowrap shrink-0">😴 النوم:</span>
                </li>
                <li className="flex items-start justify-end gap-2">
                  <span className="text-right">وزن اللحوم والأرز يكون بعد الطبخ.</span>
                  <span className="font-bold text-white whitespace-nowrap shrink-0">⚖️ الوزن:</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#141414] border border-[#222222] p-4 rounded-2xl space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center justify-end gap-1.5 flex-wrap">
                <span className="font-mono text-[#9CFF00] text-[10px] sm:text-xs font-semibold">(Supplements)</span>
                <span>المكملات الغذائية المطلوبة</span>
                <Sparkles className="w-4 h-4 text-[#9CFF00] shrink-0" />
              </h3>
              <ul className="space-y-2.5 text-xs text-gray-300 text-right">
                {plan.supplements && plan.supplements.length > 0 ? (
                  plan.supplements.map((sup, idx) => (
                    <li key={idx} className="flex items-center justify-end gap-2">
                      <span>{sup}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#9CFF00] shrink-0" />
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center justify-end gap-2"><span className="font-medium">ماء: 4 ليتر يومياً</span> <CheckCircle2 className="w-3.5 h-3.5 text-[#9CFF00] shrink-0" /></li>
                    <li className="flex items-center justify-end gap-2"><span className="font-medium">كرياتين مونوهيدرات: 5 جرام</span> <CheckCircle2 className="w-3.5 h-3.5 text-[#9CFF00] shrink-0" /></li>
                    <li className="flex items-center justify-end gap-2"><span className="font-medium">مولتي فيتامين: كبسولة صباحاً</span> <CheckCircle2 className="w-3.5 h-3.5 text-[#9CFF00] shrink-0" /></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Coach Notes Card */}
          <div className="bg-[#141414] border border-[#9CFF00]/30 p-4 rounded-2xl text-right space-y-1">
            <span className="text-xs font-bold text-[#9CFF00] flex items-center justify-end gap-1">
              <span>ملاحظات الكابتن الخاصة</span>
              <span>💬</span>
            </span>
            <p className="text-xs text-gray-300 italic leading-relaxed">
              {plan.coachNotes || 'نظام غذائي أسبوعي متكامل تم إعداده خصيصاً لك بواسطة الكابتن.'}
            </p>
          </div>
        </div>


        {/* ==================== PAGES 3 TO 9: 7 WEEKLY DAYS PAGES (مع مسافة علوية كبيرة واسعة) ==================== */}
        {daysList.map((day, idx) => {
          let dayCal = 0, dayP = 0, dayC = 0, dayF = 0;
          day.meals.forEach(m => {
            let mP = m.totalProtein || 0;
            let mC = m.totalCarbs || 0;
            let mF = m.totalFats || 0;
            if ((!mP && !mC && !mF) && m.items && m.items.length > 0) {
              m.items.forEach(it => {
                mP += it.protein || 0;
                mC += it.carbs || 0;
                mF += it.fats || 0;
              });
            }
            dayP += mP; dayC += mC; dayF += mF;
          });
          dayCal = Math.round((dayP * 4) + (dayC * 4) + (dayF * 9));
          if (dayCal === 0) dayCal = displayCalories;

          const isLastDay = idx === daysList.length - 1;

          return (
            <div 
              key={day.dayIndex} 
              className={`${isLastDay ? '' : 'pdf-page-break'} border border-[#242424] rounded-3xl p-6 sm:p-8 pt-12 sm:pt-16 mt-6 bg-[#0D0D0D] space-y-4`}
            >
              {/* Day Header Bar matching Screenshot 3 - Responsive for Mobile */}
              <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-[#9CFF00] pb-3">
                <div className="bg-[#141414] border border-[#262626] px-3 py-1.5 rounded-xl font-mono text-[10px] sm:text-[11px] text-[#9CFF00] font-bold text-center w-full sm:w-auto">
                  <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                    <span>{dayCal} kcal</span>
                    <span className="text-gray-600">|</span>
                    <span>P: {Math.round(dayP)}g</span>
                    <span className="text-gray-600">|</span>
                    <span>C: {Math.round(dayC)}g</span>
                    <span className="text-gray-600">|</span>
                    <span>F: {Math.round(dayF)}g</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <div className="text-right">
                    <h2 className="text-base sm:text-lg font-black text-white">
                      جدول وجبات يوم ({day.dayNameAr})
                    </h2>
                    <span className="text-[10px] text-gray-400 font-mono block">{day.dayNameEn} Meal Schedule</span>
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#9CFF00] text-black font-black text-xs sm:text-sm flex items-center justify-center shadow-[0_0_12px_#9CFF00] shrink-0">
                    #{day.dayIndex + 1}
                  </div>
                </div>
              </div>

              {/* Daily Workout Focus Banner in PDF */}
              <div className="bg-[#0A0A0A] border border-[#262626] p-2.5 rounded-xl flex items-center justify-between text-xs font-bold my-3">
                <span className="text-[#9CFF00] flex items-center gap-1.5 font-mono">
                  <span>🏋️‍♂️</span>
                  <span>WORKOUT FOCUS:</span>
                </span>
                <span className="text-white font-extrabold">{day.workoutFocus || 'راحة تامة واستشفاء'}</span>
              </div>

              {/* 5 Meal Cards */}
              <div className="space-y-3">
                {day.meals.map((meal) => {
                  let p = meal.totalProtein || 0;
                  let c = meal.totalCarbs || 0;
                  let f = meal.totalFats || 0;
                  if ((!p && !c && !f) && meal.items && meal.items.length > 0) {
                    meal.items.forEach(it => {
                      p += it.protein || 0;
                      c += it.carbs || 0;
                      f += it.fats || 0;
                    });
                  }
                  const mealCal = meal.totalCalories || Math.round((p * 4) + (c * 4) + (f * 9));

                  return (
                    <div key={meal.id} className="bg-[#141414] border border-[#222222] rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between border-b border-[#222222] pb-1.5">
                        <span className="font-mono text-[10px] text-[#9CFF00] font-bold bg-[#0A0A0A] px-2.5 py-0.5 rounded-lg border border-[#262626]">
                          kcal {mealCal}
                        </span>

                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-white text-xs">{meal.titleAr}</h3>
                          <span className="w-2 h-2 rounded-full bg-[#9CFF00]"></span>
                        </div>
                      </div>

                      <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-2.5 rounded-xl text-right space-y-1.5">
                        {meal.items && meal.items.length > 0 ? (
                          meal.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center justify-between text-xs py-0.5 border-b border-[#181818] last:border-none">
                              <span className="font-bold text-[#9CFF00] font-mono">{item.grams}g</span>
                              <span className="font-bold text-white">{item.foodNameAr}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 italic">لا توجد أصناف في هذه الوجبة</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Daily Exercises Table in PDF */}
              {day.exercises && day.exercises.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#222222] space-y-2">
                  <h4 className="text-xs font-black text-white flex items-center justify-between">
                    <span className="text-[#9CFF00]">🏋️‍♂️ جدول تمارين اليوم ({day.dayNameAr})</span>
                    <span className="font-mono text-[10px] text-gray-400">{day.exercises.length} تمارين</span>
                  </h4>
                  
                  <div className="space-y-1.5">
                    {day.exercises.map((ex, exIdx) => (
                      <div key={ex.id || exIdx} className="bg-[#0A0A0A] border border-[#222222] p-2 rounded-xl text-right flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#9CFF00]/10 text-[#9CFF00] font-mono text-[10px] font-bold flex items-center justify-center">
                            #{exIdx + 1}
                          </span>
                          <span className="font-bold text-white">{ex.nameAr}</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[11px] text-gray-300">
                          <span>{ex.sets} جولات × {ex.reps}</span>
                          {ex.restSeconds && <span className="text-gray-500">({ex.restSeconds}ث راحة)</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Page Footer matching requested Copyright & Credits */}
              <div className="pt-4 mt-6 border-t border-[#222222] flex flex-col items-center justify-center text-center space-y-0.5 text-gray-400 font-sans select-none">
                <div className="text-xs font-black text-white tracking-widest uppercase font-mono">
                  LIMBY FIT © 2026
                </div>
                <div className="text-[11px] font-semibold text-gray-300">
                  Designed & Developed by <span className="text-[#9CFF00] font-black">Ahmed Seyam</span>
                </div>
                <div className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">
                  All Rights Reserved
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
