import { useState, useEffect } from 'react';
import { Menu, X, Calendar, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '../core/auth/PermissionContext';
import { getPageTitle } from '../components/navigation/navConfig';
import { UserMenu } from './header/UserMenu';
import { NotificationBell } from './header/NotificationBell';
import { GlobalSearchModal } from './search/GlobalSearchModal';

interface HeaderProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleSidebar: () => void;
  isTablet?: boolean;
}

export function Header({ collapsed, mobileOpen, onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const { context } = usePermissions();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getUserDisplayName = () => {
    if (context?.customClaims?.displayName) {
      return context.customClaims.displayName as string;
    }
    if (context?.customClaims?.email) {
      return (context.customClaims.email as string).split('@')[0];
    }
    return 'User';
  };

  const getUserEmail = () => {
    return (context?.customClaims?.email as string) || '';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userRole = context?.role ?? 'mobile_user';

  return (
    <>
      <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between sticky top-0 z-20 select-none" role="banner">
        <div className="flex items-center gap-3" aria-label="Page title and navigation">
          <button
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-all shadow-sm"
            onClick={onToggleSidebar}
            aria-label={mobileOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={mobileOpen || !collapsed}
            aria-controls="sidebar"
          >
            {mobileOpen ? (
              <X size={20} className="w-4 h-4" />
            ) : (
              <Menu size={20} className="w-4 h-4" />
            )}
          </button>
          <h1 className="font-['Mukta'] font-extrabold text-xl text-stone-900">{pageTitle}</h1>
        </div>

        <div className="header-right" role="group" aria-label="Header actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm flex items-center space-x-2 text-xs"
            onClick={() => setIsSearchOpen(true)}
            title="Global Search (Cmd+K)"
          >
            <Search size={14} color="var(--text-muted)" />
            <span className="hidden md:inline">Quick Search...</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] bg-muted/20 border rounded font-mono">⌘K</kbd>
          </button>

          <div className="header-date" aria-live="polite" aria-atomic="true">
            <Calendar size={16} color="var(--text-muted)" aria-hidden="true" />
            <time dateTime={new Date().toISOString().split('T')[0]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </time>
          </div>

          <NotificationBell unreadCount={0} />

          <UserMenu
            name={getUserDisplayName()}
            email={getUserEmail()}
            role={userRole}
            initials={getUserInitials()}
          />
        </div>
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}