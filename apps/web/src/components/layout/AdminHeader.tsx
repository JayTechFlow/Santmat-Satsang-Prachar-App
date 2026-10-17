/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Admin Header (Redesigned)
 * ============================================================================
 * Responsive header: hamburger (mobile), sidebar toggle (tablet),
 * route-aware title, search trigger (⌘K), notification bell, profile avatar.
 * Closes all panels on route change.
 *
 * Redesigned with modern UI principles:
 * - Cleaner visual hierarchy
 * - Improved spacing and alignment
 * - Better responsive behavior
 * - Reduced visual clutter
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import { Search, Bell, Menu, PanelLeft } from 'lucide-react';
import { useApp } from '../../app/providers/AppContext';
import { usePermissions } from '../../app/providers/PermissionContext';
import { getRouteTitle } from '../../config/navConfig';
import { ProfilePopover } from './ProfilePopover';
import { NotificationPanel } from './NotificationPanel';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSearch: () => void;
  routeKey: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenSearch,
  routeKey
}) => {
  const { unreadNotifications } = useApp();
  const { user } = usePermissions();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);

  const handleToggleNotifications = useCallback(() => {
    setNotificationsOpen(prev => !prev);
    if (profileOpen) setProfileOpen(false);
  }, [profileOpen]);

  const handleToggleProfile = useCallback(() => {
    setProfileOpen(prev => !prev);
    if (notificationsOpen) setNotificationsOpen(false);
  }, [notificationsOpen]);

  const handleClosePanels = useCallback(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, []);

  // Close panels when route changes
  useEffect(() => {
    handleClosePanels();
  }, [routeKey, handleClosePanels]);

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Handle notification panel close
      if (
        notificationsOpen &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(e.target as Node)
      ) {
        const notificationPanel = document.getElementById('notification-panel');
        if (notificationPanel && !notificationPanel.contains(e.target as Node)) {
          setNotificationsOpen(false);
        }
      }

      // Handle profile panel close
      if (
        profileOpen &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        const profilePanel = document.getElementById('profile-panel');
        if (profilePanel && !profilePanel.contains(e.target as Node)) {
          setProfileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen, profileOpen]);

  const routeTitle = getRouteTitle(routeKey);

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left Section - Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Page Title */}
          <h1 className="text-lg font-bold text-stone-900 truncate max-w-[200px] sm:max-w-none">
            {routeTitle}
          </h1>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            aria-label="Open search (⌘K)"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">खोज...</span>
            <kbd className="hidden px-1.5 py-0.5 text-xs font-medium text-stone-500 bg-stone-200 rounded ml-1">
              ⌘K
            </kbd>
          </button>

          {/* Mobile Search Icon Only */}
          <button
            onClick={onOpenSearch}
            className="flex sm:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Open search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          {user && (
            <div className="relative" ref={notificationButtonRef}>
              <button
                onClick={handleToggleNotifications}
                className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-brand rounded-full">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              <NotificationPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                anchorRef={notificationButtonRef}
              />
            </div>
          )}

          {/* Profile */}
          {user && (
            <div className="relative" ref={profileButtonRef}>
              <button
                onClick={handleToggleProfile}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                aria-label="User profile"
                aria-expanded={profileOpen}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              </button>

              <ProfilePopover
                isOpen={profileOpen}
                onClose={() => setProfileOpen(false)}
                anchorRef={profileButtonRef}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};