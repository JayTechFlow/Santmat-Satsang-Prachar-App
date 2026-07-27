import React from 'react';
import { FileText } from 'lucide-react';

export interface PDFPreviewProps {
  pdfUrl?: string;
  title: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ pdfUrl }) => {
  if (!pdfUrl) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-8)',
        color: 'var(--text-muted)'
      }}>
        <FileText size={16} />
        <span style={{ fontSize: '0.875rem' }}>No PDF</span>
      </div>
    );
  }

  return (
    <a 
      href={pdfUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-8)',
        color: 'var(--primary)',
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: 500
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <FileText size={16} />
      <span>View PDF</span>
    </a>
  );
};
