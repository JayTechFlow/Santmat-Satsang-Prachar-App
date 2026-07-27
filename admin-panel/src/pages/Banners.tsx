import { useState } from 'react';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Archive, RefreshCw } from 'lucide-react';

import { useBanners } from '../features/banners/hooks/useBanners';
import { useBannerMutations } from '../features/banners/hooks/useBannerMutations';
import { useTableSelection } from '../hooks/useTableSelection';
import { useBulkActions } from '../hooks/useBulkActions';
import type { BannerDTO, BannerStatus } from '../features/banners/types';
import { getEffectiveStatus } from '../features/banners/services/bannerService';

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
import { BannerStatusBadge } from '../features/banners/components/BannerStatusBadge';

export function Banners() {
  const {
    data: items,
    loading,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages
  } = useBanners();

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
        <div style={{ width: '120px', height: '60px', borderRadius: 'var(--radius-input)', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
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
          <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.title}</div>
          {item.subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <BannerStatusBadge banner={item} />
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (item) => <span style={{ color: 'var(--text-muted)' }}>{item.priority}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        const effectiveStatus = getEffectiveStatus(item);
        return (
          <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'flex-end' }}>
            {effectiveStatus !== 'archived' ? (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archiveBanner(item.id, true); }} title="Archive">
                <Archive size={18} />
              </button>
            ) : (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); archiveBanner(item.id, false); }} title="Restore">
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

  const isLoading = loading || mutating || isProcessing;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--space-32)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Hero Banners</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage home app banners and promotional graphics</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Banner
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-16)', marginBottom: 'var(--space-24)' }}>
        <SearchBar value={searchTerm} onSearch={setSearchTerm} placeholder="Search banners..." />
        <FilterBar
          options={[
            { label: 'Draft', value: 'draft' },
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          placeholder="All Statuses"
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        {isLoading && <LoadingOverlay message="Processing..." />}
        
        {items.length > 0 ? (
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
            <div style={{ padding: 'var(--space-16)', borderTop: '1px solid var(--border)' }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        ) : !loading && (
          <div style={{ padding: 'var(--space-48) 0' }}>
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
        <div className="modal-backdrop" style={{ alignItems: 'flex-start', overflowY: 'auto' }} onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="modal-content" style={{ marginTop: '5vh', marginBottom: '5vh', maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)', paddingBottom: 'var(--space-16)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <ImageIcon size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {editingId ? 'Edit Banner' : 'Add Banner'}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Main Image (Desktop/Tablet) <span style={{ color: 'var(--danger)' }}>*</span></label>
                <ImageUpload 
                  folder="banners"
                  previewUrl={imageUrl}
                  onUploadComplete={setImageUrl}
                  onClear={() => setImageUrl('')}
                  onFileSelect={() => {}}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  disabled={isLoading}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value as any)} disabled={isLoading}>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled (Date-bound)</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority (Sort Order)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={priority} 
                    onChange={e => setPriority(Number(e.target.value))} 
                    disabled={isLoading}
                  />
                </div>
              </div>

              {status === 'scheduled' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)', padding: 'var(--space-16)', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-input)', marginBottom: 'var(--space-16)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Start Date & Time</label>
                    <input 
                      type="datetime-local" 
                      className="form-input" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      required={status === 'scheduled'}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">End Date & Time</label>
                    <input 
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
