import React from 'react';
import { LimbyLogo } from './LimbyLogo';
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  Database, 
  TrendingUp, 
  FileText, 
  Settings, 
  LogOut,
  Sparkles
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'clients' | 'generator' | 'foods' | 'progress' | 'pdf' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddClientModal: () => void;
  onLogout: () => void;
  traineesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddClientModal,
  onLogout,
  traineesCount
}) => {
  const navItems: { id: ActiveTab; labelAr: string; labelEn: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'clients', labelAr: 'إدارة المتدربين', labelEn: 'Clients', icon: <Users className="w-5 h-5" />, badge: `${traineesCount}` },
    { id: 'generator', labelAr: 'مولّد الأنظمة التغذوية', labelEn: 'Nutrition Plans', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'foods', labelAr: 'قاعدة الأطعمة والبدائل', labelEn: 'Food Database', icon: <Database className="w-5 h-5" /> },
    { id: 'progress', labelAr: 'متابعة القياسات', labelEn: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'pdf', labelAr: 'تصدير ملف PDF', labelEn: 'PDF Export', icon: <FileText className="w-5 h-5" /> },
    { id: 'settings', labelAr: 'هوية الكابتن واللوجو', labelEn: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-[#111111] border-l border-[#222222] flex-col justify-between min-h-screen p-4 select-none shrink-0">
      <div>
        {/* Brand Header */}
        <div className="py-4 border-b border-[#222222] flex flex-col items-center justify-center">
          <LimbyLogo size="md" showSubtitle={true} />
        </div>

        {/* Coach Quick Status */}
        <div className="mt-4 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#9CFF00] text-black font-black flex items-center justify-center text-sm shadow-[0_0_10px_rgba(156,255,0,0.3)]">
              CL
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-tight">Coach LIMBY</h4>
              <p className="text-[10px] text-[#9CFF00] font-semibold">Admin Certified</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#9CFF00] animate-pulse"></span>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#9CFF00] text-black shadow-[0_0_20px_rgba(156,255,0,0.25)] font-black'
                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <div className="text-right">
                    <span>{item.labelAr}</span>
                    <span className="block text-[9px] opacity-70 font-mono tracking-wider font-normal">
                      {item.labelEn}
                    </span>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                      isActive ? 'bg-black text-[#9CFF00]' : 'bg-[#262626] text-gray-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Add Client Button & Logout */}
      <div className="space-y-3 pt-4 border-t border-[#222222]">
        <button
          onClick={onOpenAddClientModal}
          className="w-full bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(156,255,0,0.25)] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>+ إضافة متدرب جديد</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-red-400 py-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل خروج (Exit Admin)</span>
        </button>
      </div>
    </aside>
  );
};
