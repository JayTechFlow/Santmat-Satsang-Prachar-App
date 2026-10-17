/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Admin Layout Shell (Redesigned)
 * ============================================================================
 * Coordinates sidebar state, responsive mode, header, and content.
 * Manages global search modal (⌘K) and passes search trigger to header.
 *
 * Redesigned with modern UI principles:
 * - Clean visual hierarchy
 * - Reduced visual clutter
 * - Improved responsive behavior
 * - Consistent spacing and typography
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
      // Global ⌘K search shortcut (both Mac and Windows)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !e.repeat) {
        e.preventDefault();
        setSearchOpen(true);
      }

      // ESC to close modals/panels
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Close search on navigation
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-background font-['Mukta']">
      {/* Mobile/Tablet Sidebar Overlay */}
      {(sidebar.mobileOpen || (sidebar.isTablet && !sidebar.collapsed)) && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm lg:hidden"
          onClick={sidebar.closeOverlay}
        />
      )}

      {/* Sidebar - Responsive behavior handled internally */}
      <AdminSidebar
        isSidebarOpen={sidebar.isVisible}
        onToggleSidebar={sidebar.toggleMobile}
        onCloseSidebar={sidebar.closeOverlay}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full">
        {/* Header with contextual actions */}
        <AdminHeader
          onToggleSidebar={sidebar.toggleMobile}
          isSidebarOpen={sidebar.mobileOpen}
          onOpenSearch={handleOpenSearch}
          routeKey={location.pathname}
        />

        {/* Page Content with consistent padding */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};