import React from 'react';
import { BookOpen } from 'lucide-react';

export interface PrayerPreviewProps {
  imageUrl?: string;
  title: string;
  size?: number;
}

export const PrayerPreview: React.FC<PrayerPreviewProps> = ({ 
  imageUrl, 
  title, 
  size = 52 
}) => {
  if (!imageUrl) {
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)'
      }}>
        <BookOpen size={size * 0.42} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={title}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: 'var(--radius-input)',
        objectFit: 'cover',
        boxShadow: 'var(--shadow-sm)'
      }}
    />
  );
};
