import React from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';

export interface AdminSaveBarProps {
  show: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  message?: string;
  disabled?: boolean;
}

export const AdminSaveBar: React.FC<AdminSaveBarProps> = ({
  show,
  onSave,
  onCancel,
  isSaving = false,
  saveLabel = 'परिवर्तन सुरक्षित करें',
  cancelLabel = 'रद्द करें',
  message = 'आपके पास असहेजे गए परिवर्तन हैं।',
  disabled = false,
}) => {
  if (!show) return null;

  return (
    <aside
      aria-label="सहेजें बार"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-stone-900/95 text-white p-4 rounded-2xl shadow-2xl border border-stone-700/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 font-['Mukta']"
    >
      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-200">
        <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
        <span>{message}</span>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || disabled}
          className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>सहेजा जा रहा है…</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{saveLabel}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
