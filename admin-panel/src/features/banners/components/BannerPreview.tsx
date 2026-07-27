import React from 'react';

export interface BannerPreviewProps {
  imageUrl: string;
  mobileImageUrl?: string;
  title: string;
  subtitle?: string;
  aspectRatio?: 'landscape' | 'square' | 'portrait';
}

export const BannerPreview: React.FC<BannerPreviewProps> = ({ 
  imageUrl, 
  mobileImageUrl, 
  title, 
  subtitle,
  aspectRatio = 'landscape'
}) => {
  if (!imageUrl) {
    return (
      <div style={{
        width: '100%',
        aspectRatio: aspectRatio === 'landscape' ? '16/9' : (aspectRatio === 'square' ? '1/1' : '9/16'),
        backgroundColor: 'var(--background)',
        border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)'
      }}>
        No Image Available
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      aspectRatio: aspectRatio === 'landscape' ? '16/9' : (aspectRatio === 'square' ? '1/1' : '9/16'),
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#000'
    }}>
      <picture>
        {mobileImageUrl && (
          <source media="(max-width: 768px)" srcSet={mobileImageUrl} />
        )}
        <img 
          src={imageUrl} 
          alt={title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
        />
      </picture>
      
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 'var(--space-16)',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        color: '#fff'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{title}</h3>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.875rem', opacity: 0.9 }}>{subtitle}</p>}
      </div>
    </div>
  );
};
