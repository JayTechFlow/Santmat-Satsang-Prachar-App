/**
 * ============================================================================
 * Santmat Satsang Prachar — Profile Control Center
 * ============================================================================
 * Account popover with avatar, display name, email, role badge,
 * account status, settings, and logout actions.
 * Focus trap, ESC, outside click, focus restore.
 */
import { useRef, useEffect, useCallback } from 'react';
import { LogOut, Settings, Shield } from 'lucide-react';
import { usePermissions } from '../../app/providers/PermissionContext';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS: Record<string, string> = {
  developer_super_admin: 'डेवलपर सुपर एडमिन',
  client_super_admin: 'क्लाइंट एडमिन',
  mobile_user: 'मोबाइल यूज़र',
};

interface ProfilePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

export const ProfilePopover: React.FC<ProfilePopoverProps> = ({ isOpen, onClose, anchorRef }) => {
  const { user, logout } = usePermissions();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    },
    [onClose, anchorRef]
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    panelRef.current?.addEventListener('keydown', handleKeyDown);
    // Focus first menu item
    requestAnimationFrame(() => firstMenuItemRef.current?.focus());
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      panelRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClickOutside, handleEscape, handleKeyDown]);

  // Restore focus to trigger on close
  useEffect(() => {
    if (!isOpen && anchorRef.current) {
      const trigger = anchorRef.current.querySelector<HTMLButtonElement>('button');
      trigger?.focus();
    }
  }, [isOpen, anchorRef]);

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const handleProfile = () => {
    onClose();
    navigate('/admin/settings');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      id="profile-panel"
      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl z-[50] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      role="menu"
      aria-label="उपयोगकर्ता मेनू"
    >
      {/* User Info Header */}
      <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-amber-50/80 to-orange-50/40 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm shrink-0"
            aria-hidden="true"
          >
            <span className="text-sm">
              {user ? (user.displayName || user.email || '').charAt(0).toUpperCase() || 'उ' : 'उ'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-['Mukta'] font-bold text-sm text-stone-900 truncate">
              {user?.displayName || '—'}
            </p>
            <p className="font-['Mukta'] text-xs text-stone-500 truncate">
              {user?.email || '—'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {user?.role && (
            <>
              <Shield className="w-3 h-3 text-amber-700" />
              <span className="font-['Mukta'] text-[0.7rem] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </>
          )}
          {user?.accountStatus === 'suspended' && (
            <span className="font-['Mukta'] text-[0.65rem] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              निलंबित
            </span>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1.5">
        <button
          ref={firstMenuItemRef}
          onClick={handleProfile}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors text-left"
          role="menuitem"
        >
          <Settings className="w-4 h-4 text-stone-400" />
          <span className="font-['Mukta'] text-sm font-semibold">सेटिंग्स</span>
        </button>
        <div className="mx-4 my-1 border-t border-stone-100" aria-hidden="true" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors text-left"
          role="menuitem"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-['Mukta'] text-sm font-semibold">लॉग आउट</span>
        </button>
      </div>
    </div>
  );
};
