import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { ToastContext, type ToastType, type ToastMessage } from '../../hooks/useToast';

const Toast = ({ toast, onClose }: { toast: ToastMessage; onClose: (id: string) => void }) => {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 style={{ color: 'var(--success)' }} size={20} />;
      case 'error': return <XCircle style={{ color: 'var(--danger)' }} size={20} />;
      case 'info': return <Info style={{ color: 'var(--primary)' }} size={20} />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success': return '#F0FDF4';
      case 'error': return '#FEF2F2';
      case 'info': return '#F0F9FF';
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'var(--success)';
      case 'error': return 'var(--danger)';
      case 'info': return 'var(--primary)';
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-16)',
      padding: 'var(--space-16)',
      backgroundColor: getBgColor(),
      borderLeft: `4px solid ${getBorderColor()}`,
      borderRadius: 'var(--radius-input)',
      boxShadow: 'var(--shadow-card)',
      minWidth: '300px',
      pointerEvents: 'auto',
      marginBottom: 'var(--space-16)'
    }}>
      {getIcon()}
      <span style={{ flex: 1, color: 'var(--text-heading)', fontWeight: 600 }}>{toast.message}</span>
      <button onClick={() => onClose(toast.id)} className="btn-icon">
        <X size={16} />
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
      <div style={{
        position: 'fixed',
        bottom: 'var(--space-32)',
        right: 'var(--space-32)',
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
