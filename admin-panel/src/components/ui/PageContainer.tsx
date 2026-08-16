import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function PageContainer({
  children,
  size = 'xl',
  padding = 'md',
}: PageContainerProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'page-container--sm',
    md: 'page-container--md',
    lg: 'page-container--lg',
    xl: 'page-container--xl',
    '2xl': 'page-container--2xl',
    full: 'page-container--full',
  };

  const paddingClasses: Record<string, string> = {
    none: 'page-container--padding-none',
    sm: 'page-container--padding-sm',
    md: 'page-container--padding-md',
    lg: 'page-container--padding-lg',
  };

  return (
    <div
      className={`page-container ${sizeClasses[size]} ${paddingClasses[padding]}`}
    >
      {children}
    </div>
  );
}