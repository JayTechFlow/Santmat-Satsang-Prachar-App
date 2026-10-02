import React from 'react';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'कोई डेटा उपलब्ध नहीं',
  message = 'इस समय प्रदर्शित करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।',
  icon = <PackageOpen className="w-10 h-10 text-stone-400" aria-hidden="true" />,
  action
}) => {
  return (
    <div className="p-10 my-4 bg-stone-50/50 border border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-center font-['Mukta']" role="status" aria-live="polite">
      <div className="p-3 bg-stone-100 rounded-lg mb-3 text-stone-500">{icon}</div>
      <h3 className="text-base font-bold text-stone-800 mb-1">{title}</h3>
      <p className="text-xs text-stone-500 max-w-sm mb-4">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
