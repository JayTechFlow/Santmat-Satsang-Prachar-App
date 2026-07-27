import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Trash2, Edit2, X, Bell, Send } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';

export function Notifications() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetScreen, setTargetScreen] = useState('Home');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { success, error } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'notifications'));
      setItems(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    } catch (err: any) {
      console.error(err);
      error("Error fetching notifications");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { title, message, targetScreen };
      if (editingId) {
        await updateDoc(doc(db, 'notifications', editingId), payload);
        success("Notification updated successfully!");
      } else {
        await addDoc(collection(db, 'notifications'), { ...payload, createdAt: new Date() });
        success("Notification sent successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      fetchItems();
    } catch (err: any) {
      console.error(err);
      error("Error saving doc");
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteDoc(doc(db, 'notifications', deleteId));
        success("Notification deleted successfully");
        fetchItems();
      } catch (err: any) {
      console.error(err);
        error("Error deleting doc");
      }
      setDeleteId(null);
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setMessage(item.message || '');
    setTargetScreen(item.targetScreen || 'Home');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setTargetScreen('Home');
  };

  const getScreenBadgeStyle = (screen: string) => {
    const key = (screen || '').toLowerCase();
    const badgeMap: Record<string, React.CSSProperties> = {
      home: {
        backgroundColor: '#EFF6FF',
        color: '#2563EB',
        border: '1px solid rgba(37, 99, 235, 0.25)',
      },
      audio: {
        backgroundColor: '#FFF2E8',
        color: 'var(--primary)',
        border: '1px solid rgba(232, 116, 18, 0.25)',
      },
      books: {
        backgroundColor: '#DCFCE7',
        color: 'var(--success)',
        border: '1px solid rgba(22, 163, 74, 0.25)',
      },
      stutivinati: {
        backgroundColor: '#F3E8FF',
        color: '#8B5CF6',
        border: '1px solid rgba(139, 92, 246, 0.25)',
      },
    };

    const defaultStyle: React.CSSProperties = {
      backgroundColor: 'var(--background)',
      color: 'var(--text-body)',
      border: '1px solid var(--border)',
    };

    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: 'var(50%)',
      fontSize: '0.75rem',
      fontWeight: 600,
      ...(badgeMap[key] || defaultStyle),
    };
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-32)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--space-8)' }}>Push Notifications</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Broadcast updates, announcements, and deep-link alerts to mobile app users
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Send New Notification
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {items.length === 0 ? (
          <EmptyState 
            title="No notifications sent yet" 
            message="Create your first broadcast notification for app users." 
            icon={<Bell size={48} color="var(--text-muted)" />} 
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: 'var(--space-16) var(--space-24)' }}>Title</th>
                  <th style={{ padding: 'var(--space-16) var(--space-24)' }}>Message</th>
                  <th style={{ padding: 'var(--space-16) var(--space-24)' }}>Target Screen</th>
                  <th style={{ padding: 'var(--space-16) var(--space-24)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: 'var(--space-16) var(--space-24)', fontWeight: 600, color: 'var(--text-heading)', minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                        <Bell size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>{item.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-16) var(--space-24)', color: 'var(--text-body)' }}>
                      {item.message}
                    </td>
                    <td style={{ padding: 'var(--space-16) var(--space-24)' }}>
                      <span style={getScreenBadgeStyle(item.targetScreen)}>{item.targetScreen}</span>
                    </td>
                    <td style={{ padding: 'var(--space-16) var(--space-24)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: 'var(--space-8) var(--space-8)', fontSize: '0.875rem' }}
                          onClick={() => openEdit(item)}
                          title="Edit notification"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: 'var(--space-8) var(--space-8)', fontSize: '0.875rem', color: 'var(--danger)', borderColor: 'rgba(220, 38, 38, 0.2)' }}
                          onClick={() => setDeleteId(item.id)}
                          title="Delete notification"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: 'var(--space-16)',
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '520px',
            marginBottom: 0,
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-32)',
          }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)', paddingBottom: 'var(--space-16)', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {editingId ? 'Edit Notification' : 'Send New Notification'}
              </h2>
              <button
                className="btn btn-outline"
                style={{ border: 'none', padding: 'var(--space-8)', borderRadius: 'var(--radius-input)' }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. New Bhajan Available"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter notification message for users..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Target Screen (App Link)</label>
                <select className="form-select" value={targetScreen} onChange={e => setTargetScreen(e.target.value)}>
                  <option value="Home">Home</option>
                  <option value="Audio">Audio</option>
                  <option value="Books">Books</option>
                  <option value="StutiVinati">Stuti & Vinati</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={16} />
                  {editingId ? 'Update Notification' : 'Send Notification'}
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
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
