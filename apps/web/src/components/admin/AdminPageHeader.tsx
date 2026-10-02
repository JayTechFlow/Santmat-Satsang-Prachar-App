import React from 'react';

export type AdminBadgeVariant = 'primary' | 'warning' | 'success' | 'danger' | 'info';

const BADGE_STYLES: Record<AdminBadgeVariant, string> = {
  primary: 'bg-orange-500/15 text-orange-700 border-orange-200',
  warning: 'bg-amber-500/15 text-amber-800 border-amber-200',
  success: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
  danger: 'bg-rose-500/15 text-rose-700 border-rose-200',
  info: 'bg-sky-500/15 text-sky-700 border-sky-200',
};

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  badgeText?: string;
  badgeVariant?: AdminBadgeVariant;
  icon?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  badgeText,
  badgeVariant = 'warning',
  icon,
  breadcrumbs,
  actions,
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-stone-200 shadow-xs rounded-[0.75rem] px-5 py-5 sm:px-6 sm:py-6 relative overflow-hidden ${className}`}
    >
      {/* Subtle brand accent — restrained */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#EA580C] to-amber-400 rounded-l-[0.75rem]" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-3xl">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-stone-300">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="text-stone-500 hover:text-[#EA580C] transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-stone-700 font-bold">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {badgeText && (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                BADGE_STYLES[badgeVariant] || BADGE_STYLES.warning
              }`}
            >
              {icon && <span className="shrink-0">{icon}</span>}
              <span>{badgeText}</span>
            </div>
          )}

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 flex items-center gap-3">
            {!badgeText && icon && <span className="text-[#EA580C] shrink-0">{icon}</span>}
            <span>{title}</span>
          </h1>

          {subtitle && (
            <p className="text-stone-500 text-sm sm:text-sm leading-relaxed">
              {subtitle}
            </p>
          )}

          {children}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
