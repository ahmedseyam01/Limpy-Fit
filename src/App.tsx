import React, { useState, useEffect } from 'react';
import {
  DEFAULT_COACH_PROFILE,
  INITIAL_TRAINEES,
  SAMPLE_DIET_PLAN
} from './data/initialData';
import { Trainee, DietPlan, CoachProfile, Meal, DaySchedule, AuthRole, Exercise } from './types/nutrition';
import { PdfExportView } from './components/PdfExportView';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { TraineePortalView } from './components/TraineePortalView';
import { AddTraineeModal } from './components/AddTraineeModal';
import { SettingsView } from './components/SettingsView';
import { Footer } from './components/Footer';
import {
  subscribeToCloudTrainees,
  syncTraineeToCloud,
  deleteTraineeFromCloud,
  subscribeToCloudDietPlans,
  syncPlanToCloud,
  deletePlanFromCloud,
  subscribeToCloudCoachProfile,
  syncCoachProfileToCloud
} from './lib/firebase';
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
  Sparkles,
  Search,
  Key,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';

const GOAL_LABELS_AR: Record<string, string> = {
  fat_loss: 'تنشيف وحرق دهون 🔥',
  extreme_cut: 'تنشيف قاسي سريع ⚡',
  muscle_gain: 'تضخيم وبناء عضلات 💪',
  recomp: 'إعادة تشكيل الجسم Recomp ⚖️',
  maintenance: 'تثبيت وزن وصحة عامة 🛡️'
};

