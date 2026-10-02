import React from 'react';

export interface AdminSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  className = '',
}) => {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-amber-600">{icon}</span>}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-stone-500">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      <div>{children}</div>
    </section>
  );
};
