import React from 'react';
import { Search, Sparkles, UserPlus } from 'lucide-react';
import { CoachProfile } from '../types/nutrition';
import { LimbyLogo } from './LimbyLogo';

interface TopNavProps {
  coachProfile: CoachProfile;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenAddClientModal: () => void;
  onQuickGenerate: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  coachProfile,
  searchTerm,
  setSearchTerm,
  onOpenAddClientModal,
  onQuickGenerate
}) => {
  return (
    <header className="h-16 border-b border-[#222222] bg-[#0D0D0D]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none overflow-hidden">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-2 shrink-0">
        <LimbyLogo size="sm" showSubtitle={false} />
      </div>

      {/* Center: Compact Search Input */}
      <div className="relative flex-1 max-w-[180px] sm:max-w-xs mx-2">
        <Search className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="بحث عن متدرب..."
          className="w-full bg-[#161616] border border-[#2A2A2A] focus:border-[#9CFF00] text-xs text-white rounded-xl py-2 pr-8 pl-2 outline-none transition-all placeholder:text-gray-600"
        />
      </div>

      {/* Right: Quick Action Buttons & Coach Badge */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={onOpenAddClientModal}
          className="hidden sm:flex bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black text-xs px-3 py-2 rounded-xl items-center gap-1 shadow-[0_0_15px_rgba(156,255,0,0.2)] transition-all cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 stroke-[3]" />
          <span>+ متدرب</span>
        </button>

        {/* Coach Badge Header */}
        <div className="flex items-center gap-1.5 bg-[#161616] border border-[#2A2A2A] px-2 py-1 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-[#9CFF00] text-black font-extrabold flex items-center justify-center text-xs shadow-sm">
            CL
          </div>
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-white block leading-none">{coachProfile.name}</span>
            <span className="text-[9px] text-[#9CFF00] font-mono block mt-0.5">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
