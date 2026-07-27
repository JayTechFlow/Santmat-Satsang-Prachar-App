import React from 'react';

export interface UploadProgressProps {
  progress: number;
  fileName?: string;
  onCancel?: () => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  fileName,
  onCancel
}) => {
  return (
    <div style={{
      width: '100%',
      padding: 'var(--space-16)',
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-input)',
      marginTop: 'var(--space-8)'
    }}>
      <div className="flex-between" style={{ marginBottom: 'var(--space-8)' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-heading)' }} className="truncate">
          {fileName || 'Uploading...'}
        </span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {Math.round(progress)}%
        </span>
      </div>
      
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#E8E8E8',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: onCancel ? 'var(--space-8)' : 0
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: 'var(--primary)',
          transition: 'width 0.2s ease'
        }} />
      </div>

      {onCancel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onCancel}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--danger)', 
              fontSize: '0.75rem', 
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
