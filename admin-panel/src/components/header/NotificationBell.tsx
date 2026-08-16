import { Bell } from 'lucide-react';
import { useFeatureFlag } from '../../core/auth/PermissionContext';

interface NotificationBellProps {
  unreadCount?: number;
}

export function NotificationBell({ unreadCount = 0 }: NotificationBellProps) {
  const notificationsEnabled = useFeatureFlag('feature.notifications');

  if (!notificationsEnabled) {
    return null;
  }

  return (
    <button
      className="btn-icon notification-bell"
      aria-label="Notifications"
      type="button"
    >
      <Bell size={20} color="var(--text-heading)" />
      {unreadCount > 0 && (
        <span className="notification-badge" aria-label={`${unreadCount} unread notifications`}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}