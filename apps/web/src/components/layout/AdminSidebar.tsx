/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Admin Sidebar (Redesigned)
 * ============================================================================
 * RBAC-aware, grouped, responsive, collapsible, accessible sidebar.
 * Navigation source of truth: src/config/navConfig.ts
 * Permission source of truth: PermissionContext (never duplicated).
 *
 * Redesigned with modern UI principles:
 * - Cleaner visual hierarchy
 * - Improved spacing and typography
 * - Better responsive behavior
 * - Reduced visual clutter
 * - Enhanced accessibility
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
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
}

interface NavGroupProps {
  group: NavGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: () => void;
  hasPermission: (permissionId?: string) => boolean;
  isActive: (path: string) => boolean;
}

interface NavItemProps {
  item: NavItem;
  onItemClick: () => void;
  isActive: (path: string) => boolean;
}

// ── Navigation Group Component ─────────────────────────────────────────────

const SidebarNavGroup: React.FC<NavGroupProps> = ({
  group,
  isExpanded,
  onToggle,
  onItemClick,
  hasPermission,
  isActive,
}) => {
  // Filter items based on permissions and feature flags
  const visibleItems = useMemo(() => {
    return group.items.filter(item => {
      // Check permission
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }

      // Check feature flag (if any)
      if (item.featureFlag) {
        // Feature flag implementation would go here
        // For now, we'll assume all features are enabled
        return true;
      }

      return true;
    });
  }, [group.items, hasPermission]);

  if (visibleItems.length === 0) return null;

  const hasChildren = visibleItems.some(item => item.children && item.children.length > 0);

  return (
    <div className="mb-1">
      {/* Group Label */}
      {group.label && (
        <div
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wide"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{group.label}</span>
          {hasChildren && (
            <button
              onClick={onToggle}
              className="p-1 text-stone-400 hover:text-stone-600 rounded transition-colors"
              aria-label={isExpanded ? "Collapse group" : "Expand group"}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Group Items */}
      <div className={group.label ? "ml-1" : ""}>
        {visibleItems.map((item) => (
          <React.Fragment key={item.id}>
            <SidebarNavItem
              item={item}
              onItemClick={onItemClick}
              isActive={isActive}
            />

            {/* Child Items (if expanded and applicable) */}
            {item.children && item.children.length > 0 && isExpanded && (
              <div className="ml-6 mt-1 space-y-0.5">
                {item.children.map((child) => (
                  <SidebarNavItem
                    key={child.id}
                    item={child}
                    onItemClick={onItemClick}
                    isActive={isActive}
                    isChild
                  />
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ── Navigation Item Component ──────────────────────────────────────────────

const SidebarNavItem: React.FC<NavItemProps & { isChild?: boolean }> = ({
  item,
  onItemClick,
  isActive,
  isChild = false
}) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onItemClick}
      className={({ isActive: navActive }) =>
        `flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
          navActive || isActive(item.path)
            ? 'bg-brand/10 text-brand font-semibold'
            : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
        } ${isChild ? 'ml-2 pl-4' : ''}`
      }
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <span className="truncate flex-1">{item.label}</span>
    </NavLink>
  );
};

// ── Main Sidebar Component ─────────────────────────────────────────────────

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isSidebarOpen, onToggleSidebar, onCloseSidebar }) => {
  const { hasPermission, logout } = usePermissions();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Initialize expanded groups with default expanded state
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    NAV_GROUPS.forEach(group => {
      // Expand groups that contain the current active route by default
      const isActiveGroup = group.items.some(item =>
        location.pathname === item.path ||
        (item.children && item.children.some(child => location.pathname === child.path))
      );
      initialExpanded[group.id] = isActiveGroup;
    });
    setExpandedGroups(initialExpanded);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }, []);

  const handleItemClick = useCallback(() => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onCloseSidebar();
    }
  }, [onCloseSidebar]);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  const isActiveRoute = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  // Filter groups based on permissions
  const visibleGroups = useMemo(() => {
    return NAV_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (item.permission && !hasPermission(item.permission)) {
          return false;
        }
        if (item.featureFlag) {
          // Feature flag check would go here
          return true;
        }
        return true;
      })
    })).filter(group => group.items.length > 0);
  }, [hasPermission]);

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-surface border-r border-stone-200/80 shadow-xs transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-brand rounded-lg">
              <DiyaIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">सत्संग प्रचार</h2>
              <p className="text-xs text-stone-500">एडमिन पोर्टल</p>
            </div>
          </div>

          {/* Sidebar Close Button (Mobile/Tablet) */}
          <button
            onClick={onCloseSidebar}
            className="p-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {visibleGroups.map((group) => (
            <SidebarNavGroup
              key={group.id}
              group={group}
              isExpanded={expandedGroups[group.id] ?? false}
              onToggle={() => handleToggleGroup(group.id)}
              onItemClick={handleItemClick}
              hasPermission={hasPermission}
              isActive={isActiveRoute}
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-stone-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-100 hover:text-stone-900 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>लॉग आउट</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Toggle Button (Tablet) */}
      <button
        onClick={onToggleSidebar}
        className="hidden lg:flex fixed top-4 left-[264px] z-30 p-1.5 bg-surface border border-stone-200 shadow-sm rounded-lg text-stone-600 hover:text-stone-900 transition-colors"
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isSidebarOpen ? (
          <PanelLeft className="w-5 h-5" />
        ) : (
          <PanelLeftClose className="w-5 h-5" />
        )}
      </button>
    </>
  );
};