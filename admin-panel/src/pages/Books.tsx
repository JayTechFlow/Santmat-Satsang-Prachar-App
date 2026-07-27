import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Trash2, Edit2, X, BookOpen } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { EmptyState } from '../components/ui/EmptyState';
import { ImageUpload } from '../components/ui/ImageUpload';

export function Books() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { success, error } = useToast();
  
  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'books'));
      setItems(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    } catch (err: any) {
      console.error(err);
      error("Failed to load books");
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
      const payload = { title, author, description, coverUrl };

      if (editingId) {
        await updateDoc(doc(db, 'books', editingId), payload);
        success("Book updated successfully");
      } else {
        await addDoc(collection(db, 'books'), { ...payload, createdAt: new Date() });
        success("Book added successfully");
      }
      setIsModalOpen(false);
      resetForm();
      fetchItems();
    } catch (err: any) {
      console.error(err);
      error("Error saving document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, 'books', deleteId));
      success("Book deleted successfully");
      fetchItems();
    } catch (err: any) {
      console.error(err);
      error("Failed to delete book");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setAuthor(item.author || '');
    setDescription(item.description || '');
    setCoverUrl(item.coverUrl || '');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setAuthor('');
    setDescription('');
    setCoverUrl('');
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-32)' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--space-8)' }}>Books Library</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage spiritual books, literature, and publications</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Book
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
        {loading && <LoadingOverlay />}
        
        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Cover</th>
                <th>Title</th>
                <th>Author</th>
                <th>Description</th>
                <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="image-preview"
                        style={{ width: '48px', height: '64px', borderRadius: 'var(--radius-input)', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '48px',
                          height: '64px',
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-input)'
                        }}
                      >
                        <BookOpen size={20} color="var(--text-muted)" />
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.title}</div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-body)' }}>{item.author || '—'}</span>
                  </td>
                  <td>
                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.description || '—'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-8)' }}>
                      <button className="btn-icon" onClick={() => openEdit(item)} title="Edit book">
                        <Edit2 size={18} />
                      </button>
                      <button className="btn-icon danger" onClick={() => setDeleteId(item.id)} title="Delete book">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <EmptyState 
              icon={<BookOpen size={48} />}
              title="No books found"
              message="Click 'Add New Book' to add one."
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: 'var(--space-24)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {editingId ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter book title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Author</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter author name"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Enter book description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Book Cover Image</label>
                <ImageUpload
                  folder="book_covers"
                  previewUrl={coverUrl}
                  onFileSelect={() => {}}
                  onUploadComplete={(url: string) => setCoverUrl(url)}
                  onClear={() => setCoverUrl('')}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-16)', marginTop: 'var(--space-32)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Saving...' : (editingId ? 'Update Book' : 'Save Book')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Book"
        message="Are you sure you want to delete this book? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
