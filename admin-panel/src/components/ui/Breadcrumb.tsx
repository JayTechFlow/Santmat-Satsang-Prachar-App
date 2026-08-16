import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getBreadcrumbTrail, NAV_ITEMS } from '../navigation/navConfig';
import { RouteMatcher } from '../navigation/RouteMatcher';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  maxDepth?: number;
  className?: string;
}

const routeMatcher = new RouteMatcher();
for (const item of NAV_ITEMS) {
  routeMatcher.addRoute(item.path, { prefix: true, dynamic: true });
}

export function Breadcrumb({ items, maxDepth = 3, className }: BreadcrumbProps) {
  const location = useLocation();
  const trail = items ?? getBreadcrumbTrail(location.pathname);

  const limitedTrail = trail.length > maxDepth
    ? [trail[0], { label: '...', path: undefined }, ...trail.slice(-(maxDepth - 1))]
    : trail;

  return (
    <nav aria-label="Breadcrumb" className={`breadcrumb ${className ?? ''}`}>
      <ol className="breadcrumb__list">
        {limitedTrail.map((crumb, i) => {
          const isLast = i === limitedTrail.length - 1;
          const isEllipsis = crumb.label === '...';
          
          if (isEllipsis) {
            return (
              <li key="ellipsis" className="breadcrumb__item breadcrumb__ellipsis" aria-hidden="true">
                <span className="breadcrumb__ellipsis-text">…</span>
              </li>
            );
          }

          const isActive = crumb.path 
            ? routeMatcher.matchRoute(location.pathname, crumb.path, { exact: isLast, prefix: !isLast }).matched
            : isLast;

          return (
            <li key={crumb.path ?? crumb.label} className="breadcrumb__item">
              {crumb.path && !isLast ? (
                <Link
                  to={crumb.path}
                  className="breadcrumb__link"
                  aria-current={isActive && !isLast ? 'location' : undefined}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'breadcrumb__current' : undefined}
                >
                  {crumb.label}
                </span>
              )}
              {!isLast && !isEllipsis && (
                <ChevronRight size={14} aria-hidden="true" className="breadcrumb__separator" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}