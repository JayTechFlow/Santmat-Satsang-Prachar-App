import { useState } from 'react';
import { Plus, Trash2, Edit2, X, Quote, Sparkles } from 'lucide-react';

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
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { BulkActionBar } from '../components/ui/BulkActionBar';

export function Suvichar() {
  const { 
    data: items, 
    loading, 
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

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const openEdit = (item: SuvicharDTO) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setContent(item.content || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (editingId) {
      success = await updateSuvichar(editingId, { title, content });
    } else {
      const res = await createSuvichar({ title, content });
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

  const columns: Column<SuvicharDTO>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: 'var(--radius-input)', 
            backgroundColor: '#FFF2E8', 
            color: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={16} />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.title}</span>
        </div>
      )
    },
    {
      key: 'content',
      header: 'Content',
      render: (item) => <span style={{ color: 'var(--text-body)', lineHeight: 1.6 }}>{item.content}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'flex-end' }}>
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit">
            <Edit2 size={18} />
          </button>
          <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const isLoading = loading || mutating || isProcessing;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      {/* Header Section */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-32)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Today's Suvichar</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage daily spiritual thoughts and inspirational quotes
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          <Plus size={18} /> Add New
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-24)' }}>
        <SearchBar 
          placeholder="Search suvichar by title..."
          value={searchTerm}
          onSearch={setSearchTerm}
        />
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        {isLoading && <LoadingOverlay message="Processing..." />}
        
        {items.length > 0 ? (
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
            <div style={{ padding: 'var(--space-16)', borderTop: '1px solid var(--border)' }}>
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </>
        ) : !loading && (
          <div style={{ padding: 'var(--space-48) 0' }}>
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
        <div className="modal-backdrop" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)', paddingBottom: 'var(--space-16)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <Quote size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {editingId ? 'Edit' : 'Add'} Suvichar
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Suvichar of the Day"
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  disabled={isLoading}
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content <span style={{ color: 'var(--danger)' }}>*</span></label>
                <textarea 
                  className="form-textarea" 
                  rows={5} 
                  placeholder="Enter the thought or quote..."
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  required 
                  disabled={isLoading}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)' }}>
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
