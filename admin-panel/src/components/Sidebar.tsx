import { useEffect, useRef, useState } from 'react';
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
      >
        <div className="sidebar-inner">
          {/* Top Logo & Title */}
          <div className="p-4 border-b border-stone-200 flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200">
              <Sun className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-['Mukta'] font-extrabold text-stone-900 text-base leading-tight">
                संतमत सत्संग प्रचार
              </h2>
              <span className="font-['Mukta'] text-xs font-semibold text-amber-800">
                एडमिन पैनल
              </span>
            </div>
          </div>

          {/* Navigation List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1 text-sm font-['Mukta']">
            <SidebarContent collapsed={collapsed} navItemRefs={navItemRefs} />
          </div>

          <div className="sidebar-theme-toggle" role="button" tabIndex={0} onClick={toggledarkLight} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            <span className="sr-only">{theme === 'dark' ? 'Light theme' : 'Dark theme'}</span>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </div>
        </div>
      </aside>
    </>
  );
}