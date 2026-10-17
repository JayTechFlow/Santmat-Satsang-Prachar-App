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
    default: 'admin-card',
    subtle: 'admin-card admin-card-subtle',
    warning: 'admin-card border-warning/30 bg-warning/5',
    danger: 'admin-card border-danger/30 bg-danger/5',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {(title || actions) && (
        <div
          className={`px-6 py-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${headerClassName}`}
        >
          <div className="flex items-start gap-3">
            {icon && <span className="text-text-secondary mt-0.5">{icon}</span>}
            <div>
              {typeof title === 'string' ? (
                <h3 className="text-lg font-bold text-text-primary leading-tight">
                  {title}
                </h3>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      <div className={`p-6 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/30 flex items-center justify-between gap-3">
          {footer}
        </div>
      )}
    </div>
  );
};