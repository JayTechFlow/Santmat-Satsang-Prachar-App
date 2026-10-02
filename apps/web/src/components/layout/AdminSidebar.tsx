/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Admin Sidebar
 * ============================================================================
 * RBAC-aware, grouped, responsive, collapsible, accessible sidebar.
 * Navigation source of truth: src/config/navConfig.ts
 * Permission source of truth: PermissionContext (never duplicated).
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { usePermissions } from '../../app/providers/PermissionContext';
import { NAV_GROUPS, type NavItem, type NavGroup } from '../../config/navConfig';
import { DiyaIcon } from '../shared/DevotionalIcons';
import type { SidebarState } from '../../hooks/useSidebarState';

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  sidebar: SidebarState;
}

// ── Permission Filtering ───────────────────────────────────────────────────

function useFilteredNavGroups(): NavGroup[] {
  const { hasPermission, isFeatureEnabled } = usePermissions();

  return useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items
        .filter((item) => {
          if (item.permission && !hasPermission(item.permission)) return false;
          if (item.featureFlag && !isFeatureEnabled(item.featureFlag)) return false;
          return true;
        })
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => {
            if (child.permission && !hasPermission(child.permission)) return false;
            if (child.featureFlag && !isFeatureEnabled(child.featureFlag)) return false;
            return true;
          }),
        }))
        // Remove parent items that have no visible children left (if they had children)
        .filter((item) => {
          if (item.children && item.children.length === 0) return false;
          return true;
        }),
    })).filter((group) => group.items.length > 0);
  }, [hasPermission, isFeatureEnabled]);
}

// ── Active Route Detection ─────────────────────────────────────────────────

function useActiveRouteMatch(): (path: string, end?: boolean) => boolean {
  const location = useLocation();

  return useCallback(
    (path: string, end = false) => {
      if (end) {
        return location.pathname === path;
      }
      return (
        location.pathname === path ||
        location.pathname.startsWith(path + '/')
      );
    },
    [location.pathname]
  );
}

// ── SidebarItem ────────────────────────────────────────────────────────────

