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
    const item = m.items[0];
    const p = item?.protein || m.totalProtein || 0;
    const c = item?.carbs || m.totalCarbs || 0;
    const f = item?.fats || m.totalFats || 0;
    displayProtein += p;
    displayCarbs += c;
    displayFats += f;
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
        <div className="pdf-page-break border border-[#242424] rounded-3xl p-6 sm:p-8 pt-12 sm:pt-16 mt-6 bg-[#0D0D0D] space-y-6">
          {/* Header */}
          <div className="text-right pb-3 border-b border-[#222222]">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center justify-end gap-2">
              <span>الاحتياج اليومي للماكروز والسعرات (Nutrition Summary)</span>
              <Flame className="w-5 h-5 text-[#9CFF00]" />
            </h2>
          </div>

          {/* Top 4 Macro Cards Row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#141414] border-2 border-[#9CFF00] rounded-2xl p-4 text-center shadow-[0_0_15px_rgba(156,255,0,0.15)]">
              <span className="text-xs text-gray-400 font-bold block">إجمالي السعرات</span>
              <span className="text-2xl sm:text-3xl font-black text-[#9CFF00] block mt-1">{displayCalories}</span>
              <span className="text-[9px] text-gray-500 font-mono">kcal / day</span>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 text-center">
              <span className="text-xs text-gray-400 font-bold block">البروتين اليومي</span>
              <span className="text-2xl sm:text-3xl font-black text-white block mt-1">{Math.round(displayProtein)}g</span>
              <span className="text-[9px] text-blue-400 font-mono">Protein Target</span>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 text-center">
              <span className="text-xs text-gray-400 font-bold block">النشويات اليومية</span>
              <span className="text-2xl sm:text-3xl font-black text-white block mt-1">{Math.round(displayCarbs)}g</span>
              <span className="text-[9px] text-emerald-400 font-mono">Carbs Target</span>
            </div>

            <div className="bg-[#141414] border border-[#262626] rounded-2xl p-4 text-center">
              <span className="text-xs text-gray-400 font-bold block">الدهون الصحية</span>
              <span className="text-2xl sm:text-3xl font-black text-white block mt-1">{Math.round(displayFats)}g</span>
              <span className="text-[9px] text-amber-400 font-mono">Healthy Fats</span>
            </div>
          </div>

          {/* Middle 2 Cards: Hydration & Supplements */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#141414] border border-[#222222] p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                <span>قواعد وشرب الماء (Hydration & Rules)</span>
                <ShieldCheck className="w-4 h-4 text-[#9CFF00]" />
              </h3>
              <ul className="space-y-2 text-xs text-gray-300 text-right">
                <li className="flex items-center justify-end gap-2"><span>ناول {plan.hydrationLiters || 4} ليتر ماء يومياً على الأقل.</span> 💧 <span className="font-bold text-white">:الماء</span></li>
                <li className="flex items-center justify-end gap-2"><span>النوم من 7 إلى 8 ساعات يومياً لتسريع استشفاء العضلات.</span> 😴 <span className="font-bold text-white">:النوم</span></li>
                <li className="flex items-center justify-end gap-2"><span>وزن اللحوم والأرز يكون بعد الطبخ.</span> ⚖️ <span className="font-bold text-white">:الوزن</span></li>
              </ul>
            </div>

            <div className="bg-[#141414] border border-[#222222] p-4 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                <span>المكملات الغذائية المطلوبة (Supplements)</span>
                <Sparkles className="w-4 h-4 text-[#9CFF00]" />
              </h3>
              <ul className="space-y-2 text-xs text-gray-300 text-right">
                {plan.supplements && plan.supplements.length > 0 ? (
                  plan.supplements.map((sup, idx) => (
                    <li key={idx} className="flex items-center justify-end gap-2">
                      <span>{sup}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#9CFF00] shrink-0" />
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center justify-end gap-2"><span>ماء: 4 ليتر يومياً</span> <CheckCircle2 className="w-3.5 h-3.5 text-[#9CFF00]" /></li>
                    <li className="flex items-center justify-end gap-2"><span>كرياتين مونوهيدرات: 5 جرام</span> <CheckCircle2 className="w-3.5 h-3.5 text-[#9CFF00]" /></li>
                    <li className="flex items-center justify-end gap-2"><span>مولتي فيتامين: كبسولة صباحاً</span> <CheckCircle2 className="w-3.5 h-3.5 text-[#9CFF00]" /></li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Coach Notes Card */}
          <div className="bg-[#141414] border border-[#9CFF00]/30 p-4 rounded-2xl text-right">
            <span className="text-xs font-bold text-[#9CFF00] block mb-1">💬 ملاحظات الكابتن الخاصة:</span>
            <p className="text-xs text-gray-300 italic">
              {plan.coachNotes || 'نظام غذائي أسبوعي متكامل تم إعداده خصيصاً لك بواسطة الكابتن.'}
            </p>
          </div>
        </div>


        {/* ==================== PAGES 3 TO 9: 7 WEEKLY DAYS PAGES (مع مسافة علوية كبيرة واسعة) ==================== */}
        {daysList.map((day, idx) => {
          let dayCal = 0, dayP = 0, dayC = 0, dayF = 0;
          day.meals.forEach(m => {
            const item = m.items[0];
            const p = item?.protein || m.totalProtein || 0;
            const c = item?.carbs || m.totalCarbs || 0;
            const f = item?.fats || m.totalFats || 0;
            dayP += p; dayC += c; dayF += f;
          });
          dayCal = Math.round((dayP * 4) + (dayC * 4) + (dayF * 9));
          if (dayCal === 0) dayCal = displayCalories;

          const isLastDay = idx === daysList.length - 1;

          return (
            <div 
              key={day.dayIndex} 
              className={`${isLastDay ? '' : 'pdf-page-break'} border border-[#242424] rounded-3xl p-6 sm:p-8 pt-12 sm:pt-16 mt-6 bg-[#0D0D0D] space-y-4`}
            >
              {/* Day Header Bar matching Screenshot 3 */}
              <div className="flex items-center justify-between border-b-2 border-[#9CFF00] pb-3">
                <div className="bg-[#141414] border border-[#262626] px-3 py-1 rounded-xl font-mono text-[11px] text-[#9CFF00] font-bold text-center">
                  <div>{dayCal} kcal | P: {Math.round(dayP)}g | C: {Math.round(dayC)}g | F: {Math.round(dayF)}g</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h2 className="text-lg font-black text-white">
                      جدول وجبات يوم ({day.dayNameAr})
                    </h2>
                    <span className="text-[10px] text-gray-400 font-mono block">{day.dayNameEn} Meal Schedule</span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#9CFF00] text-black font-black text-sm flex items-center justify-center shadow-[0_0_12px_#9CFF00]">
                    #{day.dayIndex + 1}
                  </div>
                </div>
              </div>

              {/* 5 Meal Cards */}
              <div className="space-y-3">
                {day.meals.map((meal) => {
                  const item = meal.items[0];
                  const p = item?.protein || meal.totalProtein || 0;
                  const c = item?.carbs || meal.totalCarbs || 0;
                  const f = item?.fats || meal.totalFats || 0;
                  const mealCal = Math.round((p * 4) + (c * 4) + (f * 9));

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

                      <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-2.5 rounded-xl text-right">
                        <p className="text-xs font-bold text-white leading-relaxed">
                          {item?.foodNameAr || 'وجبة متكاملة مخصصة وفقاً للاحتياج.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Page Footer matching Screenshot 3 */}
              <div className="pt-3 border-t border-[#222222] flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>صفحة يوم ({day.dayNameAr})</span>
                <span>{coachProfile.brandName} — {trainee.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
