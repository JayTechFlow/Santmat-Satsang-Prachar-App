import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Trash2, Edit2, X, Tag, FolderTree } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';

export function Categories() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { success, error } = useToast();

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('audio'); // audio, book, prayer

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      setItems(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    } catch (err: any) {
      console.error(err);
      error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { name, type };
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), payload);
        success("Category updated successfully");
      } else {
        await addDoc(collection(db, 'categories'), { ...payload, createdAt: new Date() });
        success("Category added successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchItems();
    } catch (err: any) {
      console.error(err);
      error("Error saving doc");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'categories', deleteId));
      success("Category deleted successfully");
      fetchItems();
    } catch (err: any) {
      console.error(err);
      error("Error deleting category");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name || '');
    setType(item.type || 'audio');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setType('audio');
  };

  const getTypeBadgeStyle = (itemType: string) => {
    const key = (itemType || '').toLowerCase();
    const badgeMap: Record<string, React.CSSProperties> = {
      audio: {
        backgroundColor: '#FFF2E8',
        color: 'var(--primary)',
        border: '1px solid rgba(232, 116, 18, 0.25)',
      },
      book: {
        backgroundColor: '#DCFCE7',
        color: 'var(--success)',
        border: '1px solid rgba(22, 163, 74, 0.25)',
      },
      prayer: {
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
      textTransform: 'capitalize' as const,
      ...(badgeMap[key] || defaultStyle),
    };
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-32)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--space-8)' }}>Categories</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage category taxonomy and content mappings across the platform
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: '200px' }}>
        {loading && <LoadingOverlay />}
        
        {!loading && items.length === 0 ? (
          <EmptyState 
            icon={<FolderTree size={48} color="var(--text-muted)" />} 
            title="No categories found" 
            message="Get started by adding your first category." 
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: 'var(--space-16) var(--space-24)' }}>Category Name</th>
                  <th style={{ padding: 'var(--space-16) var(--space-24)' }}>Applies To (Type)</th>
                  <th style={{ padding: 'var(--space-16) var(--space-24)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: 'var(--space-16) var(--space-24)', fontWeight: 600, color: 'var(--text-heading)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                        <Tag size={16} style={{ color: 'var(--primary)' }} />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-16) var(--space-24)' }}>
                      <span style={getTypeBadgeStyle(item.type)}>{item.type}</span>
                    </td>
                    <td style={{ padding: 'var(--space-16) var(--space-24)', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: 'var(--space-8) var(--space-8)', fontSize: '0.875rem' }}
                          onClick={() => openEdit(item)}
                          title="Edit category"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: 'var(--space-8) var(--space-8)', fontSize: '0.875rem', color: 'var(--danger)', borderColor: 'rgba(220, 38, 38, 0.2)' }}
                          onClick={() => setDeleteId(item.id)}
                          title="Delete category"
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
            maxWidth: '480px',
            marginBottom: 0,
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-32)',
          }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)', paddingBottom: 'var(--space-16)', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {editingId ? 'Edit Category' : 'Add New Category'}
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
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Satsang, Bhajan, Pravachan"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Applies To (Type)</label>
                <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="audio">Audio</option>
                  <option value="book">Book</option>
                  <option value="prayer">Prayer</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)', paddingTop: 'var(--space-16)', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!deleteId} 
        title="Delete Category" 
        message="Are you sure you want to delete this category? This action cannot be undone." 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteId(null)} 
      />
    </div>
  );
}