const SidebarItem: React.FC<{
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
  isChild?: boolean;
}> = React.memo(({ item, collapsed, onNavigate, isChild = false }) => {
  const match = useActiveRouteMatch();
  const isActive = match(item.path, item.path === '/admin/dashboard');
  const Icon = item.icon;

  const classes = isChild
    ? `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
        isActive
          ? 'bg-[#EA580C] text-white shadow-xs'
          : 'text-stone-600 hover:bg-stone-100'
      }`
    : `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
        isActive
          ? 'bg-[#EA580C] text-white shadow-sm'
          : 'text-stone-700 hover:bg-stone-100'
      }`;

  return (
    <NavLink
      to={item.path}
      end={item.path === '/admin/dashboard'}
      className={classes}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={isChild ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
});

SidebarItem.displayName = 'SidebarItem';

// ── Expandable Group (Bhajans) ────────────────────────────────────────────

const SidebarExpandableGroup: React.FC<{
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}> = React.memo(({ item, collapsed, onNavigate }) => {
  const [expanded, setExpanded] = useState(true);
  const match = useActiveRouteMatch();
  const isActive = match(item.path);
  const Icon = item.icon;

  // Auto-expand when a child route is active
  const location = useLocation();
  useEffect(() => {
    if (item.children?.some((child) => location.pathname === child.path || location.pathname.startsWith(child.path + '/'))) {
      setExpanded(true);
    }
  }, [location.pathname, item.children]);

  if (collapsed) {
    // In collapsed mode, just render the parent as a link
    return <SidebarItem item={item} collapsed={collapsed} onNavigate={onNavigate} />;
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
          isActive
            ? 'bg-[#EA580C]/10 text-[#EA580C]'
            : 'text-stone-700 hover:bg-stone-100'
        }`}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 shrink-0" />
          <span>{item.label}</span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
        )}
      </button>

      {expanded && item.children && (
        <div className="pl-6 pt-1 space-y-1">
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              collapsed={false}
              onNavigate={onNavigate}
              isChild
            />
          ))}
        </div>
      )}
    </div>
  );
});

SidebarExpandableGroup.displayName = 'SidebarExpandableGroup';

// ── Main Sidebar ───────────────────────────────────────────────────────────

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ sidebar }) => {
  const { collapsed, isOverlay, isVisible, isMobile, closeMobile, closeOverlay } = sidebar;
  const { logout } = usePermissions();
  const navGroups = useFilteredNavGroups();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Focus trap for mobile/tablet overlay
  useEffect(() => {
    if (!isVisible || !isOverlay) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = sidebar.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusable.length > 0) focusable[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeOverlay();
        return;
      }
      if (e.key !== 'Tab') return;

      const currentFocusable = sidebar.querySelectorAll<HTMLElement>(focusableSelector);
      if (currentFocusable.length === 0) return;

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOverlay, isVisible, closeOverlay]);

  // Close overlay on navigation (mobile drawer or tablet overlay)
  const handleNavigate = useCallback(() => {
    if (isOverlay) closeOverlay();
  }, [isOverlay, closeOverlay]);

  // ── Sidebar Content ────────────────────────────────────────────────────

  const sidebarContent = (
    <aside
      ref={sidebarRef}
      className={`bg-white border-r border-stone-200 flex flex-col h-full select-none shrink-0 transition-all duration-300 ${
        collapsed ? 'w-[--sidebar-collapsed-width]' : 'w-[--sidebar-width]'
      }`}
      aria-label="मुख्य नेविगेशन"
      role="navigation"
    >
      {/* ── Brand ──────────────────────────────────────────────── */}
      <div className={`border-b border-stone-200 flex items-center gap-3 ${collapsed ? 'p-3 justify-center' : 'p-4'}`}>
        <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 shrink-0">
          <DiyaIcon className={collapsed ? 'w-6 h-6' : 'w-7 h-7'} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="font-['Mukta'] font-extrabold text-stone-900 text-base leading-tight truncate">
              संतमत सत्संग प्रचार
            </h2>
            <span className="font-['Mukta'] text-xs font-semibold text-amber-800">
              एडमिन पैनल
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-sm font-['Mukta']">
        {navGroups.map((group) => (
          <div key={group.id}>
            {/* Group Label */}
            {group.label && !collapsed && (
              <h3 className="px-3 mb-1.5 text-[0.65rem] font-extrabold text-stone-400 uppercase tracking-wider select-none">
                {group.label}
              </h3>
            )}
            {group.label && collapsed && (
              <div className="mx-3 mb-1.5 border-t border-stone-200" />
            )}

            {/* Items */}
            <div className="space-y-1">
              {group.items.map((item) =>
                item.children ? (
                  <SidebarExpandableGroup
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={handleNavigate}
                  />
                ) : (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={handleNavigate}
                  />
                )
              )}
            </div>
          </div>
        ))}

        {/* ── Logout ────────────────────────────────────────────── */}
        <div className="border-t border-stone-200 pt-3">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all"
            title={collapsed ? 'लॉग आउट' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>लॉग आउट</span>}
          </button>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="p-3.5 m-3 bg-[#FFFBF0] rounded-2xl border border-amber-200">
          <h4 className="font-['Mukta'] font-bold text-xs text-amber-900 mb-1">
            सहायता की आवश्यकता है?
          </h4>
          <p className="font-['Mukta'] text-[0.7rem] text-stone-600 leading-tight">
            संपर्क करें: admin@santmat.app
          </p>
          <p className="font-['Mukta'] text-[0.7rem] text-stone-600 leading-tight mt-0.5">
            +91 12345 67890
          </p>
        </div>
      )}

      {/* ── Collapse Toggle (Desktop only) ─────────────────────── */}
      {!isMobile && !isOverlay && (
        <div className="p-2 border-t border-stone-200">
          <button
            onClick={sidebar.toggleCollapsed}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-all text-xs font-bold"
            title={collapsed ? 'साइडबार विस्तारित करें' : 'साइडबार संक्षिप्त करें'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>संक्षिप्त करें</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );

  // ── Rendering Modes ──────────────────────────────────────────────────

  // Mobile: full-screen drawer with backdrop
  if (isMobile) {
    if (!isVisible) return null;
    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
          onClick={closeOverlay}
          aria-hidden="true"
        />
        {/* Drawer */}
        <div className="relative h-full w-[--sidebar-width] shadow-2xl animate-in slide-in-from-left duration-200">
          {sidebarContent}
        </div>
      </div>
    );
  }

  // Tablet overlay mode
  if (isOverlay) {
    if (!isVisible) return null;
    return (
      <div className="fixed inset-0 z-40">
        <div
          className="absolute inset-0 bg-stone-900/30 backdrop-blur-2xs"
          onClick={closeOverlay}
          aria-hidden="true"
        />
        <div className="relative h-full w-[--sidebar-width] shadow-2xl animate-in slide-in-from-left duration-200">
          {sidebarContent}
        </div>
      </div>
    );
  }

  // Desktop: fixed sidebar in flow
  return sidebarContent;
};
