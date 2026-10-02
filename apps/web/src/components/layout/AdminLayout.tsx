/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Admin Layout Shell
 * ============================================================================
 * Coordinates sidebar state, responsive mode, header, and content.
 * Manages global search modal (⌘K) and passes search trigger to header.
 */
import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSidebarState } from '../../hooks/useSidebarState';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { GlobalSearchModal } from '../shared/GlobalSearchModal';

export const AdminLayout: React.FC = () => {
  const sidebar = useSidebarState();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleOpenSearch = useCallback(() => setSearchOpen(true), []);
  const handleCloseSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const contentMarginLeft = sidebar.isDesktop
    ? sidebar.collapsed
      ? 'ml-[--sidebar-collapsed-width]'
      : 'ml-[--sidebar-width]'
    : 'ml-0';

  return (
    <div className="flex h-screen w-full bg-background text-stone-900 overflow-hidden font-['Mukta']">
      <AdminSidebar sidebar={sidebar} />

      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-[margin] duration-300 ${contentMarginLeft}`}
      >
        <AdminHeader
          sidebar={sidebar}
          onOpenSearch={handleOpenSearch}
          routeKey={location.pathname}
        />
        <main className="flex-1 overflow-y-auto bg-background-alt">
          <Outlet />
        </main>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={handleCloseSearch} />
    </div>
  );
};
