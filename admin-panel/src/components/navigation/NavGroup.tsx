import React from 'react';
import { PermissionGate } from '../../core/auth/PermissionContext';
import { NavLink } from './NavLink';
import { RouteMatcher } from './RouteMatcher';
import { NAV_ITEMS } from './navConfig';
import type { NavItem } from './navConfig';

interface NavGroupProps {
  items: NavItem[];
  matcher: RouteMatcher;
  collapsed: boolean;
  navItemRefs: React.RefObject<Array<HTMLAnchorElement | null>>;
}

export function NavGroup({ items, matcher, collapsed, navItemRefs }: NavGroupProps) {
  return (
    <nav role="navigation" aria-label="Sidebar navigation" className="nav-group">
      {items.map((item) => {
        const matchResult = matcher.match(item.path);
        const isActive = matchResult.matched;
        const globalIndex = NAV_ITEMS.findIndex((i) => i.path === item.path);

        return (
          <PermissionGate
            key={item.path}
            permission={item.permission}
            feature={item.feature}
            roles={item.adminOnly ? ['developer_super_admin', 'client_super_admin'] : undefined}
            fallback={null}
          >
            <NavLink
              ref={(el) => {
                if (el && globalIndex >= 0) {
                  navItemRefs.current[globalIndex] = el;
                }
              }}
              to={item.path}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              collapsed={collapsed}
              data-nav-index={globalIndex}
            />
          </PermissionGate>
        );
      })}
    </nav>
  );
}