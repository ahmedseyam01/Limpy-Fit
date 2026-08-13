import React, { useState, useEffect } from 'react';
import { Trainee, Goal, ActivityLevel, Gender } from '../types/nutrition';
import { computeTraineeNutritionStats } from '../utils/calculator';
import { X, UserPlus, Flame, Dumbbell, Sparkles, Activity, Copy, Check } from 'lucide-react';

interface AddTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrainee: (trainee: Trainee) => void;
}

export const AddTraineeModal: React.FC<AddTraineeModalProps> = ({ isOpen, onClose, onAddTrainee }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number | string>(25);
  const [gender, setGender] = useState<Gender>('male');
  const [height, setHeight] = useState<number | string>(175);
  const [weight, setWeight] = useState<number | string>(80);
  const [targetWeight, setTargetWeight] = useState<number | string>(72);
  const [goal, setGoal] = useState<Goal>('fat_loss');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('heavy');
  const [workoutDays, setWorkoutDays] = useState<number | string>(5);
  const [notes, setNotes] = useState('');

  const [password, setPassword] = useState('');
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
  const [isManualEmail, setIsManualEmail] = useState(false);
  const [isManualPassword, setIsManualPassword] = useState(false);

  // Lock background body scroll when modal is open to prevent page scrolling behind modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      setName('');
      setEmail('');
      setPassword('');
      setIsManualEmail(false);
      setIsManualPassword(false);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Helper function to generate clean Email with name + 2 digits
  const generateUniqueEmail = (rawName: string): string => {
    if (!rawName.trim()) return '';
    const twoDigits = Math.floor(10 + Math.random() * 90); // Exactly 2 digits (10-99)
    const cleanLatin = rawName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (cleanLatin.length >= 2) {
      return `${cleanLatin}${twoDigits}@limbyfit.com`;
    }
    return `user${twoDigits}@limbyfit.com`;
  };

  // Helper function to generate clean Passcode (e.g. fit5338)
  const generateUniquePassword = (): string => {
    const fourDigits = Math.floor(1000 + Math.random() * 9000);
    return `fit${fourDigits}`;
  };

  // Auto-generate credentials based on name
  const handleNameChange = (val: string) => {
    setName(val);
    const trimmed = val.trim();
    if (!trimmed) {
      if (!isManualEmail) setEmail('');
      if (!isManualPassword) setPassword('');
    } else {
      if (!isManualEmail) {
        setEmail(generateUniqueEmail(val));
      }
      if (!isManualPassword && !password) {
        setPassword(generateUniquePassword());
      }
    }
  };

  const handleRegenerateCredentials = () => {
    setIsManualEmail(false);
    setIsManualPassword(false);
    setEmail(generateUniqueEmail(name));
    setPassword(generateUniquePassword());
  };

  if (!isOpen) return null;

  // Live Nutrition Preview
  const tempTrainee: Trainee = {
    id: 'temp',
    name: name || 'متدرب جديد',
    phone,
    email: email || `${name.trim() || 'user'}@limbyfit.com`,
    password: password || 'fit1234',
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

    const finalEmail = email || `${name.trim().toLowerCase().replace(/\s+/g, '')}${Math.floor(100 + Math.random() * 900)}@limbyfit.com`;
    const finalPassword = password || ('fit' + Math.floor(1000 + Math.random() * 9000));

    const newTrainee: Trainee = {
      ...tempTrainee,
      id: `tr-${Date.now()}`,
      email: finalEmail,
      password: finalPassword,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2.5 sm:p-5 overscroll-none">
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden my-auto">
        
        {/* Top Header Bar */}
        <div className="shrink-0 bg-[#161616] px-4 sm:px-6 py-3.5 border-b border-[#262626] flex items-center justify-between gap-2 rounded-t-3xl z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#9CFF00] text-black flex items-center justify-center font-black shrink-0 shadow-[0_0_10px_rgba(156,255,0,0.3)]">
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-black text-white leading-tight truncate">إضافة متدرب جديد</h2>
              <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">توليد النظام الغذائي وبيانات الدخول تلقائياً</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#222222] hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-[#333333] hover:border-red-500/40 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95"
            title="إغلاق النافذة"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
            <span>إغلاق</span>
          </button>
        </div>

        {/* Modal Scrollable Body Content (Direct scroll inside modal) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-pan-y overscroll-contain no-scrollbar">

        {/* Coach Custom Design Info Banner */}
        <div className="p-3 bg-[#9CFF00]/10 border border-[#9CFF00]/30 rounded-2xl flex items-center gap-2.5 text-xs text-[#9CFF00]">
          <Sparkles className="w-4.5 h-4.5 shrink-0" />
          <div>
            <span className="font-bold block text-[11px] sm:text-xs">🎨 مصمم الأنظمة الغذائية التفاعلي الخاص بك!</span>
            <span className="text-[10px] sm:text-[11px] text-gray-300 block leading-tight mt-0.5">أنت من يختار الوجبات والجرامات، والنظام يحسب السعرات والماكروز فوراً ويجهز ملف PDF جاهز للطباعة.</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-4 sm:mt-5">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">اسم المتدرب بالكامل *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="مثال: محمود عبد الله"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2 px-3 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">رقم الهاتف / الواتساب *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 000 0000"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2 px-3 text-xs outline-none font-mono"
              />
            </div>
          </div>

          {/* Section 1.5: Auto-Generated User Credentials Box */}
          <div className="bg-[#0A0A0A] border border-[#9CFF00]/30 rounded-2xl p-3 sm:p-4 space-y-2.5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
              <span className="text-xs font-bold text-[#9CFF00] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>بيانات دخول المتدرب (توليد أوتوماتيكي)</span>
              </span>
              <button
                type="button"
                onClick={handleRegenerateCredentials}
                className="text-[10px] bg-[#222] hover:bg-[#333] text-gray-300 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer self-end sm:self-auto"
              >
                <span>إعادة توليد 🔄</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">البريد الإلكتروني للدخول *</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsManualEmail(true);
                    }}
                    placeholder="user@limbyfit.com"
                    className="w-full bg-[#141414] border border-[#262626] focus:border-[#9CFF00] text-[#9CFF00] rounded-xl py-2 pr-3 pl-10 text-xs outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (email) {
                        navigator.clipboard.writeText(email);
                        setCopiedField('email');
                        setTimeout(() => setCopiedField(null), 2000);
                      }
                    }}
                    className="absolute left-2.5 bg-[#222] hover:bg-[#333] text-[#9CFF00] px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="نسخ البريد الإلكتروني"
                  >
                    {copiedField === 'email' ? (
                      <>
                        <Check className="w-3 h-3 text-[#9CFF00]" />
                        <span>تم!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">كلمة المرور (Passcode) *</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setIsManualPassword(true);
                    }}
                    placeholder="fit1234"
                    className="w-full bg-[#141414] border border-[#262626] focus:border-[#9CFF00] text-white rounded-xl py-2 pr-3 pl-10 text-xs outline-none font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (password) {
                        navigator.clipboard.writeText(password);
                        setCopiedField('password');
                        setTimeout(() => setCopiedField(null), 2000);
                      }
                    }}
                    className="absolute left-2.5 bg-[#222] hover:bg-[#333] text-[#9CFF00] px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="نسخ كلمة المرور"
                  >
                    {copiedField === 'password' ? (
                      <>
                        <Check className="w-3 h-3 text-[#9CFF00]" />
                        <span>تم!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Body Measurements */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">السن (سنة) *</label>
              <input
                type="number"
                required
                min="12"
                max="90"
                value={age === 0 || age === '' ? '' : age}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3 text-xs outline-none text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">النوع (Gender) *</label>
              <select
                value={gender}
                required
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-2 text-xs outline-none font-bold"
              >
                <option value="male">ذكر (Male)</option>
                <option value="female">أنثى (Female)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">الطول (سم) *</label>
              <input
                type="number"
                required
                min="120"
                max="230"
                value={height === 0 || height === '' ? '' : height}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3 text-xs outline-none text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">الوزن الحالي (كجم) *</label>
              <input
                type="number"
                required
                min="30"
                max="250"
                value={weight === 0 || weight === '' ? '' : weight}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2.5 px-3 text-xs outline-none text-center font-bold text-[#9CFF00]"
              />
            </div>
          </div>

          {/* Section 3: Goal & Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">الهدف التغذوي (Goal) *</label>
              <select
                value={goal}
                required
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
              <label className="block text-xs font-bold text-gray-300 mb-1.5">مستوى النشاط (Activity Level) *</label>
              <select
                value={activityLevel}
                required
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
            <label className="block text-xs font-bold text-gray-300 mb-1.5">ملاحظات الكابتن عن المتدرب (اختياري)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يعاني من حساسية ألبان، يفضل 5 وجبات يومياً... (يمكن تركها فارغة)"
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#9CFF00] text-white rounded-xl py-2 px-3 text-xs outline-none resize-none"
            />
          </div>

          {/* Submit Action Footer */}
          <div className="pt-4 border-t border-[#262626] flex items-center justify-end gap-3 mt-6 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333333] text-gray-300 text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 sm:px-6 py-3 rounded-xl bg-[#9CFF00] hover:bg-[#8BE600] text-black text-xs sm:text-sm font-black shadow-[0_0_20px_rgba(156,255,0,0.35)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>حفظ المتدرب وإنشاء النظام 🦾</span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
