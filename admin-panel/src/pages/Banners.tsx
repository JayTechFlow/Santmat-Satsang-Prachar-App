import { useState } from 'react';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Archive, RefreshCw } from 'lucide-react';

import { useBanners } from '../features/banners/hooks/useBanners';
import { useBannerMutations } from '../features/banners/hooks/useBannerMutations';
import { useBhajans } from '../features/bhajans/hooks/useBhajans';
import { useBooks } from '../features/books/hooks/useBooks';
import { useCategories } from '../features/categories/hooks/useCategories';
import { useTableSelection } from '../hooks/useTableSelection';
import { useBulkActions } from '../hooks/useBulkActions';
import type { BannerDTO, BannerStatus } from '../features/banners/types';
import { getEffectiveStatus } from '../features/banners/services/bannerService';

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
import { StatusBadge } from '../components/ui/Badge';
import { CategorySelector } from '../features/categories/components/CategorySelector';

export function Banners() {
  const {
    data: items,
    loading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages
  } = useBanners();

  const { data: bhajans } = useBhajans();
  const { data: books } = useBooks();
  const { data: categories } = useCategories();

  const { createBanner, updateBanner, deleteBanner, archiveBanner, loading: mutating } = useBannerMutations(refetch);

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
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [actionType, setActionType] = useState<'none' | 'link' | 'internal' | 'book' | 'bhajan' | 'category'>('none');
  const [actionTarget, setActionTarget] = useState('');
  const [priority, setPriority] = useState<number>(0);
  const [status, setStatus] = useState<BannerStatus>('draft');
  const [featured, setFeatured] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setMobileImageUrl('');
    setActionType('none');
    setActionTarget('');
    setPriority(0);
    setStatus('draft');
    setFeatured(false);
    setStartDate('');
    setEndDate('');
  };

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      // Format as YYYY-MM-DDThh:mm
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const openEdit = (item: BannerDTO) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setSubtitle(item.subtitle || '');
    setImageUrl(item.imageUrl || '');
    setMobileImageUrl(item.mobileImageUrl || '');
    setActionType(item.actionType || 'none');
    setActionTarget(item.actionTarget || '');
    setPriority(item.priority || 0);
    setStatus(item.status || 'draft');
    setFeatured(item.featured || false);
    setStartDate(formatDateForInput(item.startDate));
    setEndDate(formatDateForInput(item.endDate));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      subtitle,
      imageUrl,
      mobileImageUrl,
      actionType,
      actionTarget,
      priority,
      status,
      featured,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    let success = false;
    if (editingId) {
      success = await updateBanner(editingId, payload);
    } else {
      const res = await createBanner(payload);
      if (res) success = true;
    }

    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteBanner(deleteId);
    setDeleteId(null);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await executeBulkAction(selectedIds, deleteBanner);
    setBulkDeleteConfirm(false);
    clearSelection();
  };

  const handleBulkArchive = async () => {
    await executeBulkAction(selectedIds, (id) => archiveBanner(id, true));
    clearSelection();
  };

  const columns: Column<BannerDTO>[] = [
    {
      key: 'image',
      header: 'Banner',
      render: (item) => (
        <div className="rounded-md overflow-hidden border border-border bg-background" style={{ width: '120px', height: '60px' }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted">
              <ImageIcon size={16} />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      header: 'Details',
      render: (item) => (
        <div>
          <div className="font-semibold text-heading">{item.title}</div>
          {item.subtitle && <div className="text-xs text-muted">{item.subtitle}</div>}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={getEffectiveStatus(item)} />
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => <span className="text-muted">{item.priority}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        const effectiveStatus = getEffectiveStatus(item);
        return (
          <div className="flex gap-2 justify-end">
            {effectiveStatus !== 'archived' ? (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archiveBanner(item.id, true); }} title="Archive" aria-label="Archive banner">
                <Archive size={18} />
              </button>
            ) : (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archiveBanner(item.id, false); }} title="Restore" aria-label="Restore banner">
                <RefreshCw size={18} />
              </button>
            )}
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit" aria-label="Edit banner">
              <Edit2 size={18} />
            </button>
            <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} title="Delete" aria-label="Delete banner">
              <Trash2 size={18} />
            </button>
          </div>
        );
      }
    }
  ];

  const isLoading = loading || mutating || isProcessing;

  return (
    <div className="p-6 space-y-6 font-['Mukta'] bg-[#FAF8F5] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="font-extrabold text-xl text-stone-900 leading-tight">
            बैनर प्रबंधन (होम स्क्रीन इमेज एवं प्रचार)
          </h1>
          <p className="text-xs text-stone-600 font-medium">
            मोबाइल ऐप होम स्क्रीन के प्रमुख बैनर, आध्यात्मिक पोस्टर एवं प्रचार स्लाइडर का प्रबंधन
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 bg-[#EA580C] hover:bg-[#C45A0A] text-white rounded-xl font-bold text-xs shadow-sm transition-all"
          onClick={() => { resetForm(); setIsModalOpen(true); }}
        >
          <Plus size={16} />
          <span>नया बैनर जोड़ें</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <SearchBar value={searchTerm} onSearch={setSearchTerm} placeholder="बैनर खोजें..." />
        <FilterBar
          options={[
            { label: 'ड्राफ्ट (Draft)', value: 'draft' },
            { label: 'शेड्यूल किया गया (Scheduled)', value: 'scheduled' },
            { label: 'प्रकाशित (Published)', value: 'published' },
            { label: 'समाप्त (Expired)', value: 'expired' },
            { label: 'असंग्रहीत (Archived)', value: 'archived' }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          placeholder="सभी स्थितियाँ"
        />
      </div>

      <div className="card p-0 overflow-hidden relative">
        {isLoading && <LoadingOverlay message="Processing..." />}
        
        {error && !loading ? (
          <div className="py-12">
            <ErrorState title="Failed to load banners" message={error.message} onRetry={refetch} />
          </div>
        ) : items.length > 0 ? (
          <>
            <DataTable<BannerDTO>
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
              title="No Banners Found" 
              message="Get started by adding your first promotional banner." 
              icon={<ImageIcon size={48} />}
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
        <div className="fixed inset-0 bg-black-40 backdrop-blur flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="card w-full max-w-2xl my-8 p-8 shadow-float" onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <ImageIcon size={20} className="text-primary" />
                <h2 className="text-heading font-semibold text-xl m-0">
                  {editingId ? 'Edit Banner' : 'Add Banner'}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Main Image (Desktop/Tablet) <span className="text-danger">*</span></label>
                <ImageUpload 
                  folder="banners"
                  previewUrl={imageUrl}
                  onUploadComplete={setImageUrl}
                  onClear={() => setImageUrl('')}
                  onFileSelect={() => {}}
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label" htmlFor="banner-title">Banner Title <span className="text-danger">*</span></label>
                <input 
                  id="banner-title"
                  type="text" 
                  className="form-input" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="banner-status">Status</label>
                  <select id="banner-status" className="form-select" value={status} onChange={e => setStatus(e.target.value as any)} disabled={isLoading}>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled (Date-bound)</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="banner-priority">Priority (Sort Order)</label>
                  <input 
                    id="banner-priority"
                    type="number" 
                    className="form-input" 
                    value={priority} 
                    onChange={e => setPriority(Number(e.target.value))} 
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="banner-action-type">Action Type</label>
                  <select id="banner-action-type" className="form-select" value={actionType} onChange={e => setActionType(e.target.value as any)} disabled={isLoading}>
                    <option value="none">None</option>
                    <option value="link">External Link</option>
                    <option value="internal">Internal Route</option>
                    <option value="book">Book ID</option>
                    <option value="bhajan">Bhajan ID</option>
                    <option value="category">Category Slug</option>
                  </select>
                </div>
                {actionType !== 'none' && (
                  <div className="form-group mb-0">
                    <label className="form-label" htmlFor="banner-action-target">Action Target (URL or ID) <span className="text-danger">*</span></label>
                    {actionType === 'internal' ? (
                      <select id="banner-action-target" className="form-select" value={actionTarget} onChange={e => setActionTarget(e.target.value)} required disabled={isLoading}>
                        <option value="">Select Internal Route</option>
                        <option value="/audio">Audio (/audio)</option>
                        <option value="/stuti">Stuti Vinati (/stuti)</option>
                        <option value="/books">Books (/books)</option>
                        <option value="/satsang">Satsang (/satsang)</option>
                        <option value="/events">Events (/events)</option>
                        <option value="/donations">Donations (/donations)</option>
                      </select>
                    ) : actionType === 'category' ? (
                      <CategorySelector 
                        categories={categories}
                        value={actionTarget}
                        onChange={setActionTarget}
                        disabled={isLoading}
                      />
                    ) : actionType === 'bhajan' ? (
                      <select id="banner-action-target" className="form-select" value={actionTarget} onChange={e => setActionTarget(e.target.value)} required disabled={isLoading}>
                        <option value="">Select Bhajan</option>
                        {bhajans.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                      </select>
                    ) : actionType === 'book' ? (
                      <select id="banner-action-target" className="form-select" value={actionTarget} onChange={e => setActionTarget(e.target.value)} required disabled={isLoading}>
                        <option value="">Select Book</option>
                        {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                      </select>
                    ) : (
                      <input 
                        id="banner-action-target"
                        type="url" 
                        className="form-input" 
                        value={actionTarget} 
                        onChange={e => setActionTarget(e.target.value)} 
                        required 
                        disabled={isLoading}
                        placeholder="https://..."
                      />
                    )}
                  </div>
                )}
              </div>

              {status === 'scheduled' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-md mb-4">
                  <div className="form-group mb-0">
                    <label className="form-label" htmlFor="banner-start-date">Start Date & Time</label>
                    <input 
                      id="banner-start-date"
                      type="datetime-local" 
                      className="form-input" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      required={status === 'scheduled'}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label" htmlFor="banner-end-date">End Date & Time</label>
                    <input 
                      id="banner-end-date"
                      type="datetime-local" 
                      className="form-input" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                      required={status === 'scheduled'}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

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
        title="Delete Banner"
        message="Are you sure you want to delete this banner? Its associated images will be permanently deleted from storage."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Multiple Banners"
        message={`Are you sure you want to delete ${selectedCount} selected banners? All associated images will be permanently deleted from storage.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}
