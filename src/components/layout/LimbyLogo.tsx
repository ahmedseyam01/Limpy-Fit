import React from 'react';

interface LimbyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const LimbyLogo: React.FC<LimbyLogoProps> = ({ size = 'md', showSubtitle = true, className = '' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20',
    xl: 'h-28'
  };

  const textSizes = {
    sm: 'text-lg font-black tracking-wider',
    md: 'text-2xl font-black tracking-widest',
    lg: 'text-4xl font-black tracking-widest',
    xl: 'text-5xl font-black tracking-widest'
  };

  const subSizes = {
    sm: 'text-[9px] tracking-widest',
    md: 'text-xs tracking-[0.25em]',
    lg: 'text-sm tracking-[0.3em]',
    xl: 'text-base tracking-[0.35em]'
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Dynamic Emblem SVG matching LIMBY image */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        <svg viewBox="0 0 200 160" className="h-full w-auto drop-shadow-[0_0_15px_rgba(156,255,0,0.3)]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Metallic Silver L Part */}
          <path 
            d="M25 15 L75 15 L45 110 L115 110 L105 145 L10 145 Z" 
            fill="url(#silver-grad)" 
            stroke="#ffffff" 
            strokeWidth="1.5"
          />
          {/* Neon Green Muscle B / 3 Silhouette Part */}
          <path 
            d="M85 20 C110 10, 145 20, 155 42 C162 55, 155 70, 140 78 C165 85, 172 110, 155 130 C140 148, 100 145, 80 145 L92 115 C108 115, 130 118, 135 105 C140 92, 122 85, 105 85 L98 85 L106 60 L115 60 C128 60, 135 52, 130 40 C125 30, 105 32, 95 35 Z" 
            fill="#9CFF00"
            filter="drop-shadow(0px 0px 8px #9CFF00)"
          />
          {/* Biceps Notch detail */}
          <path 
            d="M130 45 C145 38, 150 55, 138 65 C125 75, 115 65, 130 45 Z" 
            fill="#0A0A0A" 
            opacity="0.25"
          />
          {/* Gradients */}
          <defs>
            <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#D1D5DB" />
              <stop offset="100%" stopColor="#9CA3AF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* LIMBY Wordmark & Subtitle */}
      <div className="mt-1 text-center">
        <h1 className={`${textSizes[size]} text-white italic tracking-tighter uppercase font-extrabold font-sans leading-none drop-shadow-md`}>
          LIMBY <span className="text-[#9CFF00]">FIT</span>
        </h1>
        {showSubtitle && (
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            <span className="h-[2px] w-3 bg-[#9CFF00]"></span>
            <span className={`text-[#9CFF00] font-bold uppercase font-mono ${subSizes[size]}`}>
              FUEL YOUR PROGRESS
            </span>
            <span className="h-[2px] w-3 bg-[#9CFF00]"></span>
          </div>
        )}
      </div>
    </div>
  );
};
