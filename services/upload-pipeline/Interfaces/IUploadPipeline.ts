// Sprint M6.10 — Upload Pipeline Interfaces & Models

export type UploadPipelineStage =
  | 'upload'
  | 'storage'
  | 'firestore'
  | 'queue'
  | 'media_processing'
  | 'ai'
  | 'search'
  | 'ready'
  | 'failed'
  | 'dead_letter';

export type UploadPipelineStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';

export interface UploadPipelineProgress {
  mediaId: string;
  stage: UploadPipelineStage;
  progressPercentage: number;
  status: UploadPipelineStatus;
  details?: Record<string, unknown>;
  error?: string;
  timestamp: string;
}

export interface UploadPipelineInput {
  mediaId?: string;
  file: Buffer;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  title?: string;
  category?: string;
  folder?: string;
  uploadedBy?: string;
  uploadedByEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface UploadPipelineConfig {
  maxAttempts?: number;
  retryStrategy?: 'exponential' | 'linear' | 'fixed';
  bucketName?: string;
  autoRollback?: boolean;
  enableAI?: boolean;
  enableSearchIndex?: boolean;
}

export interface UploadAuditLogEntry {
  mediaId: string;
  stage: UploadPipelineStage;
  action: string;
  status: 'info' | 'success' | 'warning' | 'error' | 'rollback';
  performedBy: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export interface UploadPipelineResult {
  mediaId: string;
  storagePath: string;
  firestoreDocId: string;
  status: UploadPipelineStatus;
  metadata: Record<string, unknown>;
  aiResults?: Record<string, unknown>;
  vectorIndexed: boolean;
  durationMs: number;
  auditTrail: UploadAuditLogEntry[];
  retryCount: number;
  error?: string;
}

export interface IUploadPipelineEngine {
  processUpload(
    input: UploadPipelineInput,
    config?: UploadPipelineConfig,
    onProgress?: (progress: UploadPipelineProgress) => void
  ): Promise<UploadPipelineResult>;

  replayDeadLetterJob(mediaId: string): Promise<UploadPipelineResult | null>;
  getAuditLogs(mediaId: string): UploadAuditLogEntry[];
}
