import { Loader2 } from 'lucide-react';
import { DiyaIcon } from '../shared/DevotionalIcons';

export const LoadingOverlay = ({ message = 'लोड हो रहा है…' }: { message?: string }) => {
  return (
    <div
      className="absolute inset-0 bg-white/80 backdrop-blur-2xs flex flex-col items-center justify-center z-40 p-4 font-['Mukta']"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs animate-bounce">
          <DiyaIcon className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          <span className="font-bold text-xs">{message}</span>
        </div>
      </div>
    </div>
  );
};
