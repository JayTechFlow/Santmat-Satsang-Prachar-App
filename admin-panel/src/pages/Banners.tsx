import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Trash2, Edit2, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { ImageUpload } from '../components/ui/ImageUpload';

export function Banners() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const { success, error } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'banners'));
      setItems(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    } catch (err: any) {
      console.error(err);
      error("Error fetching banners");
      console.error(err);
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
    if (!imageUrl) {
      error("Please upload an image for the banner");
      return;
    }
    
    try {
      setUploading(true);
      if (editingId) {
        await updateDoc(doc(db, 'banners', editingId), { title, imageUrl });
        success("Banner updated successfully");
      } else {
        await addDoc(collection(db, 'banners'), { title, imageUrl, createdAt: new Date() });
        success("Banner added successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchItems();
    } catch (err: any) {
      console.error(err);
      error("Error saving banner");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'banners', deleteId));
      success("Banner deleted successfully");
      fetchItems();
    } catch (err: any) {
      console.error(err);
      error("Error deleting banner");
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setImageUrl(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setImageUrl('');
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-32)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--space-8)' }}>Hero Banners</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage home app banners and promotional graphics</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Banner
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <LoadingOverlay />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ImageIcon size={48} />}
            title="No Banners Found"
            message="Click 'Add New Banner' to upload your first hero graphic."
          />
        ) : (
          <div className="table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th style={{ paddingLeft: 'var(--space-32)' }}>Banner Image</th>
                  <th>Title</th>
                  <th style={{ textAlign: 'right', paddingRight: 'var(--space-32)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ paddingLeft: 'var(--space-32)', width: '200px' }}>
                      {item.imageUrl ? (
                        <div style={{ width: '140px', height: '70px', borderRadius: 'var(--radius-input)', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                      ) : (
                        <div style={{ width: '140px', height: '70px', borderRadius: 'var(--radius-input)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', backgroundColor: 'var(--background)' }}>
                          <ImageIcon size={20} style={{ marginRight: '4px' }} /> No Image
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>
                      {item.title}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 'var(--space-32)' }}>
                      <div style={{ display: 'inline-flex', gap: 'var(--space-8)' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: 'var(--space-8) var(--space-8)' }}
                          onClick={() => openEdit(item)}
                          title="Edit Banner"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: 'var(--space-8) var(--space-8)', color: 'var(--danger)', borderColor: 'var(--border)' }}
                          onClick={() => setDeleteId(item.id)}
                          title="Delete Banner"
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
        <div 
          style={{
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
            zIndex: 100,
            padding: 'var(--space-16)'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              marginBottom: 0,
              padding: 'var(--space-32)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {editingId ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button 
                className="btn btn-outline" 
                style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-full)', border: 'none' }}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Banner Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter banner title"
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image</label>
                <ImageUpload 
                  onFileSelect={() => {}} 
                  onUploadComplete={(url: string) => setImageUrl(url)} 
                  folder="banners" 
                  previewUrl={imageUrl} 
                  onClear={() => setImageUrl('')} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : (editingId ? 'Update Banner' : 'Save Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
