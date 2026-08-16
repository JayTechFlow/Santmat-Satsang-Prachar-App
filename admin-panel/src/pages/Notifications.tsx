import { useState } from 'react';
import { Plus, Trash2, Edit2, X, Bell, Send, CheckCircle } from 'lucide-react';

import { useNotifications } from '../features/notifications/hooks/useNotifications';
import { useNotificationMutations } from '../features/notifications/hooks/useNotificationMutations';
import { useTableSelection } from '../hooks/useTableSelection';
import { useBulkActions } from '../hooks/useBulkActions';
import type { NotificationDTO, Audience, DeliveryType, PushStatus, TargetScreen } from '../features/notifications/types';

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
import { Badge, StatusBadge } from '../components/ui/Badge';

const targetScreenVariant: Record<TargetScreen, 'primary' | 'info' | 'success' | 'neutral'> = {
  Home: 'info',
  Audio: 'primary',
  Books: 'success',
  StutiVinati: 'info',
};

export function Notifications() {
  const {
    data: items,
    loading,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    targetScreenFilter,
    setTargetScreenFilter,
    currentPage,
    setCurrentPage,
    totalPages
  } = useNotifications();

  const { createNotification, updateNotification, deleteNotification, sendNotification, loading: mutating } = useNotificationMutations(refetch);

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

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'Updates' | 'विशेष'>('Updates');
  const [targetScreen, setTargetScreen] = useState<TargetScreen>('Home');
  const [audience, setAudience] = useState<Audience>('all');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('immediate');
  const [scheduledFor, setScheduledFor] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setCategory('Updates');
    setTargetScreen('Home');
    setAudience('all');
    setDeliveryType('immediate');
    setScheduledFor('');
  };

  const openEdit = (item: NotificationDTO) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setMessage(item.message || '');
    setCategory(item.category || 'Updates');
    setTargetScreen(item.targetScreen || 'Home');
    setAudience(item.audience || 'all');
    setDeliveryType(item.deliveryType || 'immediate');
    
    // Formatting ISO to local datetime-local string format
    let localScheduled = '';
    if (item.scheduledFor) {
      try {
        const d = new Date(item.scheduledFor);
        localScheduled = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      } catch {
        // ignore
      }
    }
    setScheduledFor(localScheduled);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      message,
      category,
      targetScreen,
      audience,
      deliveryType,
      scheduledFor: deliveryType === 'scheduled' && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      pushStatus: 'pending' as PushStatus,
    };

    let success = false;
    if (editingId) {
      // Don't overwrite status unless it's a resend or draft edit logic
      const { pushStatus: _pushStatus, ...updatePayload } = payload;
      success = await updateNotification(editingId, updatePayload);
    } else {
      const res = await createNotification(payload);
      if (res) success = true;
    }

    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteNotification(deleteId);
    setDeleteId(null);
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await executeBulkAction(selectedIds, deleteNotification);
    setBulkDeleteConfirm(false);
    clearSelection();
  };

  const handleBulkSend = async () => {
    await executeBulkAction(selectedIds, sendNotification);
    clearSelection();
  };

  const columns: Column<NotificationDTO>[] = [
    {
      key: 'content',
      header: 'Notification Content',
      render: (item) => (
        <div>
          <div className="font-semibold text-heading flex items-center gap-2">
            <Bell size={14} className="text-primary" />
            {item.title}
          </div>
          <div className="text-sm text-body mt-1 max-w-xs">
            {item.message}
          </div>
        </div>
      )
    },
    {
      key: 'target',
      header: 'Target Details',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div><Badge variant={targetScreenVariant[item.targetScreen] || 'neutral'}>{item.targetScreen}</Badge></div>
          <div className="text-xs text-muted capitalize">
            Category: {item.category || 'Updates'}
          </div>
          <div className="text-xs text-muted capitalize">
            Audience: {item.audience}
          </div>
        </div>
      )
    },
    {
      key: 'delivery',
      header: 'Delivery',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm capitalize text-heading">
            {item.deliveryType}
          </span>
          {item.deliveryType === 'scheduled' && item.scheduledFor && (
            <span className="text-xs text-muted">
              {new Date(item.scheduledFor).toLocaleString()}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.pushStatus} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        return (
          <div className="flex gap-2 justify-end">
            {item.pushStatus === 'pending' && (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); sendNotification(item.id); }} title="Send Now" aria-label="Send notification">
                <Send size={18} className="text-primary" />
              </button>
            )}
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Edit" aria-label="Edit notification">
              <Edit2 size={18} />
            </button>
            <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }} title="Delete" aria-label="Delete notification">
              <Trash2 size={18} />
            </button>
          </div>
        );
      }
    }
  ];

  const isLoading = loading || mutating || isProcessing;

  return (
    <div className="pb-8 max-w-7xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title mb-1">Push Notifications</h1>
          <p className="text-muted text-sm">
            Broadcast updates, announcements, and deep-link alerts to app users
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Compose Notification
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <SearchBar value={searchTerm} onSearch={setSearchTerm} placeholder="Search titles..." />
        <FilterBar
          options={[
            { label: 'Pending', value: 'pending' },
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
          placeholder="All Statuses"
        />
        <FilterBar
          options={[
            { label: 'Home', value: 'Home' },
            { label: 'Audio', value: 'Audio' },
            { label: 'Books', value: 'Books' },
            { label: 'Stuti & Vinati', value: 'StutiVinati' }
          ]}
          value={targetScreenFilter}
          onChange={(val) => setTargetScreenFilter(val as any)}
          placeholder="All Screens"
        />
      </div>

      <div className="card p-0 overflow-hidden relative">
        {isLoading && <LoadingOverlay message="Processing..." />}
        
        {items.length > 0 ? (
          <>
            <DataTable<NotificationDTO>
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
        ) : !loading && error ? (
          <div className="py-12">
            <ErrorState title="Failed to load notifications" message={error.message} onRetry={refetch} />
          </div>
        ) : !loading && (
          <div className="py-12">
            <EmptyState 
              title="No Notifications Found" 
              message="Create your first broadcast notification for app users." 
              icon={<Bell size={48} />}
            />
          </div>
        )}
      </div>

      <BulkActionBar 
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDelete={() => setBulkDeleteConfirm(true)}
        customActions={[
          {
            label: 'Send Now',
            icon: <Send size={16} />,
            onClick: handleBulkSend
          }
        ]}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black-40 backdrop-blur flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="card w-full max-w-xl my-8 p-8 shadow-float" onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                <h2 className="text-heading font-semibold text-xl m-0">
                  {editingId ? 'Edit Notification' : 'Compose Notification'}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="notification-title">Title <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className="form-input" 
                    id="notification-title"
                    placeholder="e.g. New Bhajan Available"
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="notification-message">Message <span className="text-danger">*</span></label>
                  <textarea 
                    className="form-textarea" 
                    id="notification-message"
                    rows={3}
                    placeholder="Enter notification message for users..."
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="notification-category">Category</label>
                  <select className="form-select" id="notification-category" value={category} onChange={e => setCategory(e.target.value as any)} disabled={isLoading}>
                    <option value="Updates">Updates</option>
                    <option value="विशेष">विशेष</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label" htmlFor="notification-target-screen">Target Screen</label>
                    <select className="form-select" id="notification-target-screen" value={targetScreen} onChange={e => setTargetScreen(e.target.value as any)} disabled={isLoading}>
                      <option value="Home">Home</option>
                      <option value="Audio">Audio</option>
                      <option value="Books">Books</option>
                      <option value="StutiVinati">Stuti & Vinati</option>
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label" htmlFor="notification-audience">Audience</label>
                    <select className="form-select" id="notification-audience" value={audience} onChange={e => setAudience(e.target.value as any)} disabled={isLoading}>
                      <option value="all">All Users</option>
                      <option value="registered">Registered Only</option>
                      <option value="guests">Guests Only</option>
                    </select>
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="notification-delivery-type">Delivery Type</label>
                  <select className="form-select" id="notification-delivery-type" value={deliveryType} onChange={e => setDeliveryType(e.target.value as any)} disabled={isLoading}>
                    <option value="immediate">Send Immediately (On Submit)</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>

                {deliveryType === 'scheduled' && (
                  <div className="form-group mb-0 bg-background p-4 rounded-md border border-border">
                    <label className="form-label" htmlFor="notification-schedule-time">Schedule Time <span className="text-danger">*</span></label>
                    <input 
                      type="datetime-local" 
                      className="form-input"
                      id="notification-schedule-time"
                      value={scheduledFor}
                      onChange={e => setScheduledFor(e.target.value)}
                      required={deliveryType === 'scheduled'}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted mt-1">
                      Notification will automatically be sent at the scheduled time.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {deliveryType === 'immediate' ? (
                    <><Send size={16} className="mr-1" /> Send Now</>
                  ) : (
                    <><CheckCircle size={16} className="mr-1" /> Schedule Notification</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Multiple Notifications"
        message={`Are you sure you want to delete ${selectedCount} selected notifications? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}
