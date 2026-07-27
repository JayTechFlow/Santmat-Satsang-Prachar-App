import React from 'react';
import type { BannerDTO, BannerStatus } from '../types';
import { getEffectiveStatus } from '../services/bannerService';
import { Clock, CheckCircle, XCircle, AlertCircle, Archive } from 'lucide-react';

export interface BannerStatusBadgeProps {
  banner: BannerDTO;
}

export const BannerStatusBadge: React.FC<BannerStatusBadgeProps> = ({ banner }) => {
  const status = getEffectiveStatus(banner);

  const config: Record<BannerStatus, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    draft: { color: 'var(--text-muted)', bg: 'var(--background)', icon: <AlertCircle size={14} />, label: 'Draft' },
    scheduled: { color: '#0ea5e9', bg: '#e0f2fe', icon: <Clock size={14} />, label: 'Scheduled' },
    published: { color: 'var(--success)', bg: '#dcfce7', icon: <CheckCircle size={14} />, label: 'Published' },
    expired: { color: 'var(--danger)', bg: '#fee2e2', icon: <XCircle size={14} />, label: 'Expired' },
    archived: { color: 'var(--text-muted)', bg: 'var(--background)', icon: <Archive size={14} />, label: 'Archived' },
  };

  const current = config[status];

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
      border: `1px solid ${current.color}40` // 25% opacity border
    }}>
      {current.icon}
      {current.label}
    </span>
  );
};
