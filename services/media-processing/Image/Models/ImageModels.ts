// Sprint M3.2 — Image Models & Domain Interfaces

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ImageExifSummary {
  cameraMake?: string;
  cameraModel?: string;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  dateTimeOriginal?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export interface DetailedImageMetadata {
  dimensions: ImageDimensions;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  colorSpace: string;
  hasAlpha: boolean;
  dpi: number;
  bitDepth: number;
  orientation: number;
  exif?: ImageExifSummary;
  checksum: string;
  hash: string;
  createdAt: string;
  modifiedAt: string;
}

export interface ThumbnailVariant {
  sizeLabel: 'small' | 'medium' | 'large' | 'square';
  width: number;
  height: number;
  sizeBytes: number;
  storagePath?: string;
  buffer?: Buffer;
}

export interface PreviewVariant {
  width: number;
  height: number;
  sizeBytes: number;
  progressive: boolean;
  quality: number;
  storagePath?: string;
  buffer?: Buffer;
}

export interface OptimizationResult {
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  compressionRatio: number; // Percentage saved e.g. 25.5%
  savingsBytes: number;
  durationMs: number;
  strippedMetadata: boolean;
  colorProfilePreserved: boolean;
}

export interface BlurPlaceholderResult {
  dataUrl: string; // Data URL format for immediate blur preview rendering
  width: number;
  height: number;
}
