import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Trash2, Edit2, X, BookOpen } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ImageUpload } from '../components/ui/ImageUpload';

export function StutiVinati() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { success, error } = useToast();
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'stuti_vinati'));
      setItems(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    } catch (err: any) {
      console.error(err);
      console.error(err);
      error("Failed to fetch prayers");
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
      setUploading(true);

      if (editingId) {
        await updateDoc(doc(db, 'stuti_vinati', editingId), { title, content, imageUrl });
        success("Prayer updated successfully!");
      } else {
        await addDoc(collection(db, 'stuti_vinati'), { title, content, imageUrl, createdAt: new Date() });
        success("Prayer saved successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      fetchItems();
    } catch (err: any) {
      console.error(err);
      console.error(err);
      error("Error saving doc");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'stuti_vinati', deleteId));
      success("Prayer deleted successfully!");
      fetchItems();
    } catch (err: any) {
      console.error(err);
      console.error(err);
      error("Failed to delete prayer");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setContent(item.content || '');
    setImageUrl(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setImageUrl('');
  };

  return (
    <div>
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-32)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--space-8)' }}>Stuti & Vinati</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage devotional prayers, stutis, and vinatis collection
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Prayer
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ position: 'relative', minHeight: '300px' }}>
        <div className="flex-between" style={{ marginBottom: 'var(--space-24)' }}>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--text-heading)' }}>
            All Prayers <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>({items.length})</span>
          </h3>
        </div>

        {loading && <LoadingOverlay message="Loading prayers..." />}

        {!loading && items.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={48} color="var(--text-muted)" />}
            title="No Stuti & Vinati records found."
            message="Get started by adding your first devotional prayer."
            action={
              <button 
                className="btn btn-outline" 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
              >
                <Plus size={16} /> Add your first prayer
              </button>
            }
          />
        ) : (
          !loading && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Image</th>
                    <th style={{ width: '25%' }}>Title</th>
                    <th>Content Preview</th>
                    <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="image-preview" 
                            style={{ width: '52px', height: '52px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ 
                            width: '52px', 
                            height: '52px', 
                            borderRadius: 'var(--radius-input)', 
                            backgroundColor: '#FFF2E8', 
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border)'
                          }}>
                            <BookOpen size={22} />
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                          {item.title}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-body)', fontSize: '0.925rem' }}>
                          {item.content ? (
                            item.content.length > 70 ? `${item.content.substring(0, 70)}...` : item.content
                          ) : '-'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
                          <button className="btn-icon" onClick={() => openEdit(item)} title="Edit">
                            <Edit2 size={18} />
                          </button>
                          <button className="btn-icon danger" onClick={() => setDeleteId(item.id)} title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {editingId ? 'Edit Prayer' : 'Add New Prayer'}
              </h2>
              <button type="button" className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter prayer title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea 
                  className="form-textarea" 
                  rows={5} 
                  placeholder="Enter prayer text or stuti verses..." 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Prayer Image (Optional)</label>
                <ImageUpload
                  onFileSelect={() => {}}
                  onUploadComplete={(url: string) => setImageUrl(url)}
                  previewUrl={imageUrl}
                  onClear={() => setImageUrl('')}
                  folder="prayers"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Saving...' : (editingId ? 'Update Prayer' : 'Save Prayer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Prayer"
        message="Are you sure you want to delete this prayer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
