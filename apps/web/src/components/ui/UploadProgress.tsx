import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { PublishProgress, UploadPhase } from '../../services/shared/ContentPublishingService';

interface UploadProgressProps {
  progress: PublishProgress | null;
  onClose?: () => void;
  onRetry?: () => void;
}

export const UploadProgressComponent: React.FC<UploadProgressProps> = ({
  progress,
  onClose,
  onRetry,
}) => {
  if (!progress) return null;

  const { phase, percentage, message, uploadedBytes, totalBytes, fileName, fileType, error } = progress;

  const isError = phase.endsWith('_ERROR');
  const isComplete = phase === 'COMPLETE';
  const isPending = !isError && !isComplete && phase !== 'IDLE';

  // Format bytes helper
  const formatBytes = (bytes?: number): string => {
    if (bytes === undefined || bytes === null || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get Phase Badge Color
  const getPhaseColor = (currentPhase: UploadPhase) => {
    if (currentPhase.endsWith('_ERROR')) return 'bg-red-50 text-red-700 border-red-200';
    if (currentPhase === 'COMPLETE') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (currentPhase === 'PUBLISHED') return 'bg-teal-50 text-teal-700 border-teal-200';
    if (currentPhase === 'MEDIA_STORED') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-xl border border-stone-200 shadow-2xl p-5 select-none font-['Mukta'] transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-[0.68rem] px-2.5 py-0.5 rounded-full border font-bold ${getPhaseColor(phase)}`}>
              {phase}
            </span>
            {isPending && <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
          </div>
          <h3 className="font-extrabold text-stone-900 text-sm mt-1.5 leading-tight">
            {message}
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* File Metadata Details */}
      {fileName && (
        <div className="mt-3 bg-stone-50 rounded-2xl p-3 border border-stone-100 flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between text-stone-700 font-semibold">
            <span className="truncate max-w-[240px]" title={fileName}>
              {fileName}
            </span>
            <span className="text-[0.7rem] text-stone-500 font-medium capitalize">
              {fileType?.split('/')[1] || 'फ़ाइल'}
            </span>
          </div>
          {totalBytes && (
            <div className="text-[0.68rem] text-stone-500 font-medium">
              आकार: {formatBytes(totalBytes)}
              {uploadedBytes !== undefined && ` • अपलोड हुआ: ${formatBytes(uploadedBytes)}`}
            </div>
          )}
        </div>
      )}

      {/* Progress Bar & Details */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-stone-600">प्रगति (Progress)</span>
          <span className="text-amber-800">{percentage}%</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200/50">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isError
                ? 'bg-red-600'
                : isComplete
                  ? 'bg-emerald-600 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-[#EA580C]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Action / Error Details */}
      {isError && (
        <div className="mt-3.5 flex items-start gap-2 text-xs bg-red-50 text-red-800 p-3 rounded-2xl border border-red-200/40">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">अपलोड या प्रकाशन विफल रहा</p>
            <p className="text-[0.7rem] leading-relaxed text-red-700">{error || 'अज्ञात त्रुटि।'}</p>
          </div>
        </div>
      )}

      {isComplete && (
        <div className="mt-3.5 flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200/40">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <div>
            <p className="font-bold">सफलतापूर्वक पूर्ण</p>
            <p className="text-[0.7rem] text-emerald-700">सभी फ़ाइलें और विवरण सहेज लिए गए हैं।</p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="mt-4 flex items-center justify-end gap-2 text-xs font-bold">
        {isError && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>पुनः प्रयास करें (Retry)</span>
          </button>
        )}
        {isComplete && onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all"
          >
            <span>ठीक है</span>
          </button>
        )}
      </div>
    </div>
  );
};
export default UploadProgressComponent;
