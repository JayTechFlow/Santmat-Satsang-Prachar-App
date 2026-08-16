// Sprint E2.3 — Storage Capabilities
// Enterprise capability model for provider-driven feature discovery

export enum StorageCapability {
  // Core Operations
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  DELETE = 'delete',
  EXISTS = 'exists',
  COPY = 'copy',
  MOVE = 'move',
  RESTORE = 'restore',

  // Metadata
  METADATA_GET = 'metadata_get',
  METADATA_SET = 'metadata_set',
  METADATA_DELETE = 'metadata_delete',

  // Signed URLs
  SIGNED_URL_GET = 'signed_url_get',
  SIGNED_URL_PUT = 'signed_url_put',
  SIGNED_URL_DELETE = 'signed_url_delete',
  SIGNED_URL_POST = 'signed_url_post',
  PRESIGNED_POST_POLICY = 'presigned_post_policy',

  // Multipart Upload
  MULTIPART_CREATE = 'multipart_create',
  MULTIPART_UPLOAD_PART = 'multipart_upload_part',
  MULTIPART_COMPLETE = 'multipart_complete',
  MULTIPART_ABORT = 'multipart_abort',
  MULTIPART_LIST = 'multipart_list',

  // Resumable Upload
  RESUMABLE_CREATE = 'resumable_create',
  RESUMABLE_UPLOAD_CHUNK = 'resumable_upload_chunk',
  RESUMABLE_COMPLETE = 'resumable_complete',

  // Batch Operations
  BATCH_DELETE = 'batch_delete',
  BATCH_COPY = 'batch_copy',
  BATCH_MOVE = 'batch_move',

  // Listing & Search
  LIST = 'list',
  LIST_WITH_DELIMITER = 'list_with_delimiter',
  LIST_PAGINATION = 'list_pagination',

  // Versioning
  VERSION_LIST = 'version_list',
  VERSION_DELETE = 'version_delete',
  VERSION_RESTORE = 'version_restore',

  // Legal Hold & Retention
  LEGAL_HOLD_SET = 'legal_hold_set',
  LEGAL_HOLD_GET = 'legal_hold_get',
  RETENTION_SET = 'retention_set',
  RETENTION_GET = 'retention_get',
  OBJECT_LOCK = 'object_lock',

  // Encryption
  ENCRYPTION_SSE_S3 = 'encryption_sse_s3',
  ENCRYPTION_SSE_KMS = 'encryption_sse_kms',
  ENCRYPTION_SSE_C = 'encryption_sse_c',
  ENCRYPTION_CMEK = 'encryption_cmek',
  ENCRYPTION_CLIENT_SIDE = 'encryption_client_side',

  // Storage Tiers
  TIER_HOT = 'tier_hot',
  TIER_WARM = 'tier_warm',
  TIER_COLD = 'tier_cold',
  TIER_ARCHIVE = 'tier_archive',
  TIER_AUTO = 'tier_auto',

  // Lifecycle
  LIFECYCLE_RULES = 'lifecycle_rules',
  LIFECYCLE_TRANSITIONS = 'lifecycle_transitions',
  LIFECYCLE_EXPIRATION = 'lifecycle_expiration',
  LIFECYCLE_MULTIPART_ABORT = 'lifecycle_multipart_abort',

  // Replication
  REPLICATION_CROSS_REGION = 'replication_cross_region',
  REPLICATION_SAME_REGION = 'replication_same_region',
  REPLICATION_DELETE_MARKER = 'replication_delete_marker',
  REPLICATION_TIME_CONTROL = 'replication_time_control',

  // Streaming
  STREAM_DOWNLOAD = 'stream_download',
  STREAM_UPLOAD = 'stream_upload',
  STREAM_RANGE = 'stream_range',

  // Health & Metrics
  HEALTH_CHECK = 'health_check',
  HEALTH_VERIFY = 'health_verify',
  METRICS_BASIC = 'metrics_basic',
  METRICS_DETAILED = 'metrics_detailed',
  METRICS_COST = 'metrics_cost',

  // Compression
  COMPRESSION_GZIP = 'compression_gzip',
  COMPRESSION_ZSTD = 'compression_zstd',
  COMPRESSION_AUTO = 'compression_auto',

  // CDN & Edge
  CDN_INTEGRATION = 'cdn_integration',
  EDGE_CACHE = 'edge_cache',
  GEO_ROUTING = 'geo_routing',

  // Media Processing
  THUMBNAIL_GENERATION = 'thumbnail_generation',
  WAVEFORM_GENERATION = 'waveform_generation',
  PREVIEW_GENERATION = 'preview_generation',
  TRANSCODING = 'transcoding',
  WATERMARKING = 'watermarking',

  // Search & Metadata
  SEARCH_METADATA = 'search_metadata',
  FULL_TEXT_SEARCH = 'full_text_search',
  TAGGING = 'tagging',

  // Archive & Restore
  ARCHIVE = 'archive',
  RESTORE_EXPEDITED = 'restore_expedited',
  RESTORE_STANDARD = 'restore_standard',
  RESTORE_BULK = 'restore_bulk',
}

export type StorageCapabilitySet = Set<StorageCapability>;

export interface ProviderCapabilities {
  providerId: string;
  providerType: string;
  capabilities: StorageCapabilitySet;
  capabilityMetadata: Map<StorageCapability, CapabilityMetadata>;
  lastUpdated: string;
}

export interface CapabilityMetadata {
  supported: boolean;
  native: boolean;
  limitations?: string[];
  performance?: CapabilityPerformance;
  configuration?: Record<string, any>;
}

