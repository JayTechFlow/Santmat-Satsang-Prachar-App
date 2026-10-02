import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2, CheckCircle2 } from 'lucide-react';

export interface AdminDeleteDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  targetIdentifier?: string;
  targetDetails?: Array<{ label: string; value: string }>;
  cleanupList?: string[];
  requiresConfirmationInput?: boolean;
  confirmationKeyword?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AdminDeleteDialog: React.FC<AdminDeleteDialogProps> = ({
  isOpen,
  title,
  description,
  targetIdentifier,
  targetDetails,
  cleanupList,
  requiresConfirmationInput = false,
  confirmationKeyword = 'DELETE',
  confirmButtonText = 'हाँ, स्थायी रूप से हटाएं',
  cancelButtonText = 'रद्द करें',
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  const [typedInput, setTypedInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmationSatisfied = requiresConfirmationInput
    ? typedInput.trim().toUpperCase() === confirmationKeyword.trim().toUpperCase()
    : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-red-200 overflow-hidden font-['Mukta']">
        {/* Top Danger Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-orange-600 to-red-600" />

        <div className="p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 text-red-700 rounded-lg shrink-0 border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-extrabold text-stone-900 leading-snug">
                {title}
              </h3>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                {description}
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Target Identifier / Details Card */}
          {(targetIdentifier || (targetDetails && targetDetails.length > 0)) && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs sm:text-sm">
              {targetIdentifier && (
                <div className="font-mono text-stone-700 break-all font-bold">
                  लक्षित ID: <span className="text-red-700">{targetIdentifier}</span>
                </div>
              )}
              {targetDetails?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-stone-600">
                  <span className="font-semibold text-stone-500">{item.label}:</span>
                  <span className="font-medium text-stone-800 break-all">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Subsystem Cleanup Checklist */}
          {cleanupList && cleanupList.length > 0 && (
            <div className="space-y-2 p-3.5 bg-red-50/50 rounded-2xl border border-red-100">
              <div className="text-xs font-bold text-red-900 uppercase tracking-wider">
                इस क्रिया से निम्नलिखित संसाधन स्थायी रूप से हट जाएंगे:
              </div>
              <ul className="space-y-1.5 text-xs text-red-800">
                {cleanupList.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirmation Keyword Input */}
          {requiresConfirmationInput && (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-stone-700">
                पुष्टि के लिए नीचे दिए गए बॉक्स में{' '}
                <span className="font-mono font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                  {confirmationKeyword}
                </span>{' '}
                टाइप करें:
              </label>
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder={`Type ${confirmationKeyword} to confirm`}
                disabled={isDeleting}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-stone-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-xl text-sm font-mono outline-none transition-all"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[0.625rem] border border-stone-300 text-stone-700 text-sm font-bold hover:bg-stone-100 transition-colors disabled:opacity-50"
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting || !isConfirmationSatisfied}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[0.625rem] bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>हटाया जा रहा है…</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmButtonText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
