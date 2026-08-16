// Sprint M3.6 — Distributed Job Models & Interfaces

export type JobStatus =
  | 'queued'
  | 'scheduled'
  | 'running'
  | 'retrying'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'dead_letter';

export type JobPriority = 'critical' | 'high' | 'normal' | 'low' | 'background';

export type JobType =
  | 'image_processing'
  | 'audio_processing'
  | 'video_processing'
  | 'document_processing'
  | 'batch_processing'
  | 'maintenance_cleanup';

export interface MediaProcessingJob {
  jobId: string;
  mediaId: string;
  jobType: JobType;
  priority: JobPriority;
  status: JobStatus;
  payload: {
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
    fileName: string;
    metadata: Record<string, unknown>;
  };
  attemptCount: number;
  maxAttempts: number;
  nextRetryAt?: string;
  delayMs?: number;
  scheduledAt?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  workerId?: string;
  errorReason?: string;
  correlationId: string;
  traceId: string;
}

export interface WorkerRegistration {
  workerId: string;
  hostname: string;
  status: 'idle' | 'busy' | 'offline';
  currentJobId?: string;
  lastHeartbeat: string;
  jobsCompletedCount: number;
  jobsFailedCount: number;
}

export interface QueueMetrics {
  totalQueued: number;
  totalRunning: number;
  totalCompleted: number;
  totalFailed: number;
  totalDeadLetter: number;
  activeWorkers: number;
  avgProcessingTimeMs: number;
  successRatePercentage: number;
  throughputPerMin: number;
}
