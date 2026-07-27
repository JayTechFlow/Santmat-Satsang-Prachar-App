import React from 'react';
import { BookOpen } from 'lucide-react';

export interface BookPreviewProps {
  coverUrl?: string;
  title: string;
  width?: string;
  height?: string;
}

export const BookPreview: React.FC<BookPreviewProps> = ({ 
  coverUrl, 
  title, 
  width = '100%', 
  height = '100%' 
}) => {
  if (!coverUrl) {
    return (
      <div style={{
        width,
        height,
        backgroundColor: 'var(--background)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-input)',
        color: 'var(--text-muted)'
      }}>
        <BookOpen size={24} />
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={title}
      style={{
        width,
        height,
        borderRadius: 'var(--radius-input)',
        objectFit: 'cover',
        boxShadow: 'var(--shadow-sm)'
      }}
    />
  );
};
