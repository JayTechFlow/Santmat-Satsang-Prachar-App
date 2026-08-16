// Sprint E2 — Enterprise Storage Platform Models
// Comprehensive storage models for enterprise storage platform

export type StorageTier = 'hot' | 'warm' | 'cold' | 'archive';
export type StorageClass = 
  | 'STANDARD' 
  | 'REDUCED_REDUNDANCY' 
  | 'STANDARD_IA' 
  | 'ONEZONE_IA' 
  | 'INTELLIGENT_TIERING' 
  | 'GLACIER' 
  | 'DEEP_ARCHIVE' 
  | 'NEARLINE' 
  | 'COLDLINE' 
  | 'ARCHIVE' 
  | 'HOT' 
  | 'COOL' 
  | 'COLD'
  | 'STANDARD_IA'
  | 'STANDARD';

export type StorageStrategyType = 
  | 'single_provider'
  | 'primary_secondary'
  | 'read_replica'
  | 'failover'
  | 'round_robin'
  | 'region_aware'
  | 'content_type_routing'
  | 'tier_based'
  | 'cost_optimized';

export type StorageProviderType = 
  | 'AWS_S3' 
  | 'AZURE_BLOB' 
  | 'GOOGLE_CLOUD_STORAGE' 
  | 'FIREBASE_STORAGE' 
  | 'CLOUDFLARE_R2' 
  | 'LOCAL';

export interface StorageObjectMetadata {
  storagePath: string;
  providerId: string;
  bucketName: string;
  sizeBytes: number;
  mimeType: string;
  checksum: string;
  checksumAlgorithm: 'MD5' | 'SHA256' | 'CRC32C';
  tier: StorageTier;
  storageClass?: StorageClass;
  createdAt: string;
  lastModifiedAt: string;
  isEncrypted: boolean;
  encryptionKeyId?: string;
  encryptionAlgorithm?: string;
  legalHoldActive?: boolean;
  retentionExpiration?: string;
  retentionMode?: 'GOVERNANCE' | 'COMPLIANCE';
  customMetadata?: Record<string, string>;
  tags?: Record<string, string>;
  etag?: string;
  versionId?: string;
  isDeleteMarker?: boolean;
}

export interface StorageOptions {
  tier?: StorageTier;
  storageClass?: StorageClass;
  region?: string;
  organizationId?: string;
  encrypted?: boolean;
  encryptionKeyId?: string;
  encryptionAlgorithm?: 'AES256' | 'AES128' | 'CUSTOM';
  retentionDays?: number;
  legalHold?: boolean;
  retentionMode?: 'GOVERNANCE' | 'COMPLIANCE';
  cacheControl?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  contentLanguage?: string;
  customMetadata?: Record<string, string>;
  tags?: Record<string, string>;
}

export interface SignedUrlResult {
  url: string;
  expiresAt: string;
  httpMethod: 'GET' | 'PUT' | 'DELETE' | 'POST';
  headers?: Record<string, string>;
  signedHeaders?: string[];
  requiresSigning?: boolean;
}

export interface StorageProviderHealth {
  providerId: string;
  providerType: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  latencyMs: number;
  availableCapacityBytes: number;
  usedCapacityBytes: number;
  totalCapacityBytes?: number;
  lastChecked: string;
  errorRate?: number;
  throughputBytesPerSec?: number;
  connectionCount?: number;
}

export interface StorageMetrics {
  totalObjectsCount: number;
  totalBytesStored: number;
  activeTierBreakdown: Record<StorageTier, number>;
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

export interface UploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
  currentChunk?: number;
  totalChunks?: number;
  bytesPerSecond?: number;
  estimatedTimeRemainingMs?: number;
}

export interface StorageError {
  code: string;
  message: string;
  providerId?: string;
  httpStatus?: number;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export interface StorageProviderConfig {
  providerId: string;
  providerType: StorageProviderType;
  enabled: boolean;
  priority: number;
  region?: string;
  credentials?: Record<string, string>;
  defaultTier?: StorageTier;
  defaultStorageClass?: string;
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
  blockedMimeTypes?: string[];
  allowedExtensions?: string[];
  blockedExtensions?: string[];
  bucketName?: string;
  endpoint?: string;
  pathStyle?: boolean;
  forcePathStyle?: boolean;
  sseAlgorithm?: 'AES256' | 'AWS_KMS' | 'CUSTOM';
  kmsKeyId?: string;
  versioning?: boolean;
  versioningMFADelete?: boolean;
  lifecycleRules?: LifecycleRule[];
  corsRules?: CorsRule[];
  publicAccessBlock?: PublicAccessBlockConfig;
}

export interface LifecycleRule {
  id: string;
  enabled: boolean;
  filter?: LifecycleFilter;
  status: 'Enabled' | 'Disabled';
  transitions?: LifecycleTransition[];
  expiration?: LifecycleExpiration;
  noncurrentVersionTransitions?: LifecycleTransition[];
  noncurrentVersionExpiration?: LifecycleExpiration;
  abortIncompleteMultipartUpload?: LifecycleAbortMultipartUpload;
}

export interface LifecycleFilter {
  prefix?: string;
  tags?: Record<string, string>;
  objectSizeGreaterThan?: number;
  objectSizeLessThan?: number;
}

export interface LifecycleTransition {
  days?: number;
  date?: string;
  storageClass: string;
}

export interface LifecycleExpiration {
  days?: number;
  date?: string;
  expiredObjectDeleteMarker?: boolean;
}

export interface LifecycleAbortMultipartUpload {
  daysAfterInitiation: number;
}

export interface CorsRule {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders?: string[];
  exposeHeaders?: string[];
  maxAgeSeconds?: number;
}

export interface PublicAccessBlockConfig {
  blockPublicAcls: boolean;
  ignorePublicAcls: boolean;
  blockPublicPolicy: boolean;
  restrictPublicBuckets: boolean;
}

export interface ProviderCapabilities {
  multipartUpload: boolean;
  streaming: boolean;
  versioning: boolean;
  retention: boolean;
  legalHold: boolean;
  signedUrls: boolean;
  replication: boolean;
  lifecycle: boolean;
  encryption: boolean;
  metrics: boolean;
  batch: boolean;
  resume: boolean;
  maxPartSize?: number;
  maxParts?: number;
  maxUploadSize?: number;
  supportedStorageClasses?: string[];
  supportedTiers?: StorageTier[];
  supportedRegions?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MultipartUpload {
  uploadId: string;
  key: string;
  partSize: number;
  parts: { partNumber: number; etag: string }[];
  initiatedAt: string;
  initiator?: string;
}

export interface MultipartUploadOptions {
  partSize?: number;
  maxParts?: number;
  concurrentParts?: number;
  onPartUploaded?: (partNumber: number, etag: string) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export interface ResumableUploadOptions {
  chunkSize?: number;
  onChunkUploaded?: (chunkIndex: number, progress: UploadProgress) => void;
  onProgress?: (progress: UploadProgress) => void;
  resumeFromByte?: number;
}

export interface PresignedPostPolicy {
  url: string;
  fields: Record<string, string>;
  conditions: PolicyCondition[];
}

export type PolicyCondition = 
  | ['starts-with', '$key', string]
  | ['content-length-range', number, number]
  | ['eq', '$content-type', string]
  | ['eq', '$cache-control', string]
  | ['eq', '$content-disposition', string]
  | ['eq', '$content-encoding', string]
  | ['eq', '$content-language', string]
  | ['eq', '$x-amz-meta-*', string]
  | ['eq', '$x-amz-server-side-encryption', string]
  | ['eq', '$x-amz-storage-class', string];