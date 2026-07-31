import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, X, Tag, FolderTree, Archive, RefreshCw } from 'lucide-react';

import { useCategories } from '../features/categories/hooks/useCategories';
import { useCategoryMutations } from '../features/categories/hooks/useCategoryMutations';
import { useTableSelection } from '../hooks/useTableSelection';
import { useBulkActions } from '../hooks/useBulkActions';
import type { CategoryDTO } from '../features/categories/types';
import { buildCategoryTree, flattenTree } from '../features/categories/utils/tree';

import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { CategorySelector } from '../features/categories/components/CategorySelector';

export function Categories() {
  const {
    data: items,
    loading,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter
  } = useCategories();

  const { createCategory, updateCategory, deleteCategory, archiveCategory, loading: mutating } = useCategoryMutations(refetch);

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
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('audio');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [featured, setFeatured] = useState(false);

  // Derive flat tree for the table
  const tableData = useMemo(() => {
    const tree = buildCategoryTree(items);
    return flattenTree(tree);
  }, [items]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setType('audio');
    setParentId('');
    setSortOrder(0);
    setStatus('active');
    setFeatured(false);
  };

  const openEdit = (item: CategoryDTO) => {
    setEditingId(item.id);
    setName(item.name || '');
    setSlug(item.slug || '');
    setDescription(item.description || '');
    setType(item.type || 'audio');
    setParentId(item.parentId || '');
    setSortOrder(item.sortOrder || 0);
    setStatus(item.status || 'active');
    setFeatured(item.featured || false);
    setIsModalOpen(true);
  };

  const generateSlug = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug,
      description,
      type,
      parentId: parentId || '',
      sortOrder,
      status,
      featured
    };

    let success = false;
    if (editingId) {
      success = await updateCategory(editingId, payload);
    } else {
      const res = await createCategory(payload);
      if (res) success = true;
    }

    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteCategory(deleteId);
    setDeleteId(null);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await executeBulkAction(selectedIds, deleteCategory);
    setBulkDeleteConfirm(false);
    clearSelection();
  };
  
  const handleBulkArchive = async () => {
    await executeBulkAction(selectedIds, (id) => archiveCategory(id, true));
    clearSelection();
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Category Name',
      render: (item) => (
        <div className="flex items-center gap-2" style={{ paddingLeft: `${item.level * 24}px` }}>
          {item.level > 0 && <span className="text-muted pr-1">└─</span>}
          <Tag size={16} className={item.status === 'archived' ? 'text-muted' : 'text-primary'} />
          <span className={`font-semibold ${item.status === 'archived' ? 'text-muted' : 'text-heading'}`}>
            {item.name}
          </span>
          {item.featured && (
            <span className="badge badge-warning">Featured</span>
          )}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Applies To',
      render: (item) => <span className={`badge badge-${item.type === 'audio' ? 'primary' : item.type === 'book' ? 'success' : 'info'}`}>{item.type}</span>
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (item) => <span className="text-muted" style={{ fontFamily: 'monospace' }}>{item.slug}</span>
    },
    {
      key: 'sortOrder',
      header: 'Order',
      render: (item) => <span className="text-muted">{item.sortOrder}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex justify-end gap-2">
          {item.status === 'active' ? (
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archiveCategory(item.id, true); }} title="Archive">
              <Archive size={18} />
            </button>
          ) : (
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archiveCategory(item.id, false); }} title="Restore">
              <RefreshCw size={18} />
            </button>
          )}
          <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit">
            <Edit2 size={18} />
          </button>
          <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const isLoading = loading || mutating || isProcessing;

  return (
    <div className="pb-8 max-w-7xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title mb-1">Categories</h1>
          <p className="text-muted text-sm">
            Manage category taxonomy and content mappings
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <SearchBar value={searchTerm} onSearch={setSearchTerm} placeholder="Search categories..." />
        <FilterBar
          options={[{ label: 'Active', value: 'active' }, { label: 'Archived', value: 'archived' }]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          placeholder="All Statuses"
        />
        <FilterBar
          options={[{ label: 'Audio', value: 'audio' }, { label: 'Book', value: 'book' }, { label: 'Prayer', value: 'prayer' }]}
          value={typeFilter}
          onChange={(val) => setTypeFilter(val as any)}
          placeholder="All Types"
        />
      </div>

      <div className="card p-0 overflow-hidden relative">
        {isLoading && <LoadingOverlay message="Processing..." />}
        
        {tableData.length > 0 ? (
          <DataTable<any>
            data={tableData}
            columns={columns}
            keyExtractor={(item) => item.id}
            selectable={true}
            selectedIds={selectedIds}
            onToggleSelection={toggleSelection}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
          />
        ) : !loading && (
          <div className="py-12">
            <EmptyState 
              title="No Categories Found" 
              message="Get started by adding your first category or adjusting your filters." 
              icon={<FolderTree size={48} />}
            />
          </div>
        )}
      </div>

      <BulkActionBar 
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={() => setBulkDeleteConfirm(true)}
        onArchive={statusFilter !== 'archived' ? handleBulkArchive : undefined}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black-40 backdrop-blur flex items-center justify-center z-50 p-4" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="card w-full max-w-lg shadow-float" onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <FolderTree size={20} className="text-primary" />
                <h2 className="text-heading font-semibold text-xl m-0">
                  {editingId ? 'Edit Category' : 'Add Category'}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={e => generateSlug(e.target.value)} 
                  required 
                  disabled={isLoading}
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slug <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={slug} 
                  onChange={e => setSlug(e.target.value)} 
                  required 
                  disabled={isLoading}
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parent Category</label>
                <CategorySelector
                  categories={items}
                  value={parentId}
                  onChange={setParentId}
                  typeFilter={type}
                  excludeId={editingId || undefined}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group mb-0">
                  <label className="form-label">Applies To (Type)</label>
                  <select className="form-select" value={type} onChange={e => setType(e.target.value)} disabled={isLoading}>
                    <option value="audio">Audio</option>
                    <option value="book">Book</option>
                    <option value="prayer">Prayer</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Sort Order</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={sortOrder} 
                    onChange={e => setSortOrder(Number(e.target.value))} 
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group mb-0 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={featured} 
                    onChange={e => setFeatured(e.target.checked)} 
                    disabled={isLoading}
                  />
                  Featured Category
                </label>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
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

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone, and will fail if the category has children or content mapped to it."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Multiple Categories"
        message={`Are you sure you want to delete ${selectedCount} selected categories? This will fail for any categories that still have children or content mapped.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}
