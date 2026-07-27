import React from 'react';
import type { UserStatus } from '../types';
import { CheckCircle, AlertCircle, Ban, Archive } from 'lucide-react';

export interface UserStatusBadgeProps {
  status: UserStatus;
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  const config: Record<UserStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    active: { color: 'var(--success)', bg: '#dcfce7', icon: <CheckCircle size={14} />, label: 'Active' },
    inactive: { color: 'var(--text-muted)', bg: 'var(--background)', icon: <AlertCircle size={14} />, label: 'Inactive' },
    suspended: { color: 'var(--danger)', bg: '#fee2e2', icon: <Ban size={14} />, label: 'Suspended' },
    archived: { color: 'var(--text-muted)', bg: 'var(--background)', icon: <Archive size={14} />, label: 'Archived' },
  };

  const current = config[status] || config.inactive;

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
