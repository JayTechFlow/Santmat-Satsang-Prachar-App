import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, X, BookOpen, Archive, RefreshCw, Folder } from 'lucide-react';
import './StutiVinati.css';

import { useStutiVinati } from '../features/stuti-vinati/hooks/useStutiVinati';
import { useStutiVinatiMutations } from '../features/stuti-vinati/hooks/useStutiVinatiMutations';
import { useCategories } from '../features/categories/hooks/useCategories';
import { useTableSelection } from '../hooks/useTableSelection';
import { useBulkActions } from '../hooks/useBulkActions';
import type { StutiVinatiDTO, PublishStatus } from '../features/stuti-vinati/types';

import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { Pagination } from '../components/ui/Pagination';
import { ImageUpload } from '../components/ui/ImageUpload';
import { AudioUpload } from '../components/ui/AudioUpload';
import { MarkdownEditor } from '../components/ui/MarkdownEditor';
import { StatusBadge } from '../components/ui/Badge';
import { PrayerPreview } from '../features/stuti-vinati/components/PrayerPreview';
import { CategorySelector } from '../features/categories/components/CategorySelector';
import { buildCategoryTree, flattenTree } from '../features/categories/utils/tree';

export function StutiVinati() {
  const {
    data: items,
    loading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    currentPage,
    setCurrentPage,
    totalPages
  } = useStutiVinati();

  const { createPrayer, updatePrayer, deletePrayer, archivePrayer, assignCategory, loading: mutating } = useStutiVinatiMutations(refetch);
  const { data: categories, loading: categoriesLoading } = useCategories();

  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    clearSelection
  } = useTableSelection<string>();

  const { isProcessing, executeBulkAction } = useBulkActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Bulk actions states
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkCategoryConfirm, setBulkCategoryConfirm] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [readingOrder, setReadingOrder] = useState<number | ''>('');
  const [translation, setTranslation] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('morning');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('draft');
  const [featured, setFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setReadingOrder('');
    setTranslation('');
    setTransliteration('');
    setImageUrl('');
    setAudioUrl('');
    setCategoryId('');
    setType('morning');
    setPublishStatus('draft');
    setFeatured(false);
    setTagsInput('');
  };

  const openEdit = (item: StutiVinatiDTO) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setContent(item.content || '');
    setReadingOrder(item.readingOrder ?? '');
    setTranslation(item.translation || '');
    setTransliteration(item.transliteration || '');
    setImageUrl(item.imageUrl || '');
    setAudioUrl(item.audioUrl || '');
    setCategoryId(item.categoryId || '');
    setType(item.type || 'morning');
    setPublishStatus(item.publishStatus || 'draft');
    setFeatured(item.featured || false);
    setTagsInput(item.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin Validation: Enforce Exactly ONE Morning, ONE Evening
    const hasDuplicate = items.some(item => item.type === type && item.id !== editingId);
    if (hasDuplicate) {
      alert(`A ${type} stuti already exists. You can only have one ${type} stuti.`);
      return;
    }

    const payload = {
      title,
      content,
      readingOrder: Number(readingOrder) || 0,
      translation,
      transliteration,
      imageUrl,
      audioUrl,
      categoryId,
      type,
      publishStatus,
      featured,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    };

    let success = false;
    if (editingId) {
      success = await updatePrayer(editingId, payload);
    } else {
      const res = await createPrayer(payload);
      if (res) success = true;
    }

    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deletePrayer(deleteId);
    setDeleteId(null);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await executeBulkAction(selectedIds, deletePrayer);
    setBulkDeleteConfirm(false);
    clearSelection();
  };

  const handleBulkArchive = async () => {
    await executeBulkAction(selectedIds, (id) => archivePrayer(id, true));
    clearSelection();
  };

  const handleBulkCategoryAssign = async () => {
    if (!bulkCategoryId) return;
    await executeBulkAction(selectedIds, (id) => assignCategory(id, bulkCategoryId));
    setBulkCategoryConfirm(false);
    setBulkCategoryId('');
    clearSelection();
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const flatCategories = useMemo(() => {
    const tree = buildCategoryTree(categories);
    return flattenTree(tree);
  }, [categories]);

  const columns: Column<StutiVinatiDTO>[] = useMemo(() => [
    {
      key: 'image',
      header: 'Image',
      render: (item) => (
        <PrayerPreview imageUrl={item.imageUrl} title={item.title} size={48} />
      )
    },
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <div>
          <div className="font-semibold text-heading">{item.title}</div>
          <div className="text-xs text-muted">
            Category: {categoryMap.get(item.categoryId!) || 'Unknown'}
          </div>
        </div>
      )
    },
    {
      key: 'order',
      header: 'Order',
      render: (item) => <span className="text-muted">{item.readingOrder}</span>
    },
    {
      key: 'preview',
      header: 'Content Preview',
      render: (item) => (
        <div className="stv-content-preview">
          {item.content ? item.content.replace(/[#*`_>]/g, '') : '-'}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.publishStatus} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        return (
          <div className="stv-actions">
            {item.publishStatus !== 'archived' ? (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archivePrayer(item.id, true); }} title="Archive" aria-label="Archive prayer">
                <Archive size={18} />
              </button>
            ) : (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archivePrayer(item.id, false); }} title="Restore" aria-label="Restore prayer">
                <RefreshCw size={18} />
              </button>
            )}
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit" aria-label="Edit prayer">
              <Edit2 size={18} />
            </button>
            <button className="btn-icon stv-icon-danger" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} title="Delete" aria-label="Delete prayer">
              <Trash2 size={18} />
            </button>
          </div>
        );
      }
    }
  ], [categoryMap, archivePrayer]);

  const isLoading = loading || mutating || isProcessing || categoriesLoading;

  return (
    <div className="stv-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stuti & Vinati</h1>
          <p className="text-muted text-sm">Manage devotional prayers, stutis, and vinatis</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Prayer
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <SearchBar value={searchTerm} onSearch={setSearchTerm} placeholder="Search prayers..." />
        <FilterBar
          label="Filter by status"
          options={[
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          placeholder="All Statuses"
        />
        <div className="stv-category-filter">
          <label htmlFor="stv-category-filter" className="visually-hidden">Filter by category</label>
          <select 
            id="stv-category-filter"
            className="form-select" 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {flatCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {'\u00A0'.repeat(cat.level * 4)}{cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden relative">
        {isLoading && <LoadingOverlay message="Processing..." />}
        
        {error ? (
          <div className="py-12">
            <ErrorState 
              title="Failed to Load Prayers" 
              message={error.message || 'An error occurred while loading prayers. Please try again.'} 
              onRetry={refetch}
            />
          </div>
        ) : items.length > 0 ? (
          <>
            <DataTable<StutiVinatiDTO>
              data={items}
              columns={columns}
              keyExtractor={(item) => item.id}
              selectable={true}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
            />
            <div className="p-4 border-t">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        ) : !loading && (
          <div className="py-12">
            <EmptyState 
              title="No Prayers Found" 
              message="Get started by adding your first devotional prayer." 
              icon={<BookOpen size={48} />}
            />
          </div>
        )}
      </div>

      <BulkActionBar 
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={() => setBulkDeleteConfirm(true)}
        onArchive={statusFilter !== 'archived' ? handleBulkArchive : undefined}
        customActions={[
          {
            label: 'Assign Category',
            icon: <Folder size={16} />,
            onClick: () => setBulkCategoryConfirm(true)
          }
        ]}
      />

      {isModalOpen && (
        <div className="stv-modal-backdrop" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="modal-content stv-modal-content" onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <BookOpen size={20} color="var(--primary)" />
                <h2 className="stv-modal-title">
                  {editingId ? 'Edit Prayer' : 'Add Prayer'}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-[1fr_2fr] gap-6">
                {/* Left Column - Metadata */}
                <div className="flex flex-col gap-4">
                  <div className="form-group">
                    <span className="form-label">Prayer Image (Thumbnail)</span>
                    <ImageUpload 
                      folder="prayers"
                      previewUrl={imageUrl}
                      onUploadComplete={setImageUrl}
                      onClear={() => setImageUrl('')}
                      onFileSelect={() => {}}
                    />
                  </div>

                  <div className="form-group">
                    <span className="form-label">Audio File (Required for Morning/Evening Cards)</span>
                    <AudioUpload 
                      folder="audio/prayers"
                      audioUrl={audioUrl}
                      onUploadComplete={setAudioUrl}
                      onClear={() => setAudioUrl('')}
                      onFileSelect={() => {}}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="stv-type">Type</label>
                    <select id="stv-type" className="form-select" value={type} onChange={e => setType(e.target.value)} disabled={isLoading}>
                      <option value="morning">Morning Stuti (☀️ प्रातःकालीन)</option>
                      <option value="evening">Evening Stuti (🌙 संध्याकालीन)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="stv-status">Status</label>
                    <select id="stv-status" className="form-select" value={publishStatus} onChange={e => setPublishStatus(e.target.value as any)} disabled={isLoading}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="stv-reading-order">Reading Order <span className="text-danger">*</span></label>
                    <input 
                      id="stv-reading-order"
                      type="number" 
                      className="form-input" 
                      value={readingOrder} 
                      onChange={e => setReadingOrder(e.target.value ? Number(e.target.value) : '')} 
                      required 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <span className="form-label">Category</span>
                    <CategorySelector
                      categories={categories}
                      value={categoryId}
                      onChange={setCategoryId}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="stv-tags">Tags (comma separated)</label>
                    <input 
                      id="stv-tags"
                      type="text" 
                      className="form-input" 
                      value={tagsInput} 
                      onChange={e => setTagsInput(e.target.value)} 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="stv-checkbox-label" htmlFor="stv-featured">
                      <input 
                        id="stv-featured"
                        type="checkbox" 
                        checked={featured} 
                        onChange={e => setFeatured(e.target.checked)} 
                        disabled={isLoading}
                      />
                      <span>Featured Prayer</span>
                    </label>
                  </div>
                </div>

                {/* Right Column - Text Data */}
                <div className="flex flex-col gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="stv-title">Title <span className="text-danger">*</span></label>
                    <input 
                      id="stv-title"
                      type="text" 
                      className="form-input" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <span className="form-label">Prayer Content (Markdown) <span className="text-danger">*</span></span>
                    <MarkdownEditor 
                      value={content}
                      onChange={setContent}
                      id={editingId || 'new'}
                      placeholder="Enter prayer verses here..."
                      height={300}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="stv-translation">Translation (Optional)</label>
                    <textarea 
                      id="stv-translation"
                      className="form-textarea" 
                      rows={3}
                      value={translation} 
                      onChange={e => setTranslation(e.target.value)} 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="stv-transliteration">Transliteration (Optional)</label>
                    <textarea 
                      id="stv-transliteration"
                      className="form-textarea" 
                      rows={3}
                      value={transliteration} 
                      onChange={e => setTransliteration(e.target.value)} 
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="stv-form-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {editingId ? 'Update Prayer' : 'Save Prayer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Category Modal */}
      {bulkCategoryConfirm && (
        <div className="stv-modal-backdrop">
          <div className="modal-content stv-modal-content stv-modal-content-sm">
            <div className="flex-between mb-6">
              <h2 className="stv-modal-title">Assign Category</h2>
              <button className="btn-icon" onClick={() => setBulkCategoryConfirm(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <span className="form-label">Select Category for {selectedCount} prayers</span>
              <CategorySelector
                categories={categories}
                value={bulkCategoryId}
                onChange={setBulkCategoryId}
              />
            </div>
            <div className="stv-modal-actions">
              <button className="btn btn-outline" onClick={() => setBulkCategoryConfirm(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleBulkCategoryAssign}
                disabled={!bulkCategoryId || isProcessing}
              >
                Apply Category
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Prayer"
        message="Are you sure you want to delete this prayer? The associated image will also be deleted from storage."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Multiple Prayers"
        message={`Are you sure you want to delete ${selectedCount} selected prayers? All associated files will be permanently deleted from storage.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}