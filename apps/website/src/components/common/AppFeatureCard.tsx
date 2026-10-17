import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AppFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const AppFeatureCard: React.FC<AppFeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="p-5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all duration-150">
      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-stone-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-stone-600 leading-relaxed">{description}</p>
    </div>
  );
};
