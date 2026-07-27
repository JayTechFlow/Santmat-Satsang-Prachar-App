import { useState } from 'react';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { DataTable } from '../components/ui/DataTable';
import { Pagination } from '../components/ui/Pagination';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterBar } from '../components/ui/FilterBar';
import { FileUpload } from '../components/ui/FileUpload';
import { ImageUpload } from '../components/ui/ImageUpload';
import { AudioUpload } from '../components/ui/AudioUpload';
import { useFormValidation } from '../hooks/useFormValidation';
import { mapFirebaseError } from '../utils/firebaseErrors';

const ComponentsDemo = () => {
  const { success, error, info } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | number>('');
  
  // Upload States
  const [fileProgress, setFileProgress] = useState(0);
  const [isFileUploading, setIsFileUploading] = useState(false);

  // Form
  const { values, errors, handleChange, validate } = useFormValidation(
    { name: '', email: '' },
    {
      name: { required: 'Name is required' },
      email: { 
        required: 'Email is required', 
        pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Invalid email' }
      }
    }
  );

  const mockData = [
    { id: 1, name: 'Item A', status: 'Active' },
    { id: 2, name: 'Item B', status: 'Inactive' },
    { id: 3, name: 'Item C', status: 'Active' }
  ];

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status' }
  ];

  const handleSimulateUpload = (setterLoading: any, setterProgress: any) => {
    setterLoading(true);
    setterProgress(0);
    const interval = setInterval(() => {
      setterProgress((prev: number) => {
        if (prev >= 100) {
          clearInterval(interval);
          setterLoading(false);
          success('Upload complete!');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="main-content" style={{ paddingBottom: '100px' }}>
      <h1 className="page-title">Components Test Page</h1>
      
      <section className="card">
        <h3>1. Toasts</h3>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={() => success('Success Action!')}>Success Toast</button>
          <button className="btn btn-danger" onClick={() => error('Error occurred!')}>Error Toast</button>
          <button className="btn btn-outline" onClick={() => info('Some information.')}>Info Toast</button>
        </div>
      </section>

      <section className="card">
        <h3>2. Confirm Dialog</h3>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setIsConfirmOpen(true)}>
          Open Dialog
        </button>
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Delete Item?"
          message="Are you sure you want to delete this item? This action cannot be undone."
          isDestructive={true}
          confirmText="Delete"
          onConfirm={() => { setIsConfirmOpen(false); success('Item deleted'); }}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </section>

      <section className="card" style={{ position: 'relative', minHeight: '150px' }}>
        <h3>3. Loading & Skeleton</h3>
        <button className="btn btn-outline" style={{ marginTop: '16px', marginBottom: '16px' }} onClick={() => {
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 2000);
        }}>
          Show Loading Overlay (2s)
        </button>
        {isLoading && <LoadingOverlay message="Simulating wait..." />}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton height={20} />
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} width="60%" />
        </div>
      </section>

      <section className="card">
        <h3>4. Empty & Error States</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <EmptyState />
          <ErrorState />
        </div>
      </section>

      <section className="card">
        <h3>5 & 6. Data Table, Search, Filter & Pagination</h3>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', marginTop: '16px' }}>
          <SearchBar value={search} onSearch={setSearch} />
          <FilterBar 
            value={filter} 
            onChange={setFilter} 
            options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} 
          />
        </div>
        <DataTable data={mockData} columns={columns} keyExtractor={item => String(item.id)} />
        <Pagination currentPage={currentPage} totalPages={5} onPageChange={setCurrentPage} />
      </section>

      <section className="card">
        <h3>7 & 8. Upload Components</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
          <div>
            <h4>Generic File Upload (with progress)</h4>
            <FileUpload 
              onFileSelect={(_f) => { handleSimulateUpload(setIsFileUploading, setFileProgress); }}
              isUploading={isFileUploading}
              progress={fileProgress}
              fileName="document.pdf"
            />
          </div>
          <div>
            <h4>Image Upload (with preview)</h4>
            <ImageUpload onFileSelect={(_f) => { success('Image selected'); }} />
          </div>
          <div>
            <h4>Audio Upload (with player)</h4>
            <AudioUpload onFileSelect={(_f) => { success('Audio selected'); }} />
          </div>
        </div>
      </section>

      <section className="card">
        <h3>9 & 10. Form Validation & Firebase Error Utility</h3>
        <div style={{ marginTop: '16px', maxWidth: '400px' }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              className="form-input" 
              value={values.name} 
              onChange={e => handleChange('name', e.target.value)} 
            />
            {errors.name && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              className="form-input" 
              value={values.email} 
              onChange={e => handleChange('email', e.target.value)} 
            />
            {errors.email && <span style={{ color: 'var(--danger)', fontSize: '12px' }}>{errors.email}</span>}
          </div>
          <button className="btn btn-primary" onClick={() => {
            if (validate()) {
              success('Form is valid');
            } else {
              error(mapFirebaseError({ code: 'auth/invalid-email' })); // Test utility
            }
          }}>
            Submit / Test Firebase Error Mapper
          </button>
        </div>
      </section>
      {/* End Components */}
    </div>
  );
};

export const ComponentsTest = () => {
  return (
    <ComponentsDemo />
  );
};
