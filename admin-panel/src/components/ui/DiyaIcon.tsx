import React from 'react';

/**
 * Sacred Diya Icon (दीपक / ज्योत)
 * Symbol of spiritual light & devotion in Santmat Satsang Prachar
 */
export const DiyaIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    {/* Flame glow */}
    <ellipse cx="24" cy="14" rx="8" ry="12" fill="#FBBF24" opacity="0.35" />
    {/* Outer Flame */}
    <path
      d="M24 6C24 6 18 14 18 20C18 23.3137 20.6863 26 24 26C27.3137 26 30 23.3137 30 20C30 14 24 6 24 6Z"
      fill="#F59E0B"
    />
    {/* Inner Flame */}
    <path
      d="M24 10C24 10 20 15 20 19C20 21.2091 21.7909 23 24 23C26.2091 23 28 21.2091 28 19C28 15 24 10 24 10Z"
      fill="#FEF08A"
    />
    {/* Diya Base */}
    <path
      d="M10 24C10 24 12 34 24 34C36 34 38 24 38 24C38 24 35 28 24 28C13 28 10 24 10 24Z"
      fill="#B45309"
    />
    <ellipse cx="24" cy="27" rx="14" ry="4" fill="#D97706" />
    {/* Stand */}
    <path d="M21 34H27L29 38H19L21 34Z" fill="#92400E" />
  </svg>
);

/**
 * Namaste / Folded Hands Icon
 */
export const NamasteIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
