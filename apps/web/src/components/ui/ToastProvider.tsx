import React, { useState, useCallback, useEffect, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { ToastContext, type ToastType, type ToastMessage } from '../../lib/hooks/useToast';

const Toast = ({ toast, onClose }: { toast: ToastMessage; onClose: (id: string) => void; key?: React.Key }) => {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-500 text-emerald-900';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-900';
      case 'info':
        return 'bg-amber-50 border-amber-500 text-amber-900';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-amber-600 shrink-0" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 p-4 border-l-4 rounded-2xl shadow-lg min-w-[300px] pointer-events-auto transition-all animate-in slide-in-from-bottom duration-200 font-['Mukta'] ${getStyle()}`}
    >
      {getIcon()}
      <span className="flex-1 font-bold text-xs">{toast.message}</span>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="p-1 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const success = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div
        role="region"
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col items-end gap-2"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
