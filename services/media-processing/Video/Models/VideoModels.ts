// Sprint M3.4 — Video Models & Domain Interfaces

export interface VideoResolution {
  width: number;
  height: number;
  label: string; // e.g. "1080p (Full HD)", "720p (HD)"
  aspectRatio: number;
}

export interface VideoThumbnailVariant {
  label: 'poster' | 'firstFrame' | 'middleFrame' | 'timestampFrame' | 'small' | 'medium' | 'large';
  width: number;
  height: number;
  timestampSeconds: number;
  sizeBytes: number;
  storagePath?: string;
}

export interface DetailedVideoMetadata {
  durationSeconds: number;
  humanReadableDuration: string;
  resolution: VideoResolution;
  frameRateFps: number;
  videoCodec: string;
  audioCodec: string;
  audioChannels: number;
  container: string;
  bitrateKbps: number;
  rotationDegrees: number;
  orientation: 'landscape' | 'portrait' | 'square';
  isHdr: boolean;
  colorSpace: string;
  sizeBytes: number;
  checksum: string;
  hash: string;
  createdAt: string;
  modifiedAt: string;
}

export interface VideoPreviewVariant {
  previewClipDurationSeconds: number;
  posterUrlPlaceholder: string;
  streamingPreviewUrlPlaceholder: string;
  targetWidth: number;
  targetHeight: number;
  bitrateKbps: number;
  estimatedSizeBytes: number;
}

export interface VideoOptimizationStats {
  recommendedResolution: string;
  targetBitrateKbps: number;
  compressionSavingsPercentage: number;
  containerValid: boolean;
  qualityScore: number; // 0-100
  durationMs: number;
}
