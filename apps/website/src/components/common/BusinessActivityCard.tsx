import React from 'react';
import {
  FileText,
  Megaphone,
  Mic,
  Music,
  Radio,
  Share2,
  LucideIcon,
} from 'lucide-react';

export interface BusinessActivityItem {
  id: string;
  title: string;
  titleHindi?: string;
  description: string;
  shortDesc?: string;
}

const iconMap: Record<string, LucideIcon> = {
  'digital-content': FileText,
  'digital-marketing': Megaphone,
  'sound-recording': Mic,
  'music-publishing': Music,
  'digital-media-publishing': Radio,
  'audio-distribution': Share2,
};

interface BusinessActivityCardProps {
  activity: BusinessActivityItem;
  index: number;
}

export const BusinessActivityCard: React.FC<BusinessActivityCardProps> = ({
  activity,
  index,
}) => {
  const IconComponent = iconMap[activity.id] || FileText;

  return (
    <div className="group relative p-6 sm:p-7 rounded-xl bg-white border border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform duration-200">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono font-semibold text-stone-400 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded">
            0{index + 1}
          </span>
        </div>

        <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-amber-800 transition-colors">
          {activity.title}
        </h3>
        {activity.titleHindi && (
          <p className="text-xs font-medium text-amber-700 mb-3">
            {activity.titleHindi}
          </p>
        )}

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {activity.description}
        </p>
      </div>

      {activity.shortDesc && (
        <div className="mt-5 pt-4 border-t border-stone-100 text-[11px] font-medium text-stone-500">
          {activity.shortDesc}
        </div>
      )}
    </div>
  );
};
