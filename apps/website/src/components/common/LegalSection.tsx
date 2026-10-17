import React from 'react';

interface LegalSectionProps {
  title: string;
  id?: string;
  children: React.ReactNode;
}

export const LegalSection: React.FC<LegalSectionProps> = ({ title, id, children }) => {
  return (
    <section id={id} className="space-y-3 pt-6 border-t border-stone-200 first:border-t-0 first:pt-0">
      <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
        {title}
      </h2>
      <div className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
};
