import React from 'react';
import { X, Trash2, CheckCircle, Archive } from 'lucide-react';

export interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  customActions?: { label: string; icon: React.ReactNode; onClick: () => void | Promise<void> }[];
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onDelete,
  onPublish,
  onArchive,
  customActions
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-stone-900 text-white rounded-2xl p-4 shadow-2xl border border-stone-800 z-50 flex items-center gap-6 font-['Mukta'] animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-extrabold text-xs flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-xs font-bold text-stone-200">चयनित आइटम (Selected)</span>
      </div>

      <div className="flex items-center gap-2">
        {onPublish && (
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-emerald-400 rounded-xl font-bold text-xs transition-colors"
            onClick={onPublish}
          >
            <CheckCircle className="w-4 h-4" /> प्रकाशित करें
          </button>
        )}
        {onArchive && (
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-xl font-bold text-xs transition-colors"
            onClick={onArchive}
          >
            <Archive className="w-4 h-4" /> आर्काइव करें
          </button>
        )}
        {customActions && customActions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl font-bold text-xs transition-colors"
            onClick={action.onClick}
          >
            {action.icon} {action.label}
          </button>
        ))}
        {onDelete && (
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" /> हटाएं
          </button>
        )}
        <button
          type="button"
          className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors ml-1"
          onClick={onClearSelection}
          title="चयन रद्द करें"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
