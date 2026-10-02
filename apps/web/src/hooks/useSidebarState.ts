import { useState, useCallback, useEffect } from 'react';
import { useIsMobile, useIsTablet } from './useMediaQuery';

const STORAGE_KEY = 'ssp-admin-sidebar-collapsed';

function readPersistedCollapsed(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'true') return true;
    if (val === 'false') return false;
  } catch {
    // localStorage unavailable
  }
  return false;
}

function persistCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  } catch {
    // localStorage unavailable
  }
}

export function useSidebarState() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = !isMobile && !isTablet;

  const [collapsed, setCollapsedState] = useState(readPersistedCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  // On tablet initial render, force collapsed (overlay mode only)
  useEffect(() => {
    if (isTablet) {
      setCollapsedState(true);
    }
  }, [isTablet]);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      if (isDesktop) persistCollapsed(next);
      return next;
    });
  }, [isDesktop]);

  const setCollapsed = useCallback(
    (val: boolean) => {
      setCollapsedState(val);
      if (isDesktop) persistCollapsed(val);
    },
    [isDesktop]
  );

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(
    () => setMobileOpen((prev) => !prev),
    []
  );

  // Close any overlay (mobile drawer or tablet overlay)
  const closeOverlay = useCallback(() => {
    if (isMobile) {
      setMobileOpen(false);
    } else if (isTablet) {
      setCollapsedState(true);
    }
  }, [isMobile, isTablet]);

  // Tablet overlay mode: when expanded (not collapsed), it's an overlay
  const isOverlay = (isTablet && !collapsed) || isMobile;

  // Whether sidebar is visually visible
  const isVisible = isDesktop ? true : isMobile ? mobileOpen : !collapsed;

  // Effective collapsed state for rendering sidebar content:
  // On mobile drawer open, show full content (not collapsed).
  // On tablet overlay open, show full content (collapsed controls visibility).
  // Otherwise use the raw collapsed state.
  const renderCollapsed = isDesktop
    ? collapsed
    : isMobile
    ? !mobileOpen
    : collapsed;

  return {
    collapsed: renderCollapsed,
    mobileOpen,
    isVisible,
    isOverlay,
    isDesktop,
    isTablet,
    isMobile,
    toggleCollapsed,
    setCollapsed,
    openMobile,
    closeMobile,
    toggleMobile,
    closeOverlay,
  };
}

export type SidebarState = ReturnType<typeof useSidebarState>;
