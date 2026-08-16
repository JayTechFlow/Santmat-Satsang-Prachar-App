import React, { useEffect, useRef, useCallback, useState } from 'react';
import { SidebarContent } from './navigation/SidebarContent';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  isTablet?: boolean;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { theme, toggledarkLight } = useTheme();
  const sidebarRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const navItemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const updateIsMobile = () => setIsMobile(mobileQuery.matches);
    updateIsMobile();
    mobileQuery.addEventListener('change', updateIsMobile);
    return () => mobileQuery.removeEventListener('change', updateIsMobile);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const links = navItemRefs.current.filter((ref): ref is HTMLAnchorElement => ref !== null);
      if (links.length === 0) return;

      const activeIndex = links.findIndex((link) => link === document.activeElement);
      let nextIndex = activeIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (activeIndex + 1) % links.length;
          links[nextIndex]?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = (activeIndex - 1 + links.length) % links.length;
          links[nextIndex]?.focus();
          break;
        case 'Home':
          e.preventDefault();
          links[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          links[links.length - 1]?.focus();
          break;
        case 'Escape':
          if (mobileOpen) {
            onCloseMobile();
          }
          break;
        default:
          break;
      }
    },
    [mobileOpen, onCloseMobile]
  );

  useEffect(() => {
    if (mobileOpen && isMobile) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      const focusableElements = sidebarRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements?.[0];
      const lastFocusable = focusableElements?.[focusableElements.length - 1];

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstFocusable?.focus();

      return () => {
        document.removeEventListener('keydown', handleTab);
        document.body.style.overflow = '';
        (previousActiveElement.current as HTMLElement)?.focus();
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen, isMobile]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen && isMobile) {
        onCloseMobile();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen, onCloseMobile, isMobile]);

  // Also close on tablet when clicking overlay (if needed in future)
  const shouldShowOverlay = isMobile && mobileOpen;

return (
    <>
      {shouldShowOverlay && (
        <div className="sidebar-overlay" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        ref={sidebarRef}
        className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${shouldShowOverlay ? 'sidebar-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
        onKeyDown={handleKeyDown}
      >
        <div className="sidebar-inner">
          <SidebarContent collapsed={collapsed} navItemRefs={navItemRefs} />

          <div className="sidebar-theme-toggle" role="button" tabIndex={0} onClick={toggledarkLight} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            <span className="sr-only">{theme === 'dark' ? 'Light theme' : 'Dark theme'}</span>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </div>
        </div>
      </aside>
    </>
  );
}