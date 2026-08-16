import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Quote, Sparkles } from 'lucide-react';

import './Suvichar.css';

// Core & UI
import { useSuvichar } from '../features/suvichar/hooks/useSuvichar';
import { useSuvicharMutations } from '../features/suvichar/hooks/useSuvicharMutations';
import { useTableSelection } from '../hooks/useTableSelection';
import { useBulkActions } from '../hooks/useBulkActions';
import type { SuvicharDTO } from '../features/suvichar/types';

import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { ImageUpload } from '../components/ui/ImageUpload';

export function Suvichar() {
  const {
    data: items,
    loading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages
  } = useSuvichar();

  const { createSuvichar, updateSuvichar, deleteSuvichar, loading: mutating } = useSuvicharMutations(refetch);

  // Table Selection & Bulk Actions
  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection
  } = useTableSelection<string>();

  const { isProcessing, executeBulkAction } = useBulkActions();

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setImageUrl('');
  };

  const openEdit = (item: SuvicharDTO) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setContent(item.content || '');
    setImageUrl(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (editingId) {
      success = await updateSuvichar(editingId, { title, content, imageUrl });
    } else {
      const res = await createSuvichar({ title, content, imageUrl });
      if (res) success = true;
    }

    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteSuvichar(deleteId);
    setDeleteId(null);
  };

  const handleBulkDelete = async () => {
    await executeBulkAction(selectedIds, deleteSuvichar);
    setBulkDeleteConfirm(false);
    clearSelection();
  };

  const columns: Column<SuvicharDTO>[] = React.useMemo(() => [
    {
      key: 'title',
      header: 'Author / Reference',
      sortable: true,
      render: (item) => (
        <div className="svc-title-cell">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="svc-thumb"
            />
          ) : (
            <div className="svc-thumb-placeholder">
              <Sparkles size={16} />
            </div>
          )}
          <span className="svc-title-text">{item.title}</span>
        </div>
      )
    },
    {
      key: 'content',
      header: 'Content',
      render: (item) => <span className="svc-content-text">{item.content}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="svc-actions-cell">
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }} aria-label="Edit suvichar" title="Edit">
            <Edit2 size={18} />
          </button>
          <button className="btn-icon svc-danger-icon" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} aria-label="Delete suvichar" title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ], []);

  const isLoading = loading || mutating || isProcessing;

  return (
    <div className="p-6 space-y-6 font-['Mukta'] bg-[#FAF8F5] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="font-extrabold text-xl text-stone-900 leading-tight">
            आज का दैनिक सुविचार एवं संतवाणी
          </h1>
          <p className="text-xs text-stone-600 font-medium">
            प्रतिदिन के आध्यात्मिक विचार, प्रेरक वचन एवं सुविचार पोस्टरों का प्रबंधन
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C45A0A] text-white rounded-xl font-bold text-xs shadow-sm transition-all"
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          <Plus size={16} />
          <span>नया सुविचार जोड़ें</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <SearchBar
          placeholder="सुविचार शीर्षक या विचार खोजें..."
          value={searchTerm}
          onSearch={setSearchTerm}
        />
      </div>

      {/* Main Table Card */}
      <div className="card svc-card">
        {isLoading && <LoadingOverlay message="Processing..." />}

        {error && !loading ? (
          <div className="svc-state-block">
            <ErrorState
              title="Failed to Load Suvichar"
              message="An error occurred while fetching suvichar. Please try again."
              onRetry={refetch}
            />
          </div>
        ) : items.length > 0 ? (
          <>
            <DataTable<SuvicharDTO>
              data={items}
              columns={columns}
              keyExtractor={(item) => item.id}
              selectable={true}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
            />
            <div className="svc-pagination-footer">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : !loading && (
          <div className="svc-state-block">
            <EmptyState
              title="No Suvichar Found"
              message={searchTerm ? "No suvichar matches your search." : "Add the first suvichar by clicking the 'Add New' button above."}
              icon={<Quote size={48} />}
            />
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={() => setBulkDeleteConfirm(true)}
      />

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black-40 backdrop-blur flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="card w-full max-w-4xl my-8 p-8 shadow-float" onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between mb-6 pb-4 border-b">
              <div className="svc-modal-title-group">
                <Quote size={20} className="svc-accent-icon" />
                <h2 className="text-heading font-semibold text-xl m-0">
                  {editingId ? 'Edit' : 'Add'} Suvichar
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading} aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Today's Thought Image (Optional)</label>
                <ImageUpload
                  folder="suvichar"
                  previewUrl={imageUrl}
                  onUploadComplete={setImageUrl}
                  onClear={() => setImageUrl('')}
                  onFileSelect={() => {}}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="suvichar-title">Author / Reference (Title) <span className="text-danger">*</span></label>
                <input
                  id="suvichar-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Param Sant Tulsi Sahib"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="suvichar-content">Content <span className="text-danger">*</span></label>
                <textarea
                  id="suvichar-content"
                  className="form-textarea"
                  rows={5}
                  placeholder="Enter the thought or quote..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="svc-form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Suvichar"
        message="Are you sure you want to delete this suvichar? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Multiple Items"
        message={`Are you sure you want to delete ${selectedCount} selected suvichars? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}