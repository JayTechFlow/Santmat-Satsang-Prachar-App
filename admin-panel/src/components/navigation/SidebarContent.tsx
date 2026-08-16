import React, { useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { NAV_SECTIONS, NAV_ITEMS } from './navConfig';
import { RouteMatcher } from './RouteMatcher';
import { NavSection } from './NavSection';
import { NavGroup } from './NavGroup';
import { NavFooter } from './NavFooter';

interface SidebarContentProps {
  collapsed: boolean;
  navItemRefs: React.RefObject<Array<HTMLAnchorElement | null>>;
}

interface SidebarContentHandle {
  focusFirstItem: () => void;
}

export const SidebarContent = forwardRef<SidebarContentHandle, SidebarContentProps>(
  ({ collapsed, navItemRefs }, ref) => {
    const matcher = useMemo(() => {
      const m = new RouteMatcher();
      for (const item of NAV_ITEMS) {
        m.addRoute(item.path, { prefix: true, dynamic: true });
      }
      return m;
    }, []);

    const innerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      focusFirstItem: () => {
        const firstLink = navItemRefs.current[0];
        firstLink?.focus();
      },
    }), [navItemRefs]);

    return (
      <TooltipProvider delayDuration={200}>
        <div className="sidebar-content" data-collapsed={collapsed} ref={innerRef}>
          <div className="sidebar-header">
            <h1 className="sidebar-title">Santmat Satsang Prachar</h1>
            <p className="sidebar-subtitle" aria-hidden={collapsed}>
              Admin Panel
            </p>
          </div>

          <div className="sidebar-nav" role="navigation" aria-label="Main navigation">
            {NAV_SECTIONS.map((section) => (
              <React.Fragment key={section.id}>
                {!collapsed && <NavSection title={section.title} />}
                <NavGroup
                  items={section.items}
                  matcher={matcher}
                  collapsed={collapsed}
                  navItemRefs={navItemRefs}
                />
              </React.Fragment>
            ))}
          </div>

          <NavFooter collapsed={collapsed} />
        </div>
      </TooltipProvider>
    )
  }
);

SidebarContent.displayName = 'SidebarContent';