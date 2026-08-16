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
      <div 
        className="bg-amber-100/80 text-amber-800 border border-amber-200 flex items-center justify-center rounded-2xl shrink-0"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <BookOpen style={{ width: size * 0.45, height: size * 0.45 }} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={title}
      className="rounded-2xl object-cover shadow-xs border border-stone-200 shrink-0"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
