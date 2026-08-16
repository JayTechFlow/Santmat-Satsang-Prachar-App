import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import type { BreadcrumbItem } from './Breadcrumb';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: { label: string; variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' };
  backAction?: { label: string; onClick: () => void; href?: string };
}

export function PageHeader({
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
  badge,
  backAction,
}: PageHeaderProps) {
  const desc = subtitle ?? description;

  const badgeVariants: Record<string, string> = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral',
  };

  return (
    <header className="page-header">
      <div className="page-header__content">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} className="page-header__breadcrumbs" />}
        
        <div className="page-header__title-group">
          <div className="page-header__title-row">
            {backAction && (
              <button
                type="button"
                className="page-header__back-action btn btn-ghost"
                onClick={backAction.onClick}
              >
                {backAction.label}
              </button>
            )}
            <h1 className="page-title">{title}</h1>
            {badge && (
              <span className={`badge ${badgeVariants[badge.variant ?? 'primary']}`}>
                {badge.label}
              </span>
            )}
          </div>
          {desc && <p className="page-header__description">{desc}</p>}
        </div>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}