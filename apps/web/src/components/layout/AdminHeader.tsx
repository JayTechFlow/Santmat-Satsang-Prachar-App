/**
 * ============================================================================
 * Santmat Satsang Prachar — Enterprise Admin Header
 * ============================================================================
 * Responsive header: hamburger (mobile), sidebar toggle (tablet),
 * route-aware title, search trigger (⌘K), notification bell, profile avatar.
 * Closes all panels on route change.
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import { Search, Bell, Menu, PanelLeft } from 'lucide-react';
import { useApp } from '../../app/providers/AppContext';
import { usePermissions } from '../../app/providers/PermissionContext';
import { getRouteTitle } from '../../config/navConfig';
import { ProfilePopover } from './ProfilePopover';
import { NotificationPanel } from './NotificationPanel';
import type { SidebarState } from '../../hooks/useSidebarState';

interface AdminHeaderProps {
  sidebar: SidebarState;
  onOpenSearch: () => void;
  routeKey: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ sidebar, onOpenSearch, routeKey }) => {
  const { notifications } = useApp();
  const { user } = usePermissions();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const title = getRouteTitle(routeKey);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileAnchorRef = useRef<HTMLDivElement | null>(null);
  const notifAnchorRef = useRef<HTMLDivElement | null>(null);

  const closeAll = useCallback(() => {
    setProfileOpen(false);
    setNotifOpen(false);
  }, []);

  const toggleProfile = useCallback(() => {
    setNotifOpen(false);
    setProfileOpen((prev) => !prev);
  }, []);

  const toggleNotif = useCallback(() => {
    setProfileOpen(false);
    setNotifOpen((prev) => !prev);
  }, []);

  // Close all panels on route change
  useEffect(() => {
    closeAll();
  }, [routeKey, closeAll]);

  // Close panels when search opens
  useEffect(() => {
    if (profileOpen || notifOpen) {
      const handleSearchOpen = () => closeAll();
      window.addEventListener('open-search', handleSearchOpen);
      return () => window.removeEventListener('open-search', handleSearchOpen);
    }
  }, [profileOpen, notifOpen, closeAll]);

  const userInitial = (user?.displayName || user?.email || '').charAt(0).toUpperCase() || 'उ';

  return (
    <header
      className="h-[--header-height] bg-white border-b border-stone-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-[20] select-none shrink-0"
      role="banner"
    >
      {/* Left: Sidebar controls + Title */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {sidebar.isMobile && (
          <button
            onClick={sidebar.toggleMobile}
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="ओपन साइडबार मेनू"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {sidebar.isTablet && (
          <button
            onClick={sidebar.toggleCollapsed}
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="ओपन साइडबार"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        <h1 className="font-['Mukta'] font-extrabold text-base md:text-lg lg:text-xl text-stone-900 truncate">
          {title}
        </h1>
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
        {/* Search Trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100 transition-all text-stone-500 min-h-[36px]"
          title="खोजें (⌘K)"
          aria-label="खोजें"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline font-['Mukta'] text-xs font-semibold text-stone-400">खोजें</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-stone-100 text-stone-400 rounded text-[0.6rem] font-mono font-bold border border-stone-200">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifAnchorRef}>
          <button
            onClick={toggleNotif}
            className={`relative p-2 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center ${
              notifOpen ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-100 active:bg-stone-200'
            }`}
            aria-label={`सूचनाएँ${unreadCount > 0 ? ` — ${unreadCount} अपठित` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="dialog"
            aria-controls={notifOpen ? 'notification-panel' : undefined}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-orange-600 text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            anchorRef={notifAnchorRef}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-stone-200 mx-0.5" aria-hidden="true" />

        {/* Profile */}
        <div className="relative" ref={profileAnchorRef}>
          <button
            onClick={toggleProfile}
            className={`flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full border transition-all min-h-[36px] ${
              profileOpen
                ? 'border-amber-300 bg-amber-50'
                : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 active:bg-stone-100'
            }`}
            aria-label="उपयोगकर्ता मेनू"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-controls={profileOpen ? 'profile-panel' : undefined}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-[0.6rem] font-bold border border-amber-300 shrink-0">
              <span>{userInitial}</span>
            </div>
          </button>
          <ProfilePopover
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            anchorRef={profileAnchorRef}
          />
        </div>
      </div>
    </header>
  );
};
