import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'त्रुटि हुई (Something went wrong)',
  message = 'डेटा लोड करते समय समस्या आई। कृपया पुनः प्रयास करें।',
  onRetry
}) => {
  return (
    <div className="p-8 my-4 bg-red-50/70 border border-red-200 rounded-xl flex flex-col items-center justify-center text-center font-['Mukta']">
      <div className="p-3 bg-red-100 text-red-600 rounded-lg mb-3">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-red-900 mb-1">{title}</h3>
      <p className="text-xs text-red-700 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[0.625rem] text-xs font-bold shadow-xs transition-colors"
          onClick={onRetry}
        >
          पुनः प्रयास करें (Try Again)
        </button>
      )}
    </div>
  );
};
