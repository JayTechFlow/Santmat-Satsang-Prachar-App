import React from 'react';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  message = 'There are no records to display at this time.',
  icon = <PackageOpen size={48} color="var(--text-muted)" />,
  action
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-48) var(--space-24)',
      textAlign: 'center',
      backgroundColor: 'var(--surface)',
      borderRadius: 'var(--radius-card)',
      border: '1px dashed var(--border)'
    }}>
      <div style={{ marginBottom: 'var(--space-16)' }}>
        {icon}
      </div>
      <h3 style={{ marginBottom: 'var(--space-8)' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-24)', maxWidth: '400px' }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