export interface CapabilityPerformance {
  maxFileSizeBytes?: number;
  maxParts?: number;
  partSizeRange?: { min: number; max: number };
  concurrentOperations?: number;
  typicalLatencyMs?: number;
  throughputMbps?: number;
}

export const CAPABILITY_GROUPS: Record<string, StorageCapability[]> = {
  core: [
    StorageCapability.UPLOAD,
    StorageCapability.DOWNLOAD,
    StorageCapability.DELETE,
    StorageCapability.EXISTS,
    StorageCapability.COPY,
    StorageCapability.MOVE,
    StorageCapability.RESTORE,
  ],
  metadata: [
    StorageCapability.METADATA_GET,
    StorageCapability.METADATA_SET,
    StorageCapability.METADATA_DELETE,
  ],
  signedUrls: [
    StorageCapability.SIGNED_URL_GET,
    StorageCapability.SIGNED_URL_PUT,
    StorageCapability.SIGNED_URL_DELETE,
    StorageCapability.SIGNED_URL_POST,
    StorageCapability.PRESIGNED_POST_POLICY,
  ],
  multipart: [
    StorageCapability.MULTIPART_CREATE,
    StorageCapability.MULTIPART_UPLOAD_PART,
    StorageCapability.MULTIPART_COMPLETE,
    StorageCapability.MULTIPART_ABORT,
    StorageCapability.MULTIPART_LIST,
  ],
  resumable: [
    StorageCapability.RESUMABLE_CREATE,
    StorageCapability.RESUMABLE_UPLOAD_CHUNK,
    StorageCapability.RESUMABLE_COMPLETE,
  ],
  batch: [
    StorageCapability.BATCH_DELETE,
    StorageCapability.BATCH_COPY,
    StorageCapability.BATCH_MOVE,
  ],
  listing: [
    StorageCapability.LIST,
    StorageCapability.LIST_WITH_DELIMITER,
    StorageCapability.LIST_PAGINATION,
  ],
  versioning: [
    StorageCapability.VERSION_LIST,
    StorageCapability.VERSION_DELETE,
    StorageCapability.VERSION_RESTORE,
  ],
  retention: [
    StorageCapability.LEGAL_HOLD_SET,
    StorageCapability.LEGAL_HOLD_GET,
    StorageCapability.RETENTION_SET,
    StorageCapability.RETENTION_GET,
    StorageCapability.OBJECT_LOCK,
  ],
  encryption: [
    StorageCapability.ENCRYPTION_SSE_S3,
    StorageCapability.ENCRYPTION_SSE_KMS,
    StorageCapability.ENCRYPTION_SSE_C,
    StorageCapability.ENCRYPTION_CMEK,
    StorageCapability.ENCRYPTION_CLIENT_SIDE,
  ],
  tiers: [
    StorageCapability.TIER_HOT,
    StorageCapability.TIER_WARM,
    StorageCapability.TIER_COLD,
    StorageCapability.TIER_ARCHIVE,
    StorageCapability.TIER_AUTO,
  ],
  lifecycle: [
    StorageCapability.LIFECYCLE_RULES,
    StorageCapability.LIFECYCLE_TRANSITIONS,
    StorageCapability.LIFECYCLE_EXPIRATION,
    StorageCapability.LIFECYCLE_MULTIPART_ABORT,
  ],
  replication: [
    StorageCapability.REPLICATION_CROSS_REGION,
    StorageCapability.REPLICATION_SAME_REGION,
    StorageCapability.REPLICATION_DELETE_MARKER,
    StorageCapability.REPLICATION_TIME_CONTROL,
  ],
  streaming: [
    StorageCapability.STREAM_DOWNLOAD,
    StorageCapability.STREAM_UPLOAD,
    StorageCapability.STREAM_RANGE,
  ],
  health: [
    StorageCapability.HEALTH_CHECK,
    StorageCapability.HEALTH_VERIFY,
    StorageCapability.METRICS_BASIC,
    StorageCapability.METRICS_DETAILED,
    StorageCapability.METRICS_COST,
  ],
  compression: [
    StorageCapability.COMPRESSION_GZIP,
    StorageCapability.COMPRESSION_ZSTD,
    StorageCapability.COMPRESSION_AUTO,
  ],
  cdn: [
    StorageCapability.CDN_INTEGRATION,
    StorageCapability.EDGE_CACHE,
    StorageCapability.GEO_ROUTING,
  ],
  media: [
    StorageCapability.THUMBNAIL_GENERATION,
    StorageCapability.WAVEFORM_GENERATION,
    StorageCapability.PREVIEW_GENERATION,
    StorageCapability.TRANSCODING,
    StorageCapability.WATERMARKING,
  ],
  search: [
    StorageCapability.SEARCH_METADATA,
    StorageCapability.FULL_TEXT_SEARCH,
    StorageCapability.TAGGING,
  ],
  archive: [
    StorageCapability.ARCHIVE,
    StorageCapability.RESTORE_EXPEDITED,
    StorageCapability.RESTORE_STANDARD,
    StorageCapability.RESTORE_BULK,
  ],
};

export function getCapabilitiesForGroup(group: string): StorageCapability[] {
  return CAPABILITY_GROUPS[group] || [];
}

export function getAllCapabilities(): StorageCapability[] {
  return Object.values(StorageCapability);
}

export function capabilityToString(cap: StorageCapability): string {
  return cap;
}

export function stringToCapability(str: string): StorageCapability | undefined {
  return Object.values(StorageCapability).find(c => c === str);
}