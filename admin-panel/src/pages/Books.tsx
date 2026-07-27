import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, X, BookOpen, Archive, RefreshCw, Folder } from 'lucide-react';

import { useBooks } from '../features/books/hooks/useBooks';
import { useBookMutations } from '../features/books/hooks/useBookMutations';
import { useCategories } from '../features/categories/hooks/useCategories';
import { useTableSelection } from '../hooks/useTableSelection';
import { useBulkActions } from '../hooks/useBulkActions';
import type { BookDTO, PublishStatus } from '../features/books/types';

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
import { PDFUpload } from '../components/ui/PDFUpload';
import { BookStatusBadge } from '../features/books/components/BookStatusBadge';
import { BookPreview } from '../features/books/components/BookPreview';
import { PDFPreview } from '../features/books/components/PDFPreview';
import { CategorySelector } from '../features/categories/components/CategorySelector';
import { buildCategoryTree, flattenTree } from '../features/categories/utils/tree';

export function Books() {
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
  } = useBooks();

  const { createBook, updateBook, deleteBook, archiveBook, assignCategory, loading: mutating } = useBookMutations(refetch);
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
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [edition, setEdition] = useState('');
  const [pageCount, setPageCount] = useState<number | ''>('');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('draft');
  const [featured, setFeatured] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setAuthor('');
    setDescription('');
    setCategoryId('');
    setCoverImageUrl('');
    setPdfUrl('');
    setLanguage('Hindi');
    setEdition('');
    setPageCount('');
    setPublishStatus('draft');
    setFeatured(false);
    setTagsInput('');
  };

  const openEdit = (item: BookDTO) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setSubtitle(item.subtitle || '');
    setAuthor(item.author || '');
    setDescription(item.description || '');
    setCategoryId(item.categoryId || '');
    setCoverImageUrl(item.coverImageUrl || '');
    setPdfUrl(item.pdfUrl || '');
    setLanguage(item.language || 'Hindi');
    setEdition(item.edition || '');
    setPageCount(item.pageCount || '');
    setPublishStatus(item.publishStatus || 'draft');
    setFeatured(item.featured || false);
    setTagsInput(item.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      subtitle,
      author,
      description,
      categoryId,
      coverImageUrl,
      pdfUrl,
      language,
      edition,
      pageCount: pageCount === '' ? 0 : Number(pageCount),
      publishStatus,
      featured,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      downloadCount: 0,
      viewCount: 0,
    };

    let success = false;
    if (editingId) {
      success = await updateBook(editingId, payload);
    } else {
      const res = await createBook(payload);
      if (res) success = true;
    }

    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteBook(deleteId);
    setDeleteId(null);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await executeBulkAction(selectedIds, deleteBook);
    setBulkDeleteConfirm(false);
    clearSelection();
  };

  const handleBulkArchive = async () => {
    await executeBulkAction(selectedIds, (id) => archiveBook(id, true));
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

  const columns: Column<BookDTO>[] = [
    {
      key: 'cover',
      header: 'Cover',
      render: (item) => (
        <div style={{ width: '48px', height: '64px' }}>
          <BookPreview coverUrl={item.coverImageUrl} title={item.title} />
        </div>
      )
    },
    {
      key: 'details',
      header: 'Details',
      render: (item) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>{item.author}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Category: {categoryMap.get(item.categoryId) || 'Unknown'}
          </div>
        </div>
      )
    },
    {
      key: 'file',
      header: 'File',
      render: (item) => <PDFPreview pdfUrl={item.pdfUrl} title={item.title} />
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <BookStatusBadge status={item.publishStatus} />
    },
    {
      key: 'metrics',
      header: 'Metrics',
      render: (item) => (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>Downloads: {item.downloadCount || 0}</div>
          <div>Views: {item.viewCount || 0}</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        return (
          <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'flex-end' }}>
            {item.publishStatus !== 'archived' ? (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archiveBook(item.id, true); }} title="Archive">
                <Archive size={18} />
              </button>
            ) : (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archiveBook(item.id, false); }} title="Restore">
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
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Books Library</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage spiritual books, PDFs, and publications</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Book
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-16)', marginBottom: 'var(--space-24)', flexWrap: 'wrap' }}>
        <SearchBar value={searchTerm} onSearch={setSearchTerm} placeholder="Search books..." />
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
            <DataTable<BookDTO>
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
              title="No Books Found" 
              message="Get started by adding your first publication." 
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
                  {editingId ? 'Edit Book' : 'Add Book'}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-24)' }}>
                {/* Left Column - Files & Core Metadata */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Cover Image</label>
                    <ImageUpload 
                      folder="book_covers"
                      previewUrl={coverImageUrl}
                      onUploadComplete={setCoverImageUrl}
                      onClear={() => setCoverImageUrl('')}
                      onFileSelect={() => {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">PDF File</label>
                    <PDFUpload 
                      folder="book_pdfs"
                      pdfUrl={pdfUrl}
                      onUploadComplete={setPdfUrl}
                      onClear={() => setPdfUrl('')}
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
                </div>

                {/* Right Column - Text Data */}
                <div>
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
                    <label className="form-label">Subtitle</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={subtitle} 
                      onChange={e => setSubtitle(e.target.value)} 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Author <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={author} 
                      onChange={e => setAuthor(e.target.value)} 
                      required 
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <CategorySelector
                      categories={categories}
                      value={categoryId}
                      onChange={setCategoryId}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea 
                      className="form-textarea" 
                      rows={4}
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      disabled={isLoading}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
                    <div className="form-group">
                      <label className="form-label">Language</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={language} 
                        onChange={e => setLanguage(e.target.value)} 
                        disabled={isLoading}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Edition</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={edition} 
                        onChange={e => setEdition(e.target.value)} 
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
                    <div className="form-group">
                      <label className="form-label">Page Count</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={pageCount} 
                        onChange={e => setPageCount(e.target.value ? Number(e.target.value) : '')} 
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
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={featured} 
                        onChange={e => setFeatured(e.target.checked)} 
                        disabled={isLoading}
                      />
                      <span>Featured Book</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {editingId ? 'Update Book' : 'Save Book'}
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
              <label className="form-label">Select Category for {selectedCount} books</label>
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
        title="Delete Book"
        message="Are you sure you want to delete this book? The associated PDF and Cover image will also be deleted from storage."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Multiple Books"
        message={`Are you sure you want to delete ${selectedCount} selected books? All associated files will be permanently deleted from storage.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}