export function App() {
  // Authentication Role State ('admin' | 'trainee' | null)
  const [authRole, setAuthRole] = useState<AuthRole>(() => {
    const saved = localStorage.getItem('limby_auth_role') as AuthRole;
    return saved || null;
  });

  // Logged-in Trainee ID (for Trainee role)
  const [activeTraineeId, setActiveTraineeId] = useState<string>(() => {
    return localStorage.getItem('limby_active_trainee_id') || '';
  });

  // Persistence
  const [coachProfile, setCoachProfile] = useState<CoachProfile>(() => {
    const saved = localStorage.getItem('limby_coach_profile');
    return saved ? JSON.parse(saved) : DEFAULT_COACH_PROFILE;
  });

  const [trainees, setTrainees] = useState<Trainee[]>(() => {
    const saved = localStorage.getItem('limby_trainees');
    if (saved) {
      const parsed: Trainee[] = JSON.parse(saved);
      return parsed.filter(t => t.id !== 'tr-1' && t.id !== 'tr-2' && t.id !== 'tr-3');
    }
    return INITIAL_TRAINEES;
  });

  const [dietPlans, setDietPlans] = useState<DietPlan[]>(() => {
    const saved = localStorage.getItem('limby_plans');
    if (saved) {
      const parsed: DietPlan[] = JSON.parse(saved);
      return parsed.filter(p => p.traineeId !== 'tr-1' && p.traineeId !== 'tr-2' && p.traineeId !== 'tr-3');
    }
    return [];
  });

  // Current View for Admin: 'list' | 'plan' | 'pdf' | 'settings'
  const [currentView, setCurrentView] = useState<'list' | 'plan' | 'pdf' | 'settings'>('list');
  const [selectedTraineeId, setSelectedTraineeId] = useState<string>(trainees[0]?.id || '');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Custom Delete Confirmation Modal State
  const [traineeToDelete, setTraineeToDelete] = useState<Trainee | null>(null);

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

  // Real-time Firebase Cloud Data Listeners
  useEffect(() => {
    const unsubTrainees = subscribeToCloudTrainees((cloudTrainees) => {
      if (cloudTrainees && cloudTrainees.length > 0) {
        setTrainees(cloudTrainees);
      }
    });

    const unsubPlans = subscribeToCloudDietPlans((cloudPlans) => {
      if (cloudPlans && cloudPlans.length > 0) {
        setDietPlans(cloudPlans);
      }
    });

    const unsubProfile = subscribeToCloudCoachProfile((cloudProfile) => {
      if (cloudProfile) {
        setCoachProfile(cloudProfile);
      }
    });

    return () => {
      unsubTrainees();
      unsubPlans();
      unsubProfile();
    };
  }, []);

  // Handle Admin Login
  const handleAdminLogin = () => {
    setAuthRole('admin');
    localStorage.setItem('limby_auth_role', 'admin');
  };

  // Handle Trainee Login
  const handleTraineeLogin = (traineeId: string) => {
    setAuthRole('trainee');
    setActiveTraineeId(traineeId);
    setSelectedTraineeId(traineeId);
    localStorage.setItem('limby_auth_role', 'trainee');
    localStorage.setItem('limby_active_trainee_id', traineeId);
  };

  // Handle Logout
  const handleLogout = () => {
    setAuthRole(null);
    localStorage.removeItem('limby_auth_role');
    localStorage.removeItem('limby_active_trainee_id');
  };

  // Copy Trainee Login Credentials to Clipboard
  const handleCopyCredentials = (t: Trainee) => {
    const text = `بيانات دخول المتدرب ${t.name} في تطبيق LIMBY FIT:\nالبريد الإلكتروني: ${t.email || `${t.name}@limbyfit.com`}\nكلمة المرور: ${t.password || 'fit1234'}`;
    navigator.clipboard.writeText(text);
    alert(`تم نسخ بيانات دخول المتدرب (${t.name}) إلى الحافظة! 📋`);
  };

  // Share Trainee Credentials directly on WhatsApp
  const handleShareWhatsAppCredentials = (t: Trainee) => {
    const cleanPhone = (t.phone || '').replace(/[^0-9]/g, '');
    const message = `مرحباً ${t.name} 🦾، يمكنك الآن دخول تطبيق LIMBY FIT لمشاهدة نظامك الغذائي الأسبوعي ومتابعة التطور! 🍏\n\nالبريد الإلكتروني: ${t.email || `${t.name}@limbyfit.com`}\nكلمة المرور: ${t.password || 'fit1234'}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Active Trainee & Plan
  const selectedTrainee = trainees.find(t => t.id === selectedTraineeId) || trainees[0];

  const defaultWorkoutFocusList = ['', '', '', '', '', '', ''];

  const defaultWorkoutExercisesList: Exercise[][] = [[], [], [], [], [], [], []];

  // Build standard 7-day 5-meal schedule with blank inputs by default
  const default7Days: DaySchedule[] = daysNames.map((d, idx) => ({
    dayIndex: idx,
    dayNameAr: d.ar,
    dayNameEn: d.en,
    workoutFocus: '',
    exercises: [],
    meals: [
      { id: `m1-${idx}`, type: 'breakfast', titleAr: '1. وجبة الإفطار', titleEn: 'Breakfast', items: [{ foodId: 'f1', foodNameAr: '', foodNameEn: '', grams: 150, calories: 360, protein: 32, carbs: 40, fats: 8 }], totalCalories: 360, totalProtein: 32, totalCarbs: 40, totalFats: 8, notes: '' },
      { id: `m2-${idx}`, type: 'snack_1', titleAr: '2. وجبة سناك صباحي', titleEn: 'Morning Snack', items: [{ foodId: 'f2', foodNameAr: '', foodNameEn: '', grams: 120, calories: 246, protein: 7, carbs: 32, fats: 10 }], totalCalories: 246, totalProtein: 7, totalCarbs: 32, totalFats: 10, notes: '' },
      { id: `m3-${idx}`, type: 'lunch', titleAr: '3. وجبة الغداء الرئيسية', titleEn: 'Lunch', items: [{ foodId: 'f3', foodNameAr: '', foodNameEn: '', grams: 380, calories: 503, protein: 54, carbs: 56, fats: 7 }], totalCalories: 503, totalProtein: 54, totalCarbs: 56, totalFats: 7, notes: '' },
      { id: `m4-${idx}`, type: 'post_workout', titleAr: '4. وجبة قبل/بعد التمرين', titleEn: 'Workout Snack', items: [{ foodId: 'f4', foodNameAr: '', foodNameEn: '', grams: 130, calories: 238, protein: 30, carbs: 25, fats: 2 }], totalCalories: 238, totalProtein: 30, totalCarbs: 25, totalFats: 2, notes: '' },
      { id: `m5-${idx}`, type: 'dinner', titleAr: '5. وجبة العشاء', titleEn: 'Dinner', items: [{ foodId: 'f5', foodNameAr: '', foodNameEn: '', grams: 210, calories: 270, protein: 28, carbs: 8, fats: 14 }], totalCalories: 270, totalProtein: 28, totalCarbs: 8, totalFats: 14, notes: '' }
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

  // Update Workout Focus for active day
  const handleUpdateDayWorkout = (dayIndex: number, text: string) => {
    const updatedDays = [...currentDaysSchedule];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      workoutFocus: text
    };

    const updatedPlan: DietPlan = {
      ...activePlan,
      days: updatedDays
    };

    savePlanToState(updatedPlan);
  };

  // Exercise Handlers for active day
  const handleAddExercise = (dayIndex: number) => {
    const updatedDays = [...currentDaysSchedule];
    const currentExercises = updatedDays[dayIndex].exercises || [];
    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      nameAr: '',
      sets: 3,
      reps: '10-12',
      restSeconds: 60,
      notes: ''
    };
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      exercises: [...currentExercises, newEx]
    };
    savePlanToState({ ...activePlan, days: updatedDays });
  };

  const handleUpdateExercise = (dayIndex: number, exIdx: number, field: keyof Exercise, val: any) => {
    const updatedDays = [...currentDaysSchedule];
    const currentExercises = [...(updatedDays[dayIndex].exercises || [])];
    currentExercises[exIdx] = {
      ...currentExercises[exIdx],
      [field]: val
    };
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      exercises: currentExercises
    };
    savePlanToState({ ...activePlan, days: updatedDays });
  };

  const handleDeleteExercise = (dayIndex: number, exIdx: number) => {
    const updatedDays = [...currentDaysSchedule];
    const currentExercises = (updatedDays[dayIndex].exercises || []).filter((_, i) => i !== exIdx);
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      exercises: currentExercises
    };
    savePlanToState({ ...activePlan, days: updatedDays });
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
    syncPlanToCloud(plan);
  };

  // Add Trainee Handler
  const handleAddTraineeFromModal = (newTrainee: Trainee) => {
    const updatedTrainees = [newTrainee, ...trainees];
    setTrainees(updatedTrainees);
    localStorage.setItem('limby_trainees', JSON.stringify(updatedTrainees));
    syncTraineeToCloud(newTrainee);

    setSelectedTraineeId(newTrainee.id);
    setShowAddModal(false);
    setCurrentView('plan');
  };

  // Confirm Delete Trainee
  const confirmDeleteTrainee = () => {
    if (!traineeToDelete) return;
    const targetId = traineeToDelete.id;

    const updatedTrainees = trainees.filter(t => t.id !== targetId);
    const updatedPlans = dietPlans.filter(p => p.traineeId !== targetId);

    setTrainees(updatedTrainees);
    setDietPlans(updatedPlans);

    localStorage.setItem('limby_trainees', JSON.stringify(updatedTrainees));
    localStorage.setItem('limby_plans', JSON.stringify(updatedPlans));

    deleteTraineeFromCloud(targetId);
    deletePlanFromCloud(targetId);

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

  // --- RENDER CONDITION 1: NO AUTH (SHOW LOGIN MODAL) ---
  if (authRole === null) {
    return (
      <LoginModal
        trainees={trainees}
        onAdminLogin={handleAdminLogin}
        onTraineeLogin={handleTraineeLogin}
      />
    );
  }

  // --- RENDER CONDITION 2: LOGGED IN AS TRAINEE (SHOW TRAINEE PORTAL) ---
  if (authRole === 'trainee') {
    const loggedInTrainee = trainees.find(t => t.id === activeTraineeId) || trainees[0];
    const loggedInPlan = dietPlans.find(p => p.traineeId === loggedInTrainee.id) || activePlan;

    if (currentView === 'pdf') {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white p-4">
          <button
            onClick={() => setCurrentView('list')}
            className="mb-4 bg-[#222] hover:bg-[#333] border border-[#333] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-[#9CFF00]" />
            <span>العودة لبوابة المتدرب</span>
          </button>
          <PdfExportView
            trainee={loggedInTrainee}
            plan={loggedInPlan}
            coachProfile={coachProfile}
            onBack={() => setCurrentView('list')}
          />
        </div>
      );
    }

    return (
      <TraineePortalView
        trainee={loggedInTrainee}
        dietPlan={loggedInPlan}
        coachProfile={coachProfile}
        onLogout={handleLogout}
        onUpdateTraineeProgress={(updatedTrainee) => {
          setTrainees(prev => prev.map(t => t.id === updatedTrainee.id ? updatedTrainee : t));
          syncTraineeToCloud(updatedTrainee);
        }}
        onViewPdf={() => setCurrentView('pdf')}
      />
    );
  }

  // --- RENDER CONDITION 3: LOGGED IN AS ADMIN (COACH ADMIN SYSTEM) ---
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0A0A0A] text-white font-sans antialiased select-none">
      <div className="flex-1">
      {/* Brand Navigation Bar */}
      <Navbar
        coachProfile={coachProfile}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAddModal={() => setShowAddModal(true)}
        onLogout={handleLogout}
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
                    قائمة المشتركين ({trainees.length})
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    إدارة المشتركين، إنشاء حسابات التغذية، توليد بيانات الدخول، وإرسالها بضغطة زر.
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

                  {/* Generated User Credentials Box */}
                  <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 font-mono font-bold flex items-center gap-1">
                        <Key className="w-3 h-3 text-[#9CFF00]" />
                        بيانات دخول المشترك:
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareWhatsAppCredentials(t);
                          }}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="إرسال عبر الواتساب"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>إرسال بالواتساب 💬</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const mailToCopy = t.email || `${t.name.trim().toLowerCase().replace(/\s+/g, '')}@limbyfit.com`;
                          navigator.clipboard.writeText(mailToCopy);
                          alert(`تم نسخ البريد بنجاح: ${mailToCopy}`);
                        }}
                        className="bg-[#141414] hover:bg-[#1F1F1F] px-2.5 py-1.5 rounded-xl border border-[#222] hover:border-[#9CFF00]/50 text-gray-300 flex items-center justify-between gap-1.5 transition-all cursor-pointer group/mail"
                        title="اضغط لنسخ البريد الإلكتروني"
                      >
                        <span className="truncate">✉️ {t.email || `${t.name}@limbyfit.com`}</span>
                        <Copy className="w-3 h-3 text-gray-500 group-hover/mail:text-[#9CFF00] shrink-0" />
                      </div>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          const passToCopy = t.password || 'fit1234';
                          navigator.clipboard.writeText(passToCopy);
                          alert(`تم نسخ كلمة المرور بنجاح: ${passToCopy}`);
                        }}
                        className="bg-[#141414] hover:bg-[#1F1F1F] px-2.5 py-1.5 rounded-xl border border-[#222] hover:border-[#9CFF00]/50 text-[#9CFF00] font-bold flex items-center justify-between gap-1.5 transition-all cursor-pointer group/pass"
                        title="اضغط لنسخ كلمة المرور"
                      >
                        <span className="truncate">🔑 {t.password || 'fit1234'}</span>
                        <Copy className="w-3 h-3 text-gray-500 group-hover/pass:text-[#9CFF00] shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Goal Badge for Every Trainee */}
                  <div className="bg-[#0D0D0D] border border-[#262626] p-2.5 rounded-2xl text-xs text-gray-300 font-medium flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[#9CFF00] font-bold shrink-0">🎯 الهدف:</span>
                      <span className="font-extrabold text-white truncate">
                        {GOAL_LABELS_AR[t.goal] || 'تنشيف وحرق دهون 🔥'}
                      </span>
                    </div>
                    {t.notes && (
                      <span className="text-[10px] text-gray-400 truncate max-w-[140px]" title={t.notes}>
                        ({t.notes})
                      </span>
                    )}
                  </div>

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
                      className={`py-2.5 px-1.5 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer ${isActive
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

              {/* Workout Focus Input for Active Day */}
              <div className="bg-[#0D0D0D] border border-[#262626] focus-within:border-[#9CFF00] p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all">
                <div className="flex items-center gap-2 text-xs font-bold text-white shrink-0">
                  <Dumbbell className="w-4 h-4 text-[#9CFF00]" />
                  <span>تمرين اليوم (عضلة اليوم / راحة):</span>
                </div>
                <input
                  type="text"
                  value={currentDaysSchedule[activeDayIndex]?.workoutFocus || ''}
                  onChange={(e) => handleUpdateDayWorkout(activeDayIndex, e.target.value)}
                  placeholder="مثال: عضلات الصدر والكتف / راحة تامة..."
                  className="w-full sm:w-2/3 bg-[#141414] border border-[#222222] focus:border-[#9CFF00] text-[#9CFF00] text-xs font-bold rounded-xl py-2 px-3 outline-none transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* MEALS LIST FOR ACTIVE DAY */}
            <div className="space-y-4">
              {currentDayMeals.map((meal, mIdx) => (
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

                  <div>
                    <input
                      type="text"
                      value={meal.items[0]?.foodNameAr || ''}
                      onChange={(e) => handleUpdateMealText(mIdx, e.target.value)}
                      placeholder="اكتب أطعمة هذه الوجبة هنا بالتفصيل..."
                      className="w-full bg-[#0D0D0D] border border-[#262626] focus:border-[#9CFF00] text-white text-xs rounded-2xl p-3 outline-none font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* WORKOUT EXERCISES FOR ACTIVE DAY */}
            <div className="bg-[#141414] border border-[#262626] rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-[#9CFF00]" />
                  <h3 className="text-base font-extrabold text-white">
                    جدول تمارين يوم ({currentDaysSchedule[activeDayIndex]?.dayNameAr})
                  </h3>
                </div>
                <button
                  onClick={() => handleAddExercise(activeDayIndex)}
                  className="bg-[#9CFF00] hover:bg-[#8BE600] text-black px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>إضافة تمرين +</span>
                </button>
              </div>

              {(!currentDaysSchedule[activeDayIndex]?.exercises || currentDaysSchedule[activeDayIndex]?.exercises?.length === 0) ? (
                <div className="text-center py-6 text-xs text-gray-500 bg-[#0D0D0D] border border-[#222] rounded-2xl">
                  لا يوجد تمارين مضافة لهذا اليوم بعد. اضغط "إضافة تمرين +" لإضافة تمارين اليوم.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentDaysSchedule[activeDayIndex]?.exercises?.map((ex, exIdx) => (
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
                          onChange={(e) => handleUpdateExercise(activeDayIndex, exIdx, 'nameAr', e.target.value)}
                          placeholder="اسم التمرين (مثال: بنش بريس مستوي بالبار)..."
                          className="w-full bg-[#141414] border border-[#222222] focus:border-[#9CFF00] text-white text-xs font-bold rounded-xl py-1.5 px-3 outline-none"
                        />
                        <button
                          onClick={() => handleDeleteExercise(activeDayIndex, exIdx)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all shrink-0 cursor-pointer"
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
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleUpdateExercise(activeDayIndex, exIdx, 'sets', e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="w-full bg-[#141414] border border-[#222] focus:border-[#9CFF00] text-white text-xs text-center py-1 rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">التكرارات (Reps):</label>
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) => handleUpdateExercise(activeDayIndex, exIdx, 'reps', e.target.value)}
                            placeholder="10-12"
                            className="w-full bg-[#141414] border border-[#222] focus:border-[#9CFF00] text-white text-xs text-center py-1 rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">الراحة (ثانية):</label>
                          <input
                            type="number"
                            value={ex.restSeconds || ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleUpdateExercise(activeDayIndex, exIdx, 'restSeconds', e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="w-full bg-[#141414] border border-[#222] focus:border-[#9CFF00] text-white text-xs text-center py-1 rounded-lg outline-none"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        value={ex.notes || ''}
                        onChange={(e) => handleUpdateExercise(activeDayIndex, exIdx, 'notes', e.target.value)}
                        placeholder="ملاحظات التكنيك (مثال: النزول بطيء والتركيز على العصر العضلي)..."
                        className="w-full bg-[#141414] border border-[#222] focus:border-[#9CFF00] text-gray-300 text-[11px] py-1.5 px-3 rounded-xl outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: PDF EXPORT VIEW */}
        {currentView === 'pdf' && selectedTrainee && (
          <PdfExportView
            trainee={selectedTrainee}
            plan={activePlan}
            coachProfile={coachProfile}
            onBack={() => setCurrentView('list')}
          />
        )}

        {/* VIEW 4: SETTINGS VIEW */}
        {currentView === 'settings' && (
          <SettingsView
            coachProfile={coachProfile}
            onUpdateProfile={(updatedProfile) => {
              setCoachProfile(updatedProfile);
              localStorage.setItem('limby_coach_profile', JSON.stringify(updatedProfile));
              syncCoachProfileToCloud(updatedProfile);
            }}
          />
        )}

      </main>

      {/* CONFIRM DELETE MODAL */}
      {traineeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161616] border border-red-500/30 rounded-3xl w-full max-w-sm p-6 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">تأكيد مسح المشترك</h3>
              <p className="text-xs text-gray-400 mt-1">
                هل أنت تأكد من مسح حساب المشترك <span className="text-white font-bold">"{traineeToDelete.name}"</span> والنظام الخاص به نهائياً؟
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setTraineeToDelete(null)}
                className="w-1/2 py-2.5 rounded-xl bg-[#262626] text-gray-300 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteTrainee}
                className="w-1/2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black transition-colors cursor-pointer"
              >
                مسح المشترك 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW TRAINEE MODAL COMPONENT */}
      <AddTraineeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTrainee={handleAddTraineeFromModal}
      />

      </div>

      {/* FOOTER */}
      <Footer className="mt-6" />
    </div>
  );
}
