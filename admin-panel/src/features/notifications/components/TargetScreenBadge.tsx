import React from 'react';

export interface TargetScreenBadgeProps {
  screen: string;
}

export const TargetScreenBadge: React.FC<TargetScreenBadgeProps> = ({ screen }) => {
  const getScreenBadgeStyle = (s: string) => {
    const key = (s || '').toLowerCase();
    const badgeMap: Record<string, React.CSSProperties> = {
      home: {
        backgroundColor: '#EFF6FF',
        color: '#2563EB',
        border: '1px solid rgba(37, 99, 235, 0.25)',
      },
      audio: {
        backgroundColor: '#FFF2E8',
        color: 'var(--primary)',
        border: '1px solid rgba(232, 116, 18, 0.25)',
      },
      books: {
        backgroundColor: '#DCFCE7',
        color: 'var(--success)',
        border: '1px solid rgba(22, 163, 74, 0.25)',
      },
      stutivinati: {
        backgroundColor: '#F3E8FF',
        color: '#8B5CF6',
        border: '1px solid rgba(139, 92, 246, 0.25)',
      },
    };

    const defaultStyle: React.CSSProperties = {
      backgroundColor: 'var(--background)',
      color: 'var(--text-body)',
      border: '1px solid var(--border)',
    };

    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: 'var(50%)',
      fontSize: '0.75rem',
      fontWeight: 600,
      ...(badgeMap[key] || defaultStyle),
    };
  };

  return <span style={getScreenBadgeStyle(screen)}>{screen}</span>;
};
