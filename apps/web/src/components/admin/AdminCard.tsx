import React from 'react';

export interface AdminCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  variant?: 'default' | 'subtle' | 'warning' | 'danger';
}

export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  subtitle,
  icon,
  actions,
  footer,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'bg-white border-stone-200/80 shadow-xs',
    subtle: 'bg-stone-50/70 border-stone-200 shadow-none',
    warning: 'bg-amber-50/40 border-amber-200/70 shadow-xs',
    danger: 'bg-red-50/30 border-red-200/70 shadow-xs',
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${variantStyles[variant]} ${className}`}
    >
      {(title || actions) && (
        <div
          className={`px-5 py-4 sm:px-6 sm:py-4.5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${headerClassName}`}
        >
          <div className="flex items-center gap-3">
            {icon && <span className="text-stone-500 shrink-0">{icon}</span>}
            <div>
              {typeof title === 'string' ? (
                <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      <div className={`p-5 sm:p-6 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className="px-5 py-3.5 sm:px-6 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between gap-3">
          {footer}
        </div>
      )}
    </div>
  );
};
