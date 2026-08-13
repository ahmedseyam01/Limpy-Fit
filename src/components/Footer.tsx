import React from 'react';

interface FooterProps {
  className?: string;
  isLight?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ className = '', isLight = false }) => {
  return (
    <footer dir="ltr" className={`no-print py-5 sm:py-6 border-t select-none transition-all ${
      isLight 
        ? 'bg-gray-100 border-gray-300 text-gray-700' 
        : 'bg-[#0A0A0A]/95 border-[#1F1F1F] text-gray-400'
    } ${className}`}>
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center text-center space-y-1.5 sm:space-y-2.5">
        
        {/* Brand Copyright */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base font-black tracking-widest uppercase">
          <span className={isLight ? 'text-gray-900' : 'text-white'}>LIMBY</span>
          <span className="text-white">FIT</span>
          <span className="text-gray-500 font-mono text-xs sm:text-sm">© 2026</span>
        </div>

        {/* Developer Credit */}
        <div className="text-xs sm:text-base font-bold tracking-wide flex items-center justify-center gap-1 sm:gap-1.5">
          <span className={isLight ? 'text-gray-600' : 'text-gray-300'}>
            Designed & Developed by
          </span>
          <span className="font-black text-[#9CFF00] drop-shadow-[0_0_10px_rgba(156,255,0,0.4)] whitespace-nowrap">
            Ahmed Seyam
          </span>
        </div>

        {/* All Rights Reserved */}
        <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-mono font-bold">
          All Rights Reserved
        </div>
      </div>
    </footer>
  );
};
