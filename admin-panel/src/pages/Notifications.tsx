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
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { BulkActionBar } from '../components/ui/BulkActionBar';
import { Pagination } from '../components/ui/Pagination';
import { NotificationStatusBadge } from '../features/notifications/components/NotificationStatusBadge';
import { TargetScreenBadge } from '../features/notifications/components/TargetScreenBadge';

export function Notifications() {
  const {
    data: items,
    loading,
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
  const [targetScreen, setTargetScreen] = useState<TargetScreen>('Home');
  const [audience, setAudience] = useState<Audience>('all');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('immediate');
  const [scheduledFor, setScheduledFor] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setTargetScreen('Home');
    setAudience('all');
    setDeliveryType('immediate');
    setScheduledFor('');
  };

  const openEdit = (item: NotificationDTO) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setMessage(item.message || '');
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
          <div style={{ fontWeight: 600, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <Bell size={14} color="var(--primary)" />
            {item.title}
          </div>
          <div style={{ color: 'var(--text-body)', fontSize: '0.875rem', marginTop: '4px', maxWidth: '300px' }}>
            {item.message}
          </div>
        </div>
      )
    },
    {
      key: 'target',
      header: 'Target Details',
      render: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div><TargetScreenBadge screen={item.targetScreen} /></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            Audience: {item.audience}
          </div>
        </div>
      )
    },
    {
      key: 'delivery',
      header: 'Delivery',
      render: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.875rem', textTransform: 'capitalize', color: 'var(--text-heading)' }}>
            {item.deliveryType}
          </span>
          {item.deliveryType === 'scheduled' && item.scheduledFor && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(item.scheduledFor).toLocaleString()}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <NotificationStatusBadge status={item.pushStatus} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        return (
          <div style={{ display: 'flex', gap: 'var(--space-8)', justifyContent: 'flex-end' }}>
            {item.pushStatus === 'pending' && (
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); sendNotification(item.id); }} title="Send Now">
                <Send size={18} color="var(--primary)" />
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
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Push Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Broadcast updates, announcements, and deep-link alerts to app users
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Compose Notification
        </button>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-16)', marginBottom: 'var(--space-24)', flexWrap: 'wrap' }}>
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

      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
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
            <div style={{ padding: 'var(--space-16)', borderTop: '1px solid var(--border)' }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        ) : !loading && (
          <div style={{ padding: 'var(--space-48) 0' }}>
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
        <div className="modal-backdrop" style={{ alignItems: 'flex-start', overflowY: 'auto' }} onClick={() => !isLoading && setIsModalOpen(false)}>
          <div className="modal-content" style={{ marginTop: '5vh', marginBottom: '5vh', maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            {isLoading && <LoadingOverlay message="Saving..." />}
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)', paddingBottom: 'var(--space-16)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <Bell size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {editingId ? 'Edit Notification' : 'Compose Notification'}
                </h2>
              </div>
              <button className="btn-icon" onClick={() => !isLoading && setIsModalOpen(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                <div className="form-group">
                  <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. New Bhajan Available"
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    placeholder="Enter notification message for users..."
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    required
                    disabled={isLoading}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
                  <div className="form-group">
                    <label className="form-label">Target Screen</label>
                    <select className="form-select" value={targetScreen} onChange={e => setTargetScreen(e.target.value as any)} disabled={isLoading}>
                      <option value="Home">Home</option>
                      <option value="Audio">Audio</option>
                      <option value="Books">Books</option>
                      <option value="StutiVinati">Stuti & Vinati</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Audience</label>
                    <select className="form-select" value={audience} onChange={e => setAudience(e.target.value as any)} disabled={isLoading}>
                      <option value="all">All Users</option>
                      <option value="registered">Registered Only</option>
                      <option value="guests">Guests Only</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Type</label>
                  <select className="form-select" value={deliveryType} onChange={e => setDeliveryType(e.target.value as any)} disabled={isLoading}>
                    <option value="immediate">Send Immediately (On Submit)</option>
                    <option value="scheduled">Schedule for Later</option>
                  </select>
                </div>

                {deliveryType === 'scheduled' && (
                  <div className="form-group" style={{ backgroundColor: 'var(--background)', padding: 'var(--space-16)', borderRadius: 'var(--radius-input)', border: '1px solid var(--border)' }}>
                    <label className="form-label">Schedule Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input 
                      type="datetime-local" 
                      className="form-input"
                      value={scheduledFor}
                      onChange={e => setScheduledFor(e.target.value)}
                      required={deliveryType === 'scheduled'}
                      disabled={isLoading}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Notification will automatically be sent at the scheduled time.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {deliveryType === 'immediate' ? (
                    <><Send size={16} style={{ marginRight: '4px' }} /> Send Now</>
                  ) : (
                    <><CheckCircle size={16} style={{ marginRight: '4px' }} /> Schedule Notification</>
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
