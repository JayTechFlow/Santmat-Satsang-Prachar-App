import React, { useState, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { FileText, X } from 'lucide-react';
import { storageService } from '../../core/storage';

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  pdfUrl?: string;
  progress?: number;
  isUploading?: boolean;
  onCancelUpload?: () => void;
  onUploadComplete?: (url: string) => void;
  folder?: string;
  uploadFn?: (file: File, folder: string, onProgress?: (p: number) => void) => Promise<string>;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({
  onFileSelect,
  onClear,
  pdfUrl: externalPdfUrl,
  progress,
  isUploading,
  onCancelUpload,
  onUploadComplete,
  folder = 'pdfs',
  uploadFn = storageService.uploadPDF.bind(storageService)
}) => {
  const [localPdfName, setLocalPdfName] = useState<string | null>(null);

  useEffect(() => {
    if (!externalPdfUrl) {
      setLocalPdfName(null);
    }
  }, [externalPdfUrl]);

  const handleFileSelect = (file: File) => {
    setLocalPdfName(file.name);
    onFileSelect(file);
  };

  const handleClear = () => {
    setLocalPdfName(null);
    if (onClear) onClear();
  };

  const currentPdf = localPdfName || (externalPdfUrl ? externalPdfUrl.split('/').pop()?.split('?')[0] : null);

  return (
    <div>
      {currentPdf && !isUploading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-16)',
          padding: 'var(--space-16)',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-input)',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-input)',
            backgroundColor: '#fee2e2',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={20} />
          </div>
          
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ 
              fontWeight: 600, 
              color: 'var(--text-heading)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentPdf}
            </div>
            {externalPdfUrl && (
              <a href={externalPdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>
                View PDF
              </a>
            )}
          </div>
          
          <button onClick={handleClear} className="btn-icon">
            <X size={20} />
          </button>
        </div>
      ) : (
        <FileUpload
          onFileSelect={handleFileSelect}
          accept="application/pdf"
          label="Drop a PDF file here, or click to select"
          description="Supports PDF (Max 20MB)"
          maxSizeMB={20}
          progress={progress}
          isUploading={isUploading}
          onCancelUpload={onCancelUpload}
          onUploadComplete={onUploadComplete}
          folder={folder}
          uploadFn={uploadFn}
        />
      )}
    </div>
  );
};
