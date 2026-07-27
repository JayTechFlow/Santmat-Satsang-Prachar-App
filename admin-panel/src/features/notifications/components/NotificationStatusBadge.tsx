import React from 'react';
import type { PushStatus } from '../types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export interface NotificationStatusBadgeProps {
  status: PushStatus;
}

export const NotificationStatusBadge: React.FC<NotificationStatusBadgeProps> = ({ status }) => {
  const config: Record<PushStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    pending: { color: 'var(--text-muted)', bg: 'var(--background)', icon: <Clock size={14} />, label: 'Pending' },
    sent: { color: 'var(--success)', bg: '#dcfce7', icon: <CheckCircle size={14} />, label: 'Sent' },
    failed: { color: 'var(--danger)', bg: '#fee2e2', icon: <XCircle size={14} />, label: 'Failed' },
  };

  const current = config[status] || config.pending;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      borderRadius: 'var(--radius-input)',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: current.color,
      backgroundColor: current.bg,
      border: `1px solid ${current.color}40`
    }}>
      {current.icon}
      {current.label}
    </span>
  );
};
