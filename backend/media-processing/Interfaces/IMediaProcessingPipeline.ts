// Sprint M3.1 — Media Processing Foundation
// Domain models and interfaces for pipeline, context, and stage execution

export type StageStatus = 'pending' | 'running' | 'completed' | 'skipped' | 'failed';

export interface StageResult {
  stageName: string;
  status: StageStatus;
  durationMs: number;
  data?: Record<string, unknown>;
  error?: string;
}

export interface ProcessingProgress {
  mediaId: string;
  currentStage: string;
  completedStages: string[];
  totalStages: number;
  percentage: number;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  failedStage?: string;
  errorMessage?: string;
}

export interface ProcessingContext {
  mediaId: string;
  file: File | Buffer;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  metadata: Record<string, unknown>;
  completedStages: StageResult[];
  errors: string[];
  cancelled: boolean;
  retryCount: number;
  onProgress?: (progress: ProcessingProgress) => void;
}

export interface IMediaProcessingStage {
  readonly stageName: string;
  execute(ctx: ProcessingContext): Promise<ProcessingContext>;
}

export interface IMediaProcessingPipeline {
  addStage(stage: IMediaProcessingStage): IMediaProcessingPipeline;
  execute(ctx: ProcessingContext): Promise<ProcessingContext>;
  cancel(): void;
}
