// Sprint M3.5 — Document & PDF Domain Models & Interfaces

export interface DocumentPreviewVariant {
  label: 'firstPage' | 'thumbnail' | 'medium' | 'large' | 'responsive';
  width: number;
  height: number;
  pageNumber: number;
  sizeBytes: number;
  storagePath?: string;
  dataUrlPlaceholder?: string;
}

export interface DetailedDocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pageCount: number;
  language?: string;
  version?: string;
  isEncrypted: boolean;
  isPasswordProtected: boolean;
  sizeBytes: number;
  checksum: string;
  hash: string;
  mimeType: string;
  extension: string;
  documentCategory: 'pdf' | 'word' | 'excel' | 'powerpoint' | 'text' | 'opendocument';
}

export interface DocumentAnalysisResult {
  pageCount: number;
  embeddedFontCount: number;
  embeddedImageCount: number;
  hyperlinkCount: number;
  tableCountPlaceholder: number;
  hasBookmarks: boolean;
  hasAttachments: boolean;
  analysisDurationMs: number;
}

export interface DocumentPreviewBundle {
  firstPagePreview: DocumentPreviewVariant;
  thumbnail: DocumentPreviewVariant;
  mediumPreview: DocumentPreviewVariant;
  largePreview: DocumentPreviewVariant;
  responsivePreview: DocumentPreviewVariant;
}
