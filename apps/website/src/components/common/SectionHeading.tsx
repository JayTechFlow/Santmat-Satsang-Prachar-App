import React from 'react';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  description,
  align = 'center',
  className = '',
}) => {
  const isCenter = align === 'center';

  return (
    <div className={`mb-10 sm:mb-12 ${isCenter ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'} ${className}`}>
      {badge && (
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full mb-3">
          {badge}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight mb-3">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
