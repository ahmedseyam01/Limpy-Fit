import React from 'react';
import { ActiveTab } from './Sidebar';
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  FileText, 
  Settings,
  Plus
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddClientModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddClientModal
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'clients', label: 'المتدربين', icon: <Users className="w-5 h-5" /> },
    { id: 'generator', label: 'الأنظمة', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { id: 'pdf', label: 'التقرير', icon: <FileText className="w-5 h-5" /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Floating Action Button for 1-Tap Adding Trainees (Hidden on PDF View to prevent covering document) */}
      {activeTab !== 'pdf' && (
        <button
          onClick={onOpenAddClientModal}
          className="md:hidden fixed bottom-20 left-4 z-40 w-12 h-12 bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(156,255,0,0.4)] active:scale-95 transition-all cursor-pointer"
          aria-label="إضافة متدرب جديد"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-lg border-t border-[#262626] px-2 py-2 flex items-center justify-around select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-[#9CFF00] font-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-xl transition-transform ${isActive ? 'scale-110 bg-[#9CFF00]/10' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
