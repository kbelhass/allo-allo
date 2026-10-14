import React from 'react';
import { PhoneCall, Sparkles } from 'lucide-react';

interface AppLogoProps {
  logoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  tagline?: string;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  logoUrl,
  size = 'md',
  showText = false,
  tagline,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7 text-xs rounded-lg',
    sm: 'w-9 h-9 text-sm rounded-xl',
    md: 'w-11 h-11 text-base rounded-2xl',
    lg: 'w-16 h-16 text-xl rounded-3xl',
    xl: 'w-24 h-24 text-3xl rounded-[28px]'
  };

  const textClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl font-extrabold'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${sizeClasses[size]} relative flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-rose-900/30 border border-white/15 transition-transform hover:scale-105`}
        style={{
          background: logoUrl ? '#ffffff' : 'linear-gradient(135deg, #e11d48 0%, #be123c 60%, #b45309 100%)'
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo Allo-Allo"
            className="w-full h-full object-contain p-0.5 rounded-[inherit]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback to default styling if image fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="relative flex flex-col items-center justify-center w-full h-full text-white select-none">
            {/* Ambient subtle glow ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/40 via-transparent to-amber-400/30 pointer-events-none" />
            
            {size === 'xl' || size === 'lg' ? (
              <>
                <div className="flex items-center justify-center gap-1 font-black tracking-tight">
                  <span className="text-white drop-shadow-sm">Allo</span>
                  <PhoneCall className="w-5 h-5 text-amber-300 stroke-[2.5] animate-pulse" />
                </div>
                <div className="text-[10px] font-bold text-amber-200 uppercase tracking-widest mt-0.5">
                  Tunisie 🇹🇳
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center font-black tracking-wider text-white">
                <span>AA</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className={`${textClasses[size]} font-extrabold tracking-tight text-white flex items-center gap-1.5`}>
              Allo-Allo
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                🇹🇳 TN
              </span>
            </h1>
          </div>
          {tagline ? (
            <p className="text-[10px] text-gray-400 font-medium leading-tight">{tagline}</p>
          ) : (
            <p className="text-[10px] text-gray-400 font-medium">Diaspora & Rencontres Tunisie</p>
          )}
        </div>
      )}
    </div>
  );
};
