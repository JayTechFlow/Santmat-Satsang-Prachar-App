import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Music, FileAudio } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { AudioUpload } from '../components/ui/AudioUpload';
import { ImageUpload } from '../components/ui/ImageUpload';
import { useBhajans } from '../features/bhajans/hooks/useBhajans';
import { useBhajanMutations } from '../features/bhajans/hooks/useBhajanMutations';
import { useBhajanForm } from '../features/bhajans/hooks/useBhajanForm';
import { storageService } from '../core/storage';
import { Pagination } from '../components/ui/Pagination';
import { MarkdownEditor } from '../components/ui/MarkdownEditor';
import { DataTable } from '../components/ui/DataTable';
import { useTableSelection } from '../hooks/useTableSelection';
import { useBulkActions } from '../hooks/useBulkActions';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { bhajanService } from '../features/bhajans/services/bhajanService';

export function Audio() {
  const { data: items, loading: fetching, error: fetchError, refetch, currentPage, totalPages, goToPage } = useBhajans();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { error, success } = useToast();

  const { selectedIds, selectedCount, toggleSelection, selectAll, clearSelection } = useTableSelection<string>();
  const { executeBulkAction } = useBulkActions();
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isUnsavedConfirmOpen, setIsUnsavedConfirmOpen] = useState(false);

  const { createBhajan, updateBhajan, deleteBhajan, loading: mutating } = useBhajanMutations(() => {
    setIsModalOpen(false);
    setDeleteId(null);
    resetForm();
    refetch();
  });

  const { formData, setField, reset, validate, isDirty } = useBhajanForm();

  useEffect(() => {
    if (fetchError) {
      error("Failed to load audio tracks.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      error(validationError);
      return;
    }

    if (editingId) {
      await updateBhajan(editingId, formData);
    } else {
      await createBhajan(formData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteBhajan(deleteId);
  };

  const handleBulkDelete = async () => {
    const result = await executeBulkAction(
      selectedIds,
      async (id) => {
        await bhajanService.delete(id);
      }
    );
    
    setIsBulkDeleteModalOpen(false);
    clearSelection();
    refetch();
    
    if (result.failed > 0) {
      error(`Deleted ${result.successful} bhajans, but ${result.failed} failed.`);
    } else {
      success(`Successfully deleted ${result.successful} bhajans.`);
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    reset({
      title: item.title || '',
      description: item.description || '',
      audioUrl: item.audioUrl || '',
      thumbnailUrl: item.thumbnailUrl || '',
      lyrics: item.lyrics || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isDirty) {
      setIsUnsavedConfirmOpen(true);
      return;
    }
    setIsModalOpen(false);
  };

  const handleDiscardChanges = () => {
    setIsUnsavedConfirmOpen(false);
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setEditingId(null);
    reset();
  };

  const isLoading = fetching || mutating;

  return (
    <div>
      {/* Header Section */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-32)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--space-8)' }}>Bhajan & Audio Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Upload, organize, and manage spiritual audio tracks and bhajans
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Bhajan
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: '300px', position: 'relative' }}>
        {isLoading ? (
          <LoadingOverlay message="Loading..." />
        ) : items.length === 0 ? (
          <EmptyState title="No bhajans found" message="Get started by adding your first spiritual audio track." icon={<Music size={40} />} />
        ) : (
          <DataTable
            data={items}
            keyExtractor={item => item.id}
            selectable={true}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
            columns={[
              {
                key: 'thumbnailUrl',
                header: 'Thumbnail',
                render: (item) => item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-input)', border: '1px solid var(--border)' }}
                  />
                ) : (
                  <div style={{ width: '52px', height: '52px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Music size={22} color="var(--primary)" />
                  </div>
                )
              },
              {
                key: 'title',
                header: 'Title',
                sortable: true,
                render: (item) => (
                  <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                    <div>{item.title}</div>
                    {item.audioUrl && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileAudio size={12} color="var(--primary)" /> Audio attached
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'description',
                header: 'Description',
                render: (item) => (
                  <div style={{ color: 'var(--text-body)', fontSize: '0.875rem', maxWidth: '300px' }}>
                    {item.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description</span>}
                  </div>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (item) => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
                    <button
                      className="btn btn-outline"
                      style={{ padding: 'var(--space-8) var(--space-8)', fontSize: '0.875rem' }}
                      onClick={() => openEdit(item)}
                      title="Edit bhajan"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ padding: 'var(--space-8) var(--space-8)', fontSize: '0.875rem', color: 'var(--danger)', borderColor: 'rgba(220, 38, 38, 0.2)' }}
                      onClick={() => setDeleteId(item.id)}
                      title="Delete bhajan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              }
            ]}
          />
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: 'var(--space-24)' }}>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Confirm Deletion"
        message="Are you sure you want to delete this bhajan?"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={isUnsavedConfirmOpen}
        title="Discard Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        isDestructive={true}
        onConfirm={handleDiscardChanges}
        onCancel={() => setIsUnsavedConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        title={`Delete ${selectedCount} Bhajans`}
        message={`Are you sure you want to delete ${selectedCount} selected bhajans? This action cannot be undone.`}
        isDestructive={true}
        onConfirm={handleBulkDelete}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />

      <BulkActionBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={() => setIsBulkDeleteModalOpen(true)}
      />

      {/* Modal Dialog */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: 'var(--space-16)',
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            marginBottom: 0,
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-32)',
          }}>
            {/* Modal Header */}
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)', paddingBottom: 'var(--space-16)', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {editingId ? 'Edit Bhajan' : 'Add New Bhajan'}
              </h2>
              <button
                type="button"
                className="btn btn-outline"
                style={{ border: 'none', padding: 'var(--space-8)', borderRadius: 'var(--radius-input)' }}
                onClick={handleCloseModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Title Field */}
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter bhajan title"
                  value={formData.title}
                  onChange={e => setField('title', e.target.value)}
                  required
                />
              </div>

              {/* Description Field */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter details or lyrics preview"
                  value={formData.description}
                  onChange={e => setField('description', e.target.value)}
                />
              </div>

              {/* Lyrics Field */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Lyrics (Markdown Supported)</label>
                <MarkdownEditor
                  value={formData.lyrics}
                  onChange={val => setField('lyrics', val)}
                  id={editingId || 'new'}
                  placeholder="Enter lyrics here..."
                />
              </div>

              {/* Audio Uploader Box */}
              <div className="form-group">
                <label className="form-label">Audio File (MP3)</label>
                <AudioUpload 
                  onFileSelect={() => {}} 
                  onUploadComplete={(url: string) => setField('audioUrl', url)} 
                  folder="audio" 
                  audioUrl={formData.audioUrl} 
                  onClear={() => setField('audioUrl', '')} 
                  uploadFn={(file, folder, onProgress) => storageService.uploadAudio(file, folder, onProgress)}
                />
              </div>

              {/* Thumbnail Uploader Box */}
              <div className="form-group">
                <label className="form-label">Thumbnail Cover Image</label>
                <ImageUpload 
                  onFileSelect={() => {}} 
                  onUploadComplete={(url: string) => setField('thumbnailUrl', url)} 
                  folder="thumbnails" 
                  previewUrl={formData.thumbnailUrl} 
                  onClear={() => setField('thumbnailUrl', '')} 
                  uploadFn={(file, folder, onProgress) => storageService.uploadImage(file, folder, onProgress)}
                />
              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={mutating}>
                  {mutating ? 'Saving...' : (editingId ? 'Update Bhajan' : 'Save Bhajan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
