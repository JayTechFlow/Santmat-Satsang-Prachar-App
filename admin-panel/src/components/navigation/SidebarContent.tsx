import React, { useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { NAV_SECTIONS, NAV_ITEMS } from './navConfig';
import { RouteMatcher } from './RouteMatcher';
import { NavSection } from './NavSection';
import { NavGroup } from './NavGroup';
import { NavFooter } from './NavFooter';
import { DiyaIcon } from '../ui/DiyaIcon';

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
          <div className="sidebar-header flex items-center gap-3 p-4 border-b border-stone-200">
            <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 shrink-0">
              <DiyaIcon className="w-7 h-7" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-['Mukta'] font-extrabold text-stone-900 text-base leading-tight">
                  संतमत सत्संग प्रचार
                </h2>
                <span className="font-['Mukta'] text-xs font-semibold text-amber-800">
                  एडमिन पोर्टल
                </span>
              </div>
            )}
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