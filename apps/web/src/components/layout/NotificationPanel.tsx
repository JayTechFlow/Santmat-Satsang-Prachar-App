/**
 * ============================================================================
 * Santmat Satsang Prachar — Notification Center Panel
 * ============================================================================
 * Enterprise notification dropdown with real-time data, mark read, mark all,
 * type icons, relative timestamps, focus trap, outside click, ESC.
 */
import { useRef, useEffect, useCallback, useMemo } from 'react';
import { CheckCheck, Bell, Music, BookOpen, Sparkles, Calendar, MessageCircle, X } from 'lucide-react';
import { useApp } from '../../app/providers/AppContext';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  bhajan: <Music className="w-4 h-4" />,
  stuti: <BookOpen className="w-4 h-4" />,
  event: <Calendar className="w-4 h-4" />,
  special: <MessageCircle className="w-4 h-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  bhajan: 'भजन',
  stuti: 'स्तुति',
  event: 'कार्यक्रम',
  special: 'विशेष',
};

const TYPE_COLORS: Record<string, string> = {
  bhajan: 'bg-amber-100 text-amber-700',
  stuti: 'bg-rose-100 text-rose-700',
  event: 'bg-blue-100 text-blue-700',
  special: 'bg-orange-100 text-orange-700',
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return '';
  const diffMs = now - then;
  if (diffMs < 0) return 'अभी';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'अभी';
  if (mins < 60) return `${mins} मिनट पहले`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} घंटे पहले`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} दिन पहले`;
  try {
    return new Date(dateStr).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, anchorRef }) => {
  const { notifications, markAsRead, markAllAsRead } = useApp();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    requestAnimationFrame(() => closeButtonRef.current?.focus());
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

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [notifications]
  );

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    onClose();
    navigate('/admin/notifications');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      id="notification-panel"
      className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl border border-stone-200 shadow-xl z-[50] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
      role="dialog"
      aria-label="सूचनाएँ"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" />
          <span className="font-['Mukta'] font-bold text-sm text-stone-900">सूचनाएँ</span>
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[0.6rem] font-bold rounded-full">
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1 px-2 py-1 text-[0.7rem] font-bold text-amber-700 hover:bg-amber-50 active:bg-amber-100 rounded-lg transition-colors"
              title="सभी पढ़ें चिन्हित करें"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">सभी पढ़ें</span>
            </button>
          )}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[360px] overflow-y-auto" role="list">
        {sortedNotifications.length === 0 && (
          <div className="px-5 py-10 text-center" role="listitem">
            <Bell className="w-8 h-8 text-stone-200 mx-auto mb-2" />
            <p className="font-['Mukta'] text-xs font-bold text-stone-400">कोई सूचना नहीं</p>
            <p className="font-['Mukta'] text-[0.65rem] text-stone-300 mt-1">नई सूचनाएँ यहाँ दिखाई देंगी</p>
          </div>
        )}

        {sortedNotifications.slice(0, 15).map((n) => (
          <button
            key={n.id}
            onClick={() => handleNotificationClick(n.id)}
            className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-colors border-b border-stone-50 last:border-0 ${
              n.isRead ? 'hover:bg-stone-50/50 active:bg-stone-100/50' : 'bg-amber-50/30 hover:bg-amber-50/60 active:bg-amber-100/40'
            }`}
            role="listitem"
            aria-label={`${n.title} — ${n.isRead ? 'पठित' : 'अपठित'}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${TYPE_COLORS[n.type] || 'bg-stone-100 text-stone-500'}`}>
              {TYPE_ICONS[n.type] || <Bell className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-['Mukta'] text-xs font-bold text-stone-900 truncate">{n.title || 'सूचना'}</p>
                {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-label="अपठित" />}
              </div>
              <p className="font-['Mukta'] text-[0.7rem] text-stone-500 line-clamp-2 mt-0.5">{n.message || ''}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`font-['Mukta'] text-[0.6rem] font-semibold px-1.5 py-0.5 rounded ${TYPE_COLORS[n.type] || 'bg-stone-100 text-stone-500'}`}>
                  {TYPE_LABELS[n.type] || n.type}
                </span>
                <span className="font-['Mukta'] text-[0.6rem] text-stone-400">{formatRelativeDate(n.date)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-5 py-2.5 bg-stone-50 border-t border-stone-100">
          <button
            onClick={() => {
              onClose();
              navigate('/admin/notifications');
            }}
            className="w-full text-center font-['Mukta'] text-xs font-bold text-amber-700 hover:text-amber-800 active:text-amber-900 transition-colors py-1"
          >
            सभी सूचनाएँ देखें →
          </button>
        </div>
      )}
    </div>
  );
};
