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
  icon = <PackageOpen size={48} color="var(--text-muted)" aria-hidden="true" />,
  action
}) => {
  return (
    <div className="empty-state-block" role="status" aria-live="polite">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};