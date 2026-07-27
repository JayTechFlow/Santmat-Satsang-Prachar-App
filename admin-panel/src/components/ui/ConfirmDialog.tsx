import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="modal-content" style={{ maxWidth: '400px', margin: 'var(--space-24)', position: 'relative' }}>
        <button 
          onClick={onCancel}
          className="btn-icon"
          style={{ position: 'absolute', top: 'var(--space-16)', right: 'var(--space-16)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-16)', marginBottom: 'var(--space-24)' }}>
          {isDestructive && (
            <div style={{ 
              backgroundColor: '#FEF2F2', 
              color: 'var(--danger)', 
              padding: 'var(--space-8)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={24} />
            </div>
          )}
          <div>
            <h3 style={{ marginBottom: 'var(--space-8)' }}>{title}</h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.875rem' }}>{message}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)' }}>
          <button className="btn btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
