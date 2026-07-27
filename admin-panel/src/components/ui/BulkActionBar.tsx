
import { Trash2, Archive, CheckCircle, X } from 'lucide-react';

export interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
}

export function BulkActionBar({ 
  selectedCount, 
  onClearSelection, 
  onDelete, 
  onPublish, 
  onArchive 
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--space-24)',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-12) var(--space-24)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-24)',
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
        <span style={{ 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          borderRadius: '50%', 
          width: '24px', 
          height: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: '12px', 
          fontWeight: 'bold' 
        }}>
          {selectedCount}
        </span>
        <span style={{ fontWeight: 600 }}>items selected</span>
      </div>

      <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        {onPublish && (
          <button className="btn btn-outline" onClick={onPublish} style={{ padding: 'var(--space-8) var(--space-12)' }}>
            <CheckCircle size={16} style={{ marginRight: '4px' }} /> Publish
          </button>
        )}
        {onArchive && (
          <button className="btn btn-outline" onClick={onArchive} style={{ padding: 'var(--space-8) var(--space-12)' }}>
            <Archive size={16} style={{ marginRight: '4px' }} /> Archive
          </button>
        )}
        {onDelete && (
          <button className="btn btn-outline" onClick={onDelete} style={{ padding: 'var(--space-8) var(--space-12)', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            <Trash2 size={16} style={{ marginRight: '4px' }} /> Delete
          </button>
        )}
      </div>

      <button 
        type="button" 
        onClick={onClearSelection}
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          padding: '4px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <X size={20} />
      </button>
    </div>
  );
}
