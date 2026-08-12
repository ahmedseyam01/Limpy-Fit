import React from 'react';
import { Trainee, DietPlan } from '../types/nutrition';
import { 
  Users, 
  FileCheck, 
  TrendingUp, 
  Clock, 
  UserPlus, 
  Sparkles, 
  ArrowUpRight, 
  Dumbbell, 
  ChevronLeft,
  FileText,
  Edit
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardViewProps {
  trainees: Trainee[];
  activePlans: DietPlan[];
  onOpenAddClientModal: () => void;
  onSelectTraineeForGenerator: (traineeId: string) => void;
  onSelectTraineeForPdf: (traineeId: string) => void;
}

const mockChartData = [
  { week: 'الأسبوع 1', weight: 87.0, target: 87.0 },
  { week: 'الأسبوع 2', weight: 86.2, target: 86.0 },
  { week: 'الأسبوع 3', weight: 85.1, target: 85.0 },
  { week: 'الأسبوع 4', weight: 84.4, target: 84.0 },
  { week: 'الأسبوع 5', weight: 83.8, target: 83.0 },
  { week: 'الأسبوع 6', weight: 82.5, target: 82.0 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  trainees,
  activePlans,
  onOpenAddClientModal,
  onSelectTraineeForGenerator,
  onSelectTraineeForPdf
}) => {
  const getGoalBadge = (goal: string) => {
    switch (goal) {
      case 'fat_loss':
        return { label: 'تنشيف | Fat Loss', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'extreme_cut':
        return { label: 'تنشيف قاسي', bg: 'bg-red-500/10 text-red-400 border-red-500/30' };
      case 'muscle_gain':
        return { label: 'تضخيم | Muscle Gain', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'recomp':
        return { label: 'إعادة تشكيل | Recomp', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      default:
        return { label: 'تثبيت وزن', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-full bg-[#9CFF00]/5 pointer-events-none blur-2xl"></div>

        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9CFF00] animate-pulse"></span>
            <span className="text-xs font-mono text-[#9CFF00] uppercase font-bold tracking-widest">
              LIMBY FIT ADMIN DASHBOARD
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            أهلاً بك يا كابتن! 🦾
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            نظام المتابعة والأنظمة التغذوية التلقائية للمتدربين الخاص بك
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddClientModal}
            className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(156,255,0,0.3)] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ إضافة متدرب جديد</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards matching prompt laptop screen mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5 relative group hover:border-[#9CFF00]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">إجمالي المتدربين</span>
            <div className="w-9 h-9 rounded-xl bg-[#9CFF00]/10 text-[#9CFF00] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{trainees.length}</span>
            <span className="text-xs font-bold text-[#9CFF00] flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12%
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">متدرب نشط في النظام</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5 relative group hover:border-[#9CFF00]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">الأنظمة النشطة</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{activePlans.length || trainees.length}</span>
            <span className="text-xs font-bold text-blue-400 flex items-center gap-0.5">
              100% مغطاة
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">أنظمة غذائية محدثة</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5 relative group hover:border-[#9CFF00]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">متوسط معدل التقدم</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">+12.4%</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              ممتاز 🚀
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">انخفاض دهون وزيادة عضلية</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5 relative group hover:border-[#9CFF00]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">مراجعات معلقة</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">3</span>
            <span className="text-xs font-bold text-amber-400">تحديث أسبوعي</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">قياسات تحتاج مراجعة</p>
        </div>
      </div>

      {/* Progress Chart & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart (2 Columns) matching image laptop view */}
        <div className="lg:col-span-2 bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#9CFF00]" />
                معدل تقدم المتدربين (Client Progress Weight Trend)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">نزول الوزن المتوسط للمتدربين مقابل الهدف التغذوي</p>
            </div>
            <span className="text-xs font-mono text-[#9CFF00] bg-[#9CFF00]/10 border border-[#9CFF00]/30 px-2.5 py-1 rounded-full">
              LIVE DATA
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9CFF00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9CFF00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="week" stroke="#666666" fontSize={11} />
                <YAxis stroke="#666666" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#333333', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#9CFF00' }}
                />
                <Area type="monotone" dataKey="weight" name="الوزن الحالي (كجم)" stroke="#9CFF00" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#9CFF00]" />
              إجراءات سريعة (Quick Actions)
            </h3>

            <div className="space-y-3">
              <button
                onClick={onOpenAddClientModal}
                className="w-full bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black p-4 rounded-2xl flex items-center justify-between transition-all shadow-[0_0_15px_rgba(156,255,0,0.2)] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black text-[#9CFF00] flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black block">إضافة متدرب جديد</span>
                    <span className="text-[10px] text-gray-800 font-mono">New Client Entry</span>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-black" />
              </button>

              <button
                onClick={() => onSelectTraineeForGenerator(trainees[0]?.id || 'tr-1')}
                className="w-full bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-[#333333] text-white font-bold p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#9CFF00]/10 text-[#9CFF00] flex items-center justify-center">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold block">توليد نظام غذائي تلقائي</span>
                    <span className="text-[10px] text-gray-400 font-mono">1-Click Auto Plan</span>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={() => onSelectTraineeForPdf(trainees[0]?.id || 'tr-1')}
                className="w-full bg-[#1F1F1F] hover:bg-[#2A2A2A] border border-[#333333] text-white font-bold p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold block">معاينة وتصدير PDF</span>
                    <span className="text-[10px] text-gray-400 font-mono">LIMBY Branded PDF</span>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#262626] text-center">
            <p className="text-[10px] text-gray-500 font-mono">
              LIMBY FIT — Fuel Your Progress Admin System
            </p>
          </div>
        </div>
      </div>

      {/* Recent Clients List Table matching image UI */}
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#9CFF00]" />
              قائمة المتدربين الحاليين (Recent Clients)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">اختر متدرب لتوليد النظام التغذوي أو استخراج ملف PDF</p>
          </div>

          <button
            onClick={onOpenAddClientModal}
            className="text-xs text-[#9CFF00] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>عرض الكل ({trainees.length})</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[#2A2A2A] text-gray-400 font-bold">
                <th className="pb-3 pr-4">المتدرب (Trainee)</th>
                <th className="pb-3">البيانات (الوزن/الطول/السن)</th>
                <th className="pb-3">الهدف (Goal)</th>
                <th className="pb-3">الحالة (Status)</th>
                <th className="pb-3 text-center pl-4">إجراءات (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {trainees.map((t) => {
                const goalBadge = getGoalBadge(t.goal);
                return (
                  <tr key={t.id} className="hover:bg-[#1C1C1C] transition-colors">
                    {/* Name & Phone */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center font-black text-[#9CFF00]">
                          {t.name.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{t.name}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{t.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-4 text-gray-300">
                      <span className="font-bold text-white">{t.weight} كجم</span>
                      <span className="text-gray-500 mx-1.5">|</span>
                      <span>{t.height} سم</span>
                      <span className="text-gray-500 mx-1.5">|</span>
                      <span>{t.age} سنة</span>
                    </td>

                    {/* Goal */}
                    <td className="py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${goalBadge.bg}`}>
                        {goalBadge.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#9CFF00]/10 text-[#9CFF00] border border-[#9CFF00]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9CFF00]"></span>
                        نشط (Active)
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-center pl-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onSelectTraineeForGenerator(t.id)}
                          className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-[0_0_10px_rgba(156,255,0,0.2)] transition-all cursor-pointer"
                        >
                          <Dumbbell className="w-3.5 h-3.5" />
                          <span>توليد نظام</span>
                        </button>

                        <button
                          onClick={() => onSelectTraineeForPdf(t.id)}
                          className="bg-[#262626] hover:bg-[#333333] text-gray-200 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 border border-[#3A3A3A] transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
