// Sprint E2 — Enterprise Storage Provider Interface
// Complete provider-agnostic storage contracts for enterprise storage platform

import type {
  StorageObjectMetadata,
  StorageOptions,
  SignedUrlResult,
  StorageProviderHealth,
  StorageTier,
  StorageStrategyType,
  StorageError,
  MultipartUpload,
  MultipartUploadOptions,
  ResumableUploadOptions,
  PresignedPostPolicy,
  UploadProgress,
  StorageError,
} from '../Models/StorageModels';

export interface IStorageProvider {
  readonly providerId: string;
  readonly providerType: string;
  readonly config: Readonly<any>;

  // Core operations
  upload(path: string, content: Buffer | Uint8Array | ReadableStream, options?: StorageOptions): Promise<StorageObjectMetadata>;
  download(path: string): Promise<Buffer | ReadableStream>;
  delete(path: string): Promise<boolean>;
  restore(path: string): Promise<boolean>;
  exists(path: string): Promise<boolean>;
  move(sourcePath: string, destinationPath: string): Promise<boolean>;
  copy(sourcePath: string, destinationPath: string): Promise<boolean>;
  
  // Metadata operations
  getMetadata(path: string): Promise<StorageObjectMetadata>;
  setMetadata(path: string, metadata: Record<string, string>): Promise<StorageObjectMetadata>;
  deleteMetadata(path: string): Promise<boolean>;
  
  // Signed URLs
  generateSignedUrl(path: string, action: 'GET' | 'PUT' | 'DELETE' | 'POST', expiresInSeconds: number, options?: { headers?: Record<string, string> }): Promise<SignedUrlResult>;
  generatePresignedPostPolicy(policy: any): Promise<PresignedPostPolicy>;
  
  // Multipart upload
  createMultipartUpload(path: string, options?: StorageOptions): Promise<MultipartUpload>;
  uploadPart(path: string, uploadId: string, partNumber: number, content: Buffer | Uint8Array | ReadableStream): Promise<{ partNumber: number; etag: string }>;
  completeMultipartUpload(path: string, uploadId: string, parts: { partNumber: number; etag: string }[]): Promise<StorageObjectMetadata>;
  abortMultipartUpload(path: string, uploadId: string): Promise<void>;
  listMultipartUploads(prefix?: string): Promise<MultipartUpload[]>;
  
  // Resumable uploads
  createResumableUpload(path: string, options?: StorageOptions): Promise<{ uploadId: string; uploadUrl: string }>;
  uploadChunk(uploadId: string, chunkIndex: number, content: Buffer | Uint8Array, startByte: number, endByte: number): Promise<{ chunkIndex: number; etag: string }>;
  completeResumableUpload(uploadId: string): Promise<StorageObjectMetadata>;
  
  // Batch operations
  batchDelete(paths: string[]): Promise<{ deleted: string[]; failed: { path: string; error: StorageError }[] }>;
  batchCopy(sourcePaths: string[], destinationPrefix: string): Promise<{ copied: string[]; failed: { path: string; error: StorageError }[] }>;
  batchMove(sourcePaths: string[], destinationPrefix: string): Promise<{ moved: string[]; failed: { path: string; error: StorageError }[] }>;
  
  // Listing and search
  list(prefix?: string, delimiter?: string, maxKeys?: number, continuationToken?: string): Promise<{ objects: StorageObjectMetadata[]; prefixes: string[]; nextContinuationToken?: string }>;
  
  // Versioning
  listVersions(path: string): Promise<StorageObjectMetadata[]>;
  deleteVersion(path: string, versionId: string): Promise<boolean>;
  restoreVersion(path: string, versionId: string): Promise<StorageObjectMetadata>;
  
  // Legal hold and retention
  setLegalHold(path: string, hold: boolean): Promise<void>;
  setRetention(path: string, mode: 'GOVERNANCE' | 'COMPLIANCE', retainUntilDate: Date): Promise<void>;
  
  // Health and monitoring
  getHealth(): Promise<StorageProviderHealth>;
  verifyStorageHealth(): Promise<StorageProviderHealth>;
  getMetrics(): Promise<StorageMetrics>;
  
  // Streams
  getDownloadStream(path: string, options?: { startByte?: number; endByte?: number }): Promise<ReadableStream>;
  getUploadStream(path: string, options?: StorageOptions): Promise<WritableStream>;
  
  // Batch and resumable uploads
  uploadResumable(path: string, contentOrStream: Buffer | Uint8Array | ReadableStream, options?: StorageOptions & ResumableUploadOptions): Promise<StorageObjectMetadata>;
  uploadMultipart(path: string, content: Buffer | Uint8Array | ReadableStream, options?: StorageOptions & MultipartUploadOptions): Promise<StorageObjectMetadata>;
}

export interface IStorageRouter {
  selectProvider(mimeType: string, region?: string, tier?: StorageTier, strategy?: StorageStrategyType): IStorageProvider;
  getProvider(providerId: string): IStorageProvider | undefined;
  getAllProviders(): IStorageProvider[];
  getProvidersByType(type: string): IStorageProvider[];
  routeForUpload(mimeType: string, sizeBytes: number, options?: StorageOptions): IStorageProvider;
  routeForDownload(path: string): IStorageProvider;
}

