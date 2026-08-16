import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

export interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  description?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  accept,
  maxSizeMB = 5,
  label = 'Click or drag file to this area to upload',
  description = 'Support for a single file upload.'
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const validateAndProcessFile = useCallback((file: File) => {
    setError(null);
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }
    
    // Check accept pattern manually if needed, but input handles it mostly
    onFileSelect(file);
  }, [maxSizeMB, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  }, [validateAndProcessFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-40) var(--space-24)',
          textAlign: 'center',
          backgroundColor: isDragActive ? 'var(--primary-light)' : 'var(--surface)',
          transition: 'all var(--transition-fast)',
          cursor: 'pointer',
          position: 'relative'
        }}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        <UploadCloud size={48} color={isDragActive ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto var(--space-16)' }} />
        
        <h4 style={{ color: isDragActive ? 'var(--primary)' : 'var(--text-heading)', marginBottom: 'var(--space-8)' }}>
          {label}
        </h4>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {description}
        </p>
      </div>
      
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: 'var(--space-8)' }}>
          {error}
        </p>
      )}
    </div>
  );
};
