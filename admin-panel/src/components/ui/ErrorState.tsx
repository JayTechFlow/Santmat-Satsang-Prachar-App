import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading the data. Please try again.',
  onRetry
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-48) var(--space-24)',
      textAlign: 'center',
      backgroundColor: '#FEF2F2',
      borderRadius: 'var(--radius-card)',
      border: '1px solid var(--danger)'
    }}>
      <div style={{ marginBottom: 'var(--space-16)' }}>
        <AlertTriangle size={48} color="var(--danger)" />
      </div>
      <h3 style={{ marginBottom: 'var(--space-8)', color: 'var(--danger)' }}>{title}</h3>
      <p style={{ color: 'var(--danger)', opacity: 0.8, marginBottom: 'var(--space-24)', maxWidth: '400px' }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry} style={{ backgroundColor: 'var(--danger)' }}>
          Try Again
        </button>
      )}
    </div>
  );
};