export interface IStorageStrategy {
  readonly strategyType: StorageStrategyType;
  executeUpload(path: string, content: Buffer | Uint8Array | ReadableStream, options?: StorageOptions): Promise<StorageObjectMetadata>;
  executeDownload(path: string): Promise<Buffer | ReadableStream>;
  executeDelete(path: string): Promise<boolean>;
}

export interface IStorageService {
  readonly router: IStorageRouter;
  
  // High-level operations
  upload(path: string, content: Buffer | Uint8Array | ReadableStream, options?: StorageOptions): Promise<StorageObjectMetadata>;
  download(path: string): Promise<Buffer | ReadableStream>;
  delete(path: string): Promise<boolean>;
  
  // Upload pipeline integration
  processUpload(uploadRequest: UploadRequest): Promise<UploadResult>;
  
  // Security
  validateUpload(file: File | Buffer, options?: StorageOptions): Promise<ValidationResult>;
  scanForVirus(path: string): Promise<ScanResult>;
  
  // Media processing
  processMedia(path: string, processingOptions: MediaProcessingOptions): Promise<MediaProcessingResult>;
  
  // Analytics
  trackUploadEvent(event: UploadAnalyticsEvent): Promise<void>;
  trackDownloadEvent(event: DownloadAnalyticsEvent): Promise<void>;
}

export interface UploadRequest {
  path: string;
  content: Buffer | Uint8Array | ReadableStream | File;
  options?: StorageOptions;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  metadata: StorageObjectMetadata;
  downloadUrl: string;
  signedUrl?: string;
  processingResults?: MediaProcessingResult;
  analyticsEventId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: StorageError[];
  warnings: string[];
  sanitizedFileName?: string;
  sanitizedMetadata?: Record<string, string>;
}

export interface ScanResult {
  clean: boolean;
  threats: string[];
  scanDurationMs: number;
}

export interface MediaProcessingOptions {
  generateThumbnails?: boolean;
  thumbnailSizes?: { width: number; height: number; suffix: string }[];
  generateWaveform?: boolean;
  extractAudioMetadata?: boolean;
  extractVideoMetadata?: boolean;
  generatePreview?: boolean;
  transcode?: TranscodeOptions;
  watermark?: WatermarkOptions;
}

export interface TranscodeOptions {
  targetFormat?: string;
  videoCodec?: string;
  audioCodec?: string;
  bitrate?: number;
  resolution?: string;
  fps?: number;
}

export interface WatermarkOptions {
  imagePath: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  margin?: number;
}

export interface MediaProcessingResult {
  thumbnails?: { size: string; path: string; url: string }[];
  waveform?: { path: string; url: string; data: number[] };
  audioMetadata?: Record<string, unknown>;
  videoMetadata?: Record<string, unknown>;
  preview?: { path: string; url: string };
  transcoded?: { path: string; url: string; format: string };
  watermarked?: { path: string; url: string };
  processingDurationMs: number;
}

export interface UploadAnalyticsEvent {
  userId?: string;
  organizationId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  providerId: string;
  storagePath: string;
  durationMs: number;
  status: 'success' | 'failed';
  error?: string;
}

export interface DownloadAnalyticsEvent {
  userId?: string;
  organizationId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  providerId: string;
  storagePath: string;
  durationMs: number;
  status: 'success' | 'failed';
  error?: string;
}

export interface StorageMetrics {
  totalObjectsCount: number;
  totalBytesStored: number;
  activeTierBreakdown: Record<string, number>;
  throughputBytesPerSec: number;
  errorRatePercentage: number;
  averageLatencyMs: number;
  costPerMonth?: number;
  costPerGB?: number;
  apiCallsCount: number;
  uploadCount: number;
  downloadCount: number;
  deleteCount: number;
}

export interface StorageCostReport {
  providerId: string;
  period: { start: string; end: string };
  storageCost: number;
  requestCost: number;
  dataTransferCost: number;
  totalCost: number;
  breakdown: {
    tier: StorageTier;
    bytes: number;
    cost: number;
  }[];
  recommendations: CostOptimizationRecommendation[];
}

export interface CostOptimizationRecommendation {
  type: 'tier_migration' | 'lifecycle_policy' | 'compression' | 'deduplication' | 'provider_switch';
  description: string;
  estimatedSavingsPerMonth: number;
  implementationEffort: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
}

export interface BackupPolicy {
  id: string;
  name: string;
  enabled: boolean;
  sourceProviders: string[];
  destinationProvider: string;
  schedule: string; // cron expression
  retentionDays: number;
  includeVersions: boolean;
  filter?: { prefix?: string; tags?: Record<string, string> };
}

export interface ReplicationConfig {
  id: string;
  name: string;
  enabled: boolean;
  sourceProvider: string;
  sourceBucket: string;
  destinationProvider: string;
  destinationBucket: string;
  filter?: { prefix?: string; tags?: Record<string, string> };
  deleteMarkerReplication: boolean;
  replicationTimeControl?: { minutes: number };
}