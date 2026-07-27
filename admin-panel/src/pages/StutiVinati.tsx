import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, X, BookOpen, Archive, RefreshCw, Folder } from 'lucide-react';

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
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { Pagination } from '../components/ui/Pagination';
import { ImageUpload } from '../components/ui/ImageUpload';
import { MarkdownEditor } from '../components/ui/MarkdownEditor';
import { PrayerStatusBadge } from '../features/stuti-vinati/components/PrayerStatusBadge';
import { PrayerPreview } from '../features/stuti-vinati/components/PrayerPreview';
import { CategorySelector } from '../features/categories/components/CategorySelector';
import { buildCategoryTree, flattenTree } from '../features/categories/utils/tree';

export function StutiVinati() {
  const {
    data: items,
    loading,
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
  const [categoryId, setCategoryId] = useState('');
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
    setCategoryId('');
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
    setCategoryId(item.categoryId || '');
    setPublishStatus(item.publishStatus || 'draft');
    setFeatured(item.featured || false);
    setTagsInput(item.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      content,
      readingOrder: Number(readingOrder) || 0,
      translation,
      transliteration,
      imageUrl,
      categoryId,
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

  const columns: Column<StutiVinatiDTO>[] = [
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
          <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Category: {categoryMap.get(item.categoryId!) || 'Unknown'}
          </div>
        </div>
      )
    },
    {
      key: 'order',
      header: 'Order',
      render: (item) => <span style={{ color: 'var(--text-muted)' }}>{item.readingOrder}</span>
    },
    {
      key: 'preview',
      header: 'Content Preview',
      render: (item) => (
        <div style={{ color: 'var(--text-body)', fontSize: '0.875rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.content ? item.content.replace(/[#*`_>]/g, '') : '-'}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <PrayerStatusBadge status={item.publishStatus} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        return (
          <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'flex-end' }}>
            {item.publishStatus !== 'archived' ? (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archivePrayer(item.id, true); }} title="Archive">
                <Archive size={18} />
              </button>
            ) : (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archivePrayer(item.id, false); }} title="Restore">
                <RefreshCw size={18} />
              </button>
            )}
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit">
              <Edit2 size={18} />
            </button>
            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} title="Delete">
              <Trash2 size={18} />
            </button>
          </div>
        );
      }
    }
  ];

  const isLoading = loading || mutating || isProcessing || categoriesLoading;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--space-32)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Stuti & Vinati</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage devotional prayers, stutis, and vinatis</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Prayer
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-16)', marginBottom: 'var(--space-24)', flexWrap: 'wrap' }}>
        <SearchBar value={searchTerm} onSearch={setSearchTerm} placeholder="Search prayers..." />
        <FilterBar
          options={[
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          placeholder="All Statuses"
        />
        <select 
          className="form-select" 
          style={{ width: '200px' }}
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

      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        {isLoading && <LoadingOverlay message="Processing..." />}
        
        {items.length > 0 ? (
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
            <div style={{ padding: 'var(--space-16)', borderTop: '1px solid var(--border)' }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        ) : !loading && (
          <div style={{ padding: 'var(--space-48) 0' }}>
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
        <div className="modal-backdrop" style={{ alignItems: 'flex-start', overflowY: 'auto' }} onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="modal-content" style={{ marginTop: '5vh', marginBottom: '5vh', maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)', paddingBottom: 'var(--space-16)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <BookOpen size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {editingId ? 'Edit Prayer' : 'Add Prayer'}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-24)' }}>
                {/* Left Column - Metadata */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                  <div className="form-group">
                    <label className="form-label">Prayer Image (Optional)</label>
                    <ImageUpload 
                      folder="prayers"
                      previewUrl={imageUrl}
                      onUploadComplete={setImageUrl}
                      onClear={() => setImageUrl('')}
                      onFileSelect={() => {}}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={publishStatus} onChange={e => setPublishStatus(e.target.value as any)} disabled={isLoading}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reading Order <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={readingOrder} 
                      onChange={e => setReadingOrder(e.target.value ? Number(e.target.value) : '')} 
                      required 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <CategorySelector
                      categories={categories}
                      value={categoryId}
                      onChange={setCategoryId}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={tagsInput} 
                      onChange={e => setTagsInput(e.target.value)} 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                  <div className="form-group">
                    <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prayer Content (Markdown) <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <MarkdownEditor 
                      value={content}
                      onChange={setContent}
                      id={editingId || 'new'}
                      placeholder="Enter prayer verses here..."
                      height={300}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Translation (Optional)</label>
                    <textarea 
                      className="form-textarea" 
                      rows={3}
                      value={translation} 
                      onChange={e => setTranslation(e.target.value)} 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transliteration (Optional)</label>
                    <textarea 
                      className="form-textarea" 
                      rows={3}
                      value={transliteration} 
                      onChange={e => setTransliteration(e.target.value)} 
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)' }}>
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
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Assign Category</h2>
              <button className="btn-icon" onClick={() => setBulkCategoryConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Select Category for {selectedCount} prayers</label>
              <CategorySelector
                categories={categories}
                value={bulkCategoryId}
                onChange={setBulkCategoryId}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-24)' }}>
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
