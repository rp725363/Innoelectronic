import React, { useState } from 'react';

// Brand logo assets
import logo9Image from '../assets/images/logo9.png';
import logo9Svg from '../assets/images/logo9.svg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  showSubtitle?: boolean;
  className?: string;
  allowCustomUpload?: boolean;
  onLogoClick?: () => void;
  showFullBadge?: boolean;
}

const CUSTOM_LOGO_STORAGE_KEY = 'inno_custom_logo_v3';

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
  className = '',
  allowCustomUpload = false,
  onLogoClick,
  showFullBadge = false,
}) => {
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [imgError, setImgError] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please choose an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCustomLogo(result);
        try {
          localStorage.setItem(CUSTOM_LOGO_STORAGE_KEY, result);
        } catch {
          // ignore local storage error
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomLogo(null);
    try {
      localStorage.removeItem(CUSTOM_LOGO_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Primary logo sources: custom user upload, then SVG, then PNG
  const fullLogoSrc = customLogo || logo9Svg || logo9Image || '/logo9.png';
  const iconMarkSrc = customLogo || '/logo9_icon.png' || logo9Svg || '/logo9.png';

  // Dimensions based on size
  const iconSizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const titleSizeClasses = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl sm:text-4xl',
  }[size];

  const subtitleSizeClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-xs',
    lg: 'text-xs',
    xl: 'text-sm',
  }[size];

  const textColorClasses = variant === 'light' 
    ? 'text-slate-900' 
    : 'text-white';

  const subtextColorClasses = variant === 'light' 
    ? 'text-slate-500' 
    : 'text-slate-400';

  // If full badge mode is requested (e.g. Innoelectronics official badge)
  if (showFullBadge) {
    return (
      <div 
        onClick={onLogoClick} 
        className={`inline-flex items-center cursor-pointer group ${className}`}
      >
        <div className="bg-white rounded-xl p-1.5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <img
            src={fullLogoSrc}
            alt="Innoelectronics Official Brand Logo"
            className={`${iconSizeClasses} w-auto max-h-14 object-contain`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2.5 sm:space-x-3 group ${className}`}>
      {/* Official Logo Graphic Container - Crisp White Base for Orange Robot Arm & Microchip */}
      <div 
        onClick={onLogoClick}
        className={`relative shrink-0 ${iconSizeClasses} rounded-xl overflow-hidden shadow-xs border border-slate-200/90 bg-white flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-cyan-500/50 group-hover:shadow-md p-1 cursor-pointer`}
      >
        {!imgError ? (
          <img
            key={iconMarkSrc}
            src={iconMarkSrc}
            alt="Innoelectronics Official Brand Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          /* High-Tech Fallback Vector Emblem */
          <div className="w-full h-full bg-slate-900 p-1.5 flex items-center justify-center text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full text-cyan-400"
            >
              <rect width="16" height="16" x="4" y="4" rx="2" />
              <rect width="6" height="6" x="9" y="9" rx="1" />
              <path d="M15 2v2" />
              <path d="M15 20v2" />
              <path d="M2 15h2" />
              <path d="M2 9h2" />
              <path d="M20 15h2" />
              <path d="M20 9h2" />
              <path d="M9 2v2" />
              <path d="M9 20v2" />
            </svg>
          </div>
        )}
      </div>

      {/* Brand Typography Highlighting INNOELECTRONICS */}
      <div className="flex flex-col select-none" onClick={onLogoClick}>
        <div className={`font-black tracking-tight ${titleSizeClasses} ${textColorClasses} flex items-center leading-none`}>
          <span className="tracking-tight text-slate-900 dark:text-white">INNO</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-cyan-600 to-cyan-500 font-black ml-0.5 drop-shadow-2xs">
            ELECTRONICS
          </span>
          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
            HQ
          </span>
        </div>

        {showSubtitle && (
          <div className={`font-semibold tracking-wider uppercase ${subtitleSizeClasses} ${subtextColorClasses} mt-1 flex items-center space-x-1.5`}>
            <span>Electronic Hardware &amp; Connectors</span>
            <span className="inline-block w-1 h-1 rounded-full bg-orange-500" />
            <span className="text-cyan-700 font-bold">Genuine OEM</span>
          </div>
        )}
      </div>

      {/* Optional Custom Logo Upload Trigger */}
      {allowCustomUpload && (
        <div className="flex items-center space-x-1.5 ml-2">
          <label
            title="Upload custom company logo"
            className="text-[10px] text-slate-400 hover:text-cyan-300 underline cursor-pointer"
          >
            Change
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {customLogo && (
            <button
              onClick={handleResetToDefault}
              className="text-[10px] text-red-400 hover:text-red-300 underline"
              title="Reset to official Innoelectronics logo"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};

