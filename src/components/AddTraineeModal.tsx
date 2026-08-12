import React, { useState } from 'react';
import { Trainee, Goal, ActivityLevel, Gender } from '../types/nutrition';
import { computeTraineeNutritionStats } from '../utils/calculator';
import { X, UserPlus, Flame, Dumbbell, Sparkles, Activity } from 'lucide-react';

interface AddTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrainee: (trainee: Trainee) => void;
}

export const AddTraineeModal: React.FC<AddTraineeModalProps> = ({ isOpen, onClose, onAddTrainee }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(80);
  const [targetWeight, setTargetWeight] = useState(72);
  const [goal, setGoal] = useState<Goal>('fat_loss');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('heavy');
  const [workoutDays, setWorkoutDays] = useState(5);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Live Nutrition Preview
  const tempTrainee: Trainee = {
    id: 'temp',
    name: name || 'متدرب جديد',
    phone,
    age: Number(age),
    gender,
    height: Number(height),
    weight: Number(weight),
    targetWeight: Number(targetWeight),
    goal,
    activityLevel,
    workoutDays: Number(workoutDays),
    notes,
    createdAt: new Date().toISOString().split('T')[0],
    progressLogs: []
  };

  const stats = computeTraineeNutritionStats(tempTrainee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTrainee: Trainee = {
      ...tempTrainee,
      id: `tr-${Date.now()}`,
      progressLogs: [
        {
          id: `p-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          weight: Number(weight)
        }
      ]
    };

    onAddTrainee(newTrainee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9CFF00] text-black flex items-center justify-center font-black">
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">إضافة متدرب جديد (السيستم بيعمل النظام أوتوماتيك 100%)</h2>
              <p className="text-xs text-gray-400">أدخل البيانات فقط وسيتم توليد الجدول والوجبات والجرامات والبدائل أوتوماتيكياً</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#262626] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coach Custom Design Info Banner */}
        <div className="mt-4 p-3 bg-[#9CFF00]/10 border border-[#9CFF00]/30 rounded-2xl flex items-center gap-3 text-xs text-[#9CFF00]">
          <Sparkles className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold block">🎨 مصمم الأنظمة الغذائية التفاعلي الخاص بك!</span>
            <span className="text-[11px] text-gray-300">أنت من يختار الوجبات والجرامات المحددة، والنظام يحسب لك السعرات والماكروز في الوقت الفعلي ويجهز لك ملف PDF للعرض والطباعة فوراً.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">اسم المتدرب بالكامل *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: محمود عبد الله"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3.5 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">رقم الهاتف / الواتساب</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 000 0000"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3.5 text-xs outline-none font-mono"
              />
            </div>
          </div>

          {/* Section 2: Body Measurements */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">السن (سنة)</label>
              <input
                type="number"
                min="12"
                max="90"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3 text-xs outline-none text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">النوع (Gender)</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-2 text-xs outline-none font-bold"
              >
                <option value="male">ذكر (Male)</option>
                <option value="female">أنثى (Female)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">الطول (سم)</label>
              <input
                type="number"
                min="120"
                max="230"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3 text-xs outline-none text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">الوزن الحالي (كجم)</label>
              <input
                type="number"
                min="30"
                max="250"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3 text-xs outline-none text-center font-bold text-[#9CFF00]"
              />
            </div>
          </div>

          {/* Section 3: Goal & Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">الهدف التغذوي (Goal)</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as Goal)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3 text-xs outline-none font-bold"
              >
                <option value="fat_loss">تنشيف وحرق دهون (-20% سعرات)</option>
                <option value="extreme_cut">تنشيف قاسي سريع (-30% سعرات)</option>
                <option value="muscle_gain">تضخيم وبناء عضلات (+15% سعرات)</option>
                <option value="recomp">إعادة تشكيل الجسم Recomp (-5%)</option>
                <option value="maintenance">تثبيت وزن وصحة العامة (0%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">مستوى النشاط (Activity Level)</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3 text-xs outline-none font-bold"
              >
                <option value="sedentary">مكتب لا يتمرن (Sedentary 1.2)</option>
                <option value="light">نشاط خفيف (Light 1.375)</option>
                <option value="moderate">نشاط متوسط 3-4 أيام (Moderate 1.55)</option>
                <option value="heavy">تمرين شديد 5-6 أيام (Heavy 1.725)</option>
                <option value="athlete">رياضي محترف يومياً (Athlete 1.9)</option>
              </select>
            </div>
          </div>

          {/* Live Calorie & Macro Calculation Card */}
          <div className="bg-[#0D0D0D] border border-[#9CFF00]/40 rounded-2xl p-4 relative overflow-hidden shadow-[0_0_20px_rgba(156,255,0,0.1)]">
            <div className="flex items-center justify-between mb-3 border-b border-[#222222] pb-2">
              <span className="text-xs font-bold text-[#9CFF00] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                الحساب التلقائي المباشر (Calculated Targets)
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Mifflin-St Jeor Formula</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-[#161616] p-2.5 rounded-xl border border-[#262626]">
                <span className="text-[10px] text-gray-400 block">احتياج السعرات</span>
                <span className="text-lg font-black text-[#9CFF00]">{stats.targetCalories} kcal</span>
                <span className="text-[9px] text-gray-500 block">TDEE: {stats.tdee}</span>
              </div>

              <div className="bg-[#161616] p-2.5 rounded-xl border border-[#262626]">
                <span className="text-[10px] text-gray-400 block">البروتين اليومي</span>
                <span className="text-lg font-black text-white">{stats.macros.proteinGrams}g</span>
                <span className="text-[9px] text-blue-400 block">{stats.macros.proteinRatio}g / kg</span>
              </div>

              <div className="bg-[#161616] p-2.5 rounded-xl border border-[#262626]">
                <span className="text-[10px] text-gray-400 block">النشويات (Carbs)</span>
                <span className="text-lg font-black text-white">{stats.macros.carbsGrams}g</span>
                <span className="text-[9px] text-emerald-400 block">طاقة التمرين</span>
              </div>

              <div className="bg-[#161616] p-2.5 rounded-xl border border-[#262626]">
                <span className="text-[10px] text-gray-400 block">الدهون الصحّية</span>
                <span className="text-lg font-black text-white">{stats.macros.fatsGrams}g</span>
                <span className="text-[9px] text-amber-400 block">الهرمونات</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">ملاحظات الكابتن عن المتدرب</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يعاني من حساسية ألبان، يفضل 5 وجبات يومياً..."
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2 px-3 text-xs outline-none resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-[#262626] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333333] text-gray-300 text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#9CFF00] hover:bg-[#8BE600] text-black text-xs font-black shadow-[0_0_15px_rgba(156,255,0,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>حفظ المتدرب وإنشاء النظام</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
