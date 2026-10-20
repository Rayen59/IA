import React from 'react';

interface MKLogoProps {
  className?: string;
  size?: number;
  variant?: 'watermark' | 'icon' | 'badge';
}

export const MKLogo: React.FC<MKLogoProps> = ({
  className = '',
  size = 48,
  variant = 'icon'
}) => {
  if (variant === 'watermark') {
    return (
      <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-cyan-500/20 dark:text-cyan-400/20 transition-colors"
        >
          <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin-slow opacity-40" />
          <path
            d="M 50 12 C 74 12 90 28 88 52 C 84 76 64 88 44 88 C 22 88 12 70 14 46 C 16 24 32 12 50 12 Z"
            stroke="url(#watermarkGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 28 70 L 40 30 L 52 50 L 64 30 L 76 70"
            stroke="url(#watermarkGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="watermarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mkGradCyber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="mkBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.5" />
          </filter>
        </defs>

        <rect
          width="100"
          height="100"
          rx="24"
          fill="url(#mkBgGrad)"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />

        {/* Monogram MK stylized with cyber glow */}
        <path
          d="M 28 68 L 28 32 L 40 48 L 52 32 L 52 68"
          stroke="url(#mkGradCyber)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#cyanGlow)"
        />
        <path
          d="M 62 32 L 62 68"
          stroke="url(#mkGradCyber)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 76 35 L 64 50 L 77 66"
          stroke="url(#mkGradCyber)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
