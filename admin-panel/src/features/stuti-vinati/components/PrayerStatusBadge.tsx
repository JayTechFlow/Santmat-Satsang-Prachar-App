import React from 'react';
import type { PublishStatus } from '../types';
import { CheckCircle, AlertCircle, Archive } from 'lucide-react';

export interface PrayerStatusBadgeProps {
  status: PublishStatus;
}

export const PrayerStatusBadge: React.FC<PrayerStatusBadgeProps> = ({ status }) => {
  const config: Record<PublishStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    draft: { color: 'var(--text-muted)', bg: 'var(--background)', icon: <AlertCircle size={14} />, label: 'Draft' },
    published: { color: 'var(--success)', bg: '#dcfce7', icon: <CheckCircle size={14} />, label: 'Published' },
    archived: { color: 'var(--text-muted)', bg: 'var(--background)', icon: <Archive size={14} />, label: 'Archived' },
  };

  const current = config[status] || config.draft;

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
