import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Check, Copy, Dumbbell, FileText, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { DaySchedule, DietPlan, Exercise, Meal, Trainee } from '../../types/nutrition';
import { GOAL_LABELS_AR, WEEK_DAYS } from '../../constants';
import { createDefaultWeek, getWeekSchedule } from '../../utils/plan';

interface PlanBuilderViewProps {
  trainee: Trainee;
  plan: DietPlan;
  onSavePlan: (plan: DietPlan) => void;
  onExportPdf: () => void;
}

const parseOptionalInt = (value: string) => (value === '' ? undefined : parseInt(value, 10) || 0);

export function PlanBuilderView({ trainee, plan, onSavePlan, onExportPdf }: PlanBuilderViewProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const defaultWeek = useMemo(createDefaultWeek, []);
  const week = getWeekSchedule(plan, defaultWeek);
  const activeDay = week[activeDayIndex];
  const dayMeals = activeDay?.meals ?? defaultWeek[0].meals;
  const exercises = activeDay?.exercises ?? [];

  const updateActiveDay = (update: (day: DaySchedule) => DaySchedule, extra: Partial<DietPlan> = {}) => {
    const days = week.map((d, i) => (i === activeDayIndex ? update(d) : d));
    onSavePlan({ ...plan, ...extra, days });
  };

  const setExercises = (fn: (list: Exercise[]) => Exercise[]) =>
    updateActiveDay(d => ({ ...d, exercises: fn(d.exercises ?? []) }));

  const handleCopyDayToAll = () => {
    const stamp = Date.now();
    const days = week.map((d, idx) => ({
      ...d,
      meals: dayMeals.map(m => ({ ...structuredClone(m), id: `m-${idx}-${stamp}-${m.id}` }))
    }));
    onSavePlan({ ...plan, days, meals: structuredClone(dayMeals) });

    setCopiedNotification(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handleUpdateMealText = (mealIdx: number, text: string) => {
    const meals: Meal[] = dayMeals.map((m, i) =>
      i === mealIdx
        ? {
            ...m,
            items: [
              { foodId: `f-custom-${mealIdx}`, foodNameAr: text, foodNameEn: text, grams: 100, calories: 300, protein: 25, carbs: 30, fats: 5 }
            ]
          }
        : m
    );
    updateActiveDay(d => ({ ...d, meals }), { meals });
  };

  const handleUpdateExercise = <K extends keyof Exercise>(exIdx: number, field: K, value: Exercise[K]) =>
    setExercises(list => list.map((ex, i) => (i === exIdx ? { ...ex, [field]: value } : ex)));

  return (
    <div className="space-y-6">
      {/* Trainee Profile Banner */}
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-[#9CFF00] font-mono font-bold uppercase tracking-widest block">
            7-DAY WEEKLY DIET PLANNER
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">{trainee.name}</h1>
          <p className="text-xs text-gray-400 mt-1">
            الوزن: {trainee.weight} كجم | الطول: {trainee.height} سم | الهدف: {GOAL_LABELS_AR[trainee.goal] ?? GOAL_LABELS_AR.fat_loss}
          </p>
        </div>

        <button
          onClick={onExportPdf}
          className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(156,255,0,0.4)] cursor-pointer"
        >
          <FileText className="w-4 h-4 stroke-[2.5]" />
          <span>تصدير PDF الأسبوعي 📄</span>
        </button>
      </div>

      {/* 7-day selector */}
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
              <span>نسخ وجبات ({WEEK_DAYS[activeDayIndex].ar}) لكل أيام الأسبوع 📋</span>
            </button>

            {copiedNotification && (
              <span className="text-xs text-[#9CFF00] font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> تم النسخ!
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {WEEK_DAYS.map((d, idx) => {
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

        {/* Workout focus */}
        <div className="bg-[#0D0D0D] border border-[#262626] focus-within:border-[#9CFF00] p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all">
          <div className="flex items-center gap-2 text-xs font-bold text-white shrink-0">
            <Dumbbell className="w-4 h-4 text-[#9CFF00]" />
            <span>تمرين اليوم (عضلة اليوم / راحة):</span>
          </div>
          <input
            type="text"
            value={activeDay?.workoutFocus || ''}
            onChange={e => updateActiveDay(d => ({ ...d, workoutFocus: e.target.value }))}
            placeholder="مثال: عضلات الصدر والكتف / راحة تامة..."
            className="w-full sm:w-2/3 bg-[#141414] border border-[#222222] focus:border-[#9CFF00] text-[#9CFF00] text-xs font-bold rounded-xl py-2 px-3 outline-none transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {dayMeals.map((meal, mIdx) => (
          <div
            key={meal.id}
            className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-5 space-y-3 shadow-xl hover:border-[#9CFF00]/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#9CFF00] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#9CFF00]" />
                {meal.titleAr}
              </span>
              <span className="text-[10px] text-gray-400 font-mono bg-[#0D0D0D] px-2.5 py-1 rounded-xl border border-[#262626]">
                {meal.totalCalories} kcal | P: {meal.totalProtein}g | C: {meal.totalCarbs}g
              </span>
            </div>

            <input
              type="text"
              value={meal.items[0]?.foodNameAr || ''}
              onChange={e => handleUpdateMealText(mIdx, e.target.value)}
              placeholder="اكتب أطعمة هذه الوجبة هنا بالتفصيل..."
              className="w-full bg-[#0D0D0D] border border-[#262626] focus:border-[#9CFF00] text-white text-xs rounded-2xl p-3 outline-none font-medium"
            />
          </div>
        ))}
      </div>

      {/* Exercises */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#9CFF00]" />
            <h3 className="text-base font-extrabold text-white">جدول تمارين يوم ({activeDay?.dayNameAr})</h3>
          </div>
          <button
            onClick={() =>
              setExercises(list => [
                ...list,
                { id: `ex-${Date.now()}`, nameAr: '', sets: 3, reps: '10-12', restSeconds: 60, notes: '' }
              ])
            }
            className="bg-[#9CFF00] hover:bg-[#8BE600] text-black px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة تمرين +</span>
          </button>
        </div>

        {exercises.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500 bg-[#0D0D0D] border border-[#222] rounded-2xl">
            لا يوجد تمارين مضافة لهذا اليوم بعد. اضغط "إضافة تمرين +" لإضافة تمارين اليوم.
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((ex, exIdx) => (
              <div
                key={ex.id || exIdx}
                className="bg-[#0D0D0D] border border-[#222222] hover:border-[#9CFF00]/40 rounded-2xl p-3.5 space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#9CFF00]/10 border border-[#9CFF00]/30 text-[#9CFF00] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    #{exIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={ex.nameAr}
                    onChange={e => handleUpdateExercise(exIdx, 'nameAr', e.target.value)}
                    placeholder="اسم التمرين (مثال: بنش بريس مستوي بالبار)..."
                    className="w-full bg-[#141414] border border-[#222222] focus:border-[#9CFF00] text-white text-xs font-bold rounded-xl py-1.5 px-3 outline-none"
                  />
                  <button
                    onClick={() => setExercises(list => list.filter((_, i) => i !== exIdx))}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all shrink-0 cursor-pointer"
                    aria-label="حذف التمرين"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">الجولات (Sets):</label>
                    <input
                      type="number"
                      value={ex.sets || ''}
                      onFocus={e => e.target.select()}
                      onChange={e => handleUpdateExercise(exIdx, 'sets', parseOptionalInt(e.target.value) ?? 0)}
                      className="w-full bg-[#141414] border border-[#222] focus:border-[#9CFF00] text-white text-xs text-center py-1 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">التكرارات (Reps):</label>
                    <input
                      type="text"
                      value={ex.reps}
                      onChange={e => handleUpdateExercise(exIdx, 'reps', e.target.value)}
                      placeholder="10-12"
                      className="w-full bg-[#141414] border border-[#222] focus:border-[#9CFF00] text-white text-xs text-center py-1 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-0.5">الراحة (ثانية):</label>
                    <input
                      type="number"
                      value={ex.restSeconds || ''}
                      onFocus={e => e.target.select()}
                      onChange={e => handleUpdateExercise(exIdx, 'restSeconds', parseOptionalInt(e.target.value))}
                      className="w-full bg-[#141414] border border-[#222] focus:border-[#9CFF00] text-white text-xs text-center py-1 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={ex.notes || ''}
                  onChange={e => handleUpdateExercise(exIdx, 'notes', e.target.value)}
                  placeholder="ملاحظات التكنيك (مثال: النزول بطيء والتركيز على العصر العضلي)..."
                  className="w-full bg-[#141414] border border-[#222] focus:border-[#9CFF00] text-gray-300 text-[11px] py-1.5 px-3 rounded-xl outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
