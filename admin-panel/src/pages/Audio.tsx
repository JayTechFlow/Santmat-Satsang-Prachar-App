import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Music, FileAudio } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { AudioUpload } from '../components/ui/AudioUpload';
import { ImageUpload } from '../components/ui/ImageUpload';
import { useBhajans } from '../features/bhajans/hooks/useBhajans';
import { useBhajanMutations } from '../features/bhajans/hooks/useBhajanMutations';
import { useBhajanForm } from '../features/bhajans/hooks/useBhajanForm';
import { useStorage } from '../hooks/useStorage';
import { Pagination } from '../components/ui/Pagination';
import { MarkdownEditor } from '../components/ui/MarkdownEditor';
import { DataTable } from '../components/ui/DataTable';
import { useTableSelection } from '../hooks/useTableSelection';
import { BulkActionBar } from '../components/ui/BulkActionBar';

export function Audio() {
  const { data: items, loading: fetching, error: fetchError, refetch, currentPage, totalPages, goToPage } = useBhajans();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { error, success } = useToast();

  const { selectedIds, selectedCount, toggleSelection, selectAll, clearSelection } = useTableSelection<string>();
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isUnsavedConfirmOpen, setIsUnsavedConfirmOpen] = useState(false);

  const { createBhajan, updateBhajan, deleteBhajan, bulkDeleteBhajans, loading: mutating } = useBhajanMutations(() => {
    setIsModalOpen(false);
    setDeleteId(null);
    resetForm();
    refetch();
  });

  const { uploadAudio, uploadImage } = useStorage();

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
    const count = selectedIds.length;
    const successResult = await bulkDeleteBhajans(selectedIds);

    setIsBulkDeleteModalOpen(false);
    clearSelection();
    refetch();

    if (successResult) {
      success(`Successfully deleted ${count} bhajans.`);
    } else {
      error(`Failed to delete selected bhajans.`);
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
      <div className="page-header">
        <div>
          <h1 className="page-title mb-2">Bhajan & Audio Management</h1>
          <p className="text-muted text-sm">
            Upload, organize, and manage spiritual audio tracks and bhajans
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Bhajan
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card p-0 overflow-hidden relative">
        {isLoading ? (
          <LoadingOverlay message="Loading..." />
        ) : fetchError ? (
          <div className="py-12">
            <ErrorState title="Failed to load audio tracks" message={fetchError.message} onRetry={refetch} />
          </div>
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
                    className="w-13 h-13 object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-13 h-13 bg-background rounded-md border flex items-center justify-center">
                    <Music size={22} className="text-primary" />
                  </div>
                )
              },
              {
                key: 'title',
                header: 'Title',
                sortable: true,
                render: (item) => (
                  <div className="font-semibold text-heading">
                    <div>{item.title}</div>
                    {item.audioUrl && (
                      <div className="text-xs text-muted font-normal mt-1 flex items-center gap-1">
                        <FileAudio size={12} className="text-primary" /> Audio attached
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'description',
                header: 'Description',
                render: (item) => (
                  <div className="text-body text-sm max-w-xs">
                    {item.description || <span className="text-muted italic">No description</span>}
                  </div>
                )
              },
              {
                key: 'actions',
                header: 'Actions',
                render: (item) => (
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn-icon"
                      onClick={() => openEdit(item)}
                      title="Edit bhajan"
                      aria-label="Edit bhajan"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => setDeleteId(item.id)}
                      title="Delete bhajan"
                      aria-label="Delete bhajan"
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
        <div className="mt-6">
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
        <div className="fixed inset-0 bg-black-40 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-xl max-h-90vh overflow-y-auto mb-0 p-8 shadow-float">
            {/* Modal Header */}
            <div className="flex-between mb-6 pb-4 border-b">
              <h2 className="text-heading font-semibold text-2xl">
                {editingId ? 'Edit Bhajan' : 'Add New Bhajan'}
              </h2>
              <button
                type="button"
                className="btn-icon"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Title Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="bhajan-title">Title</label>
                <input
                  type="text"
                  id="bhajan-title"
                  className="form-input"
                  placeholder="Enter bhajan title"
                  value={formData.title}
                  onChange={e => setField('title', e.target.value)}
                  required
                />
              </div>

              {/* Description Field */}
              <div className="form-group">
                <label className="form-label" htmlFor="bhajan-description">Description</label>
                <textarea
                  id="bhajan-description"
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter details or lyrics preview"
                  value={formData.description}
                  onChange={e => setField('description', e.target.value)}
                />
              </div>

              {/* Lyrics Field */}
              <div className="form-group">
                <span className="form-label">Lyrics (Markdown Supported)</span>
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
                  uploadFn={(file, folder, onProgress) => uploadAudio(file, folder, onProgress)}
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
                  uploadFn={(file, folder, onProgress) => uploadImage(file, folder, onProgress)}
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
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
