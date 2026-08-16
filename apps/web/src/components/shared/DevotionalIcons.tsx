/**
 * ============================================================================
 * Santmat Satsang Prachar - Shared Devotional Icons
 * ============================================================================
 * Shared SVG icon primitives used across admin modules. Moved out of the mobile
 * home screen so admin components no longer depend on the mobile tree.
 */

import React from 'react';

/**
 * आध्यात्मिक दीप (Diya Lamp Icon)
 * पवित्र ज्योत एवं भक्ति का प्रतीक
 */
export const DiyaIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
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
 * प्रणाम मुद्रा (Namaste / Folded Hands Icon)
 */
export const NamasteIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2C11.4 2 11 2.4 11 3V11C11 11.6 11.4 12 12 12C12.6 12 13 11.6 13 11V3C13 2.4 12.6 2 12 2Z" opacity="0.3" />
    <path d="M7.5 7.5C7.1 7.1 6.5 7.1 6.1 7.5L3.3 10.3C2.1 11.5 2.1 13.5 3.3 14.7L8.5 19.9C9.7 21.1 11.6 21.1 12.8 19.9L12 19.1L7.5 14.6C6.7 13.8 6.7 12.5 7.5 11.7L9.6 9.6L7.5 7.5Z" />
    <path d="M16.5 7.5C16.9 7.1 17.5 7.1 17.9 7.5L20.7 10.3C21.9 11.5 21.9 13.5 20.7 14.7L15.5 19.9C14.3 21.1 12.4 21.1 11.2 19.9L12 19.1L16.5 14.6C17.3 13.8 17.3 12.5 16.5 11.7L14.4 9.6L16.5 7.5Z" />
  </svg>
);
