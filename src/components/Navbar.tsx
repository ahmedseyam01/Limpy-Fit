import React from 'react';
import { UserPlus, ArrowRight, FileText, LogOut, ShieldCheck } from 'lucide-react';
import { CoachProfile } from '../types/nutrition';

interface NavbarProps {
  coachProfile: CoachProfile;
  currentView?: 'list' | 'plan' | 'pdf' | 'settings';
  setCurrentView?: (view: 'list' | 'plan' | 'pdf' | 'settings') => void;
  onOpenAddModal?: () => void;
  onLogout?: () => void;
  // Trainee View Props
  isTraineeView?: boolean;
  traineeName?: string;
  onViewPdf?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  coachProfile,
  currentView = 'list',
  setCurrentView,
  onOpenAddModal,
  onLogout,
  isTraineeView = false,
  traineeName,
  onViewPdf
}) => {
  return (
    <nav className="no-print sticky top-0 z-40 bg-[#0C0C0C]/95 backdrop-blur-2xl border-b border-[#222222] select-none overflow-x-hidden">
      {/* Subtle Neon Top Glow Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#9CFF00] to-transparent"></div>

      {/* Main Container Aligned across Full Viewport Width */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between gap-4">
        
        {/* Right Section (RTL Start): Horizontal Compact LIMBY FIT Brand Emblem */}
        <div 
          onClick={() => setCurrentView && setCurrentView('list')}
          className="flex items-center gap-2 cursor-pointer group bg-[#161616] hover:bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#9CFF00]/60 px-2.5 sm:px-3.5 py-1.5 rounded-2xl transition-all shadow-md shrink-0"
        >
          {/* Logo SVG Vector Icon */}
          <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 200 160" className="h-full w-auto drop-shadow-[0_0_8px_#9CFF00]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 15 L75 15 L45 110 L115 110 L105 145 L10 145 Z" fill="url(#nav-silver-orig)" stroke="#ffffff" strokeWidth="1.5"/>
              <path d="M85 20 C110 10, 145 20, 155 42 C162 55, 155 70, 140 78 C165 85, 172 110, 155 130 C140 148, 100 145, 80 145 L92 115 C108 115, 130 118, 135 105 C140 92, 122 85, 105 85 L98 85 L106 60 L115 60 C128 60, 135 52, 130 40 C125 30, 105 32, 95 35 Z" fill="#9CFF00" filter="drop-shadow(0px 0px 6px #9CFF00)"/>
              <defs>
                <linearGradient id="nav-silver-orig" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Horizontal Brand Name & Subtitle */}
          <div className="text-right flex flex-col justify-center">
            <div className="text-xs sm:text-sm font-black text-white italic tracking-tight leading-none group-hover:text-[#9CFF00] transition-colors">
              LIMBY <span className="text-[#9CFF00]">FIT</span>
            </div>
            <span className="hidden sm:block text-[8px] text-[#9CFF00] font-mono font-bold tracking-widest uppercase mt-0.5">
              {isTraineeView ? 'CLIENT PORTAL' : 'FUEL YOUR PROGRESS'}
            </span>
          </div>
        </div>

        {/* Center Section: Coach Admin Badge (Desktop Only) */}
        {isTraineeView ? (
          <div className="hidden lg:flex items-center gap-2 bg-[#141414] border border-[#242424] px-3 py-1.5 rounded-2xl text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#9CFF00] animate-pulse"></span>
            <span className="font-extrabold text-white">أهلاً بك، {traineeName || 'المتدرب'} 🦾</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 bg-[#141414] border border-[#242424] px-3 py-1.5 rounded-2xl text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#9CFF00] animate-pulse"></span>
            <span className="font-extrabold text-white">COACH ADMIN SYSTEM</span>
          </div>
        )}

        {/* Left Section (RTL End): Action Controls (Optimized for Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isTraineeView ? (
            <>
              {onViewPdf && (
                <button
                  onClick={onViewPdf}
                  className="bg-[#1C1C1C] hover:bg-[#262626] text-white border border-[#333333] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>PDF 📄</span>
                </button>
              )}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-[#1A1010] hover:bg-[#2A1515] text-red-400 border border-red-500/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  خروج
                </button>
              )}
            </>
          ) : (
            <>
              {currentView !== 'list' && setCurrentView && (
                <button
                  onClick={() => setCurrentView('list')}
                  className="bg-[#1C1C1C] hover:bg-[#262626] text-gray-200 border border-[#333333] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#9CFF00]" />
                  <span className="hidden sm:inline">المشتركين</span>
                  <span className="sm:hidden">قائمة</span>
                </button>
              )}

              {onOpenAddModal && (
                <button
                  onClick={onOpenAddModal}
                  className="bg-[#9CFF00] hover:bg-[#8BE600] text-black font-black px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(156,255,0,0.3)] active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ مشترك</span>
                </button>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-[#1A1010] hover:bg-[#2A1515] text-red-400 border border-red-500/30 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  خروج
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
