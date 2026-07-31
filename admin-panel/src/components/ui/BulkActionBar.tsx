import React from 'react';
import { X, Trash2, CheckCircle, Archive } from 'lucide-react';

export interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  customActions?: { label: string; icon: React.ReactNode; onClick: () => void | Promise<void> }[];
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onDelete,
  onPublish,
  onArchive
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t shadow-float z-50 transform transition-transform" style={{ 
      transform: selectedCount > 0 ? 'translateY(0)' : 'translateY(100%)',
      padding: 'var(--space-16) var(--space-32)',
      marginLeft: 'var(--sidebar-width)',
    }}>
      <div className="flex-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center bg-primary-light text-primary rounded-full w-8 h-8 font-bold text-sm">
            {selectedCount}
          </div>
          <span className="font-medium text-heading">Items Selected</span>
        </div>
        
        <div className="flex items-center gap-4">
          {onPublish && (
            <button className="btn btn-outline" onClick={onPublish}>
              <CheckCircle size={16} /> Publish
            </button>
          )}
          {onArchive && (
            <button className="btn btn-outline" onClick={onArchive}>
              <Archive size={16} /> Archive
            </button>
          )}
          <button 
            className="btn btn-ghost text-muted"
            onClick={onClearSelection}
          >
            <X size={18} />
            Clear Selection
          </button>
          
          {onDelete && (
            <button 
              className="btn btn-danger"
              onClick={onDelete}
            >
              <Trash2 size={18} />
              Delete Selected
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
