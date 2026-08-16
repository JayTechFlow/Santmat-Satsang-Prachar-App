// Sprint M3.6 — WorkerPool Engine & Worker Registration Manager

import type { WorkerRegistration, MediaProcessingJob } from '../Models/JobModels';
import { MediaProcessingQueue } from '../MediaProcessingQueue';
import { MediaProcessingPipeline } from '../../Pipelines/MediaProcessingPipeline';
import { ImageProcessingStage } from '../../Image/Processors/ImageProcessingStage';
import { AudioProcessingStage } from '../../Audio/Processors/AudioProcessingStage';
import { VideoProcessingStage } from '../../Video/Processors/VideoProcessingStage';
import { DocumentProcessingStage } from '../../Documents/Processors/DocumentProcessingStage';
import { RetryEngine } from '../RetryEngine';
import { mediaEventBus } from '../../Events/MediaProcessingEvents';
import { FirebaseStorageProvider } from '../../../../infrastructure/storage/Providers/Firebase/FirebaseStorageProvider';

// Security constants
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_PROCESSING_SIZE_BYTES = 500 * 1024 * 1024; // 500MB for in-memory processing
const JOB_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CONCURRENT_JOBS_PER_WORKER = 1;

export class WorkerPool {
  private workers = new Map<string, WorkerRegistration>();
  private pipelineMap = new Map<string, MediaProcessingPipeline>();
  private storageProvider: FirebaseStorageProvider;

  constructor(private queue: MediaProcessingQueue) {
    this.pipelineMap.set('image_processing', new MediaProcessingPipeline([new ImageProcessingStage()]));
    this.pipelineMap.set('audio_processing', new MediaProcessingPipeline([new AudioProcessingStage()]));
    this.pipelineMap.set('video_processing', new MediaProcessingPipeline([new VideoProcessingStage()]));
    this.pipelineMap.set('document_processing', new MediaProcessingPipeline([new DocumentProcessingStage()]));
    this.storageProvider = new FirebaseStorageProvider({
      bucketName: 'santmat-satsang-prachar.appspot.com',
      projectId: 'santmat-satsang-prachar',
      storageRegion: 'asia-south1',
      enableResumableUploads: true,
      defaultCacheControl: 'public, max-age=3600',
    });
  }

  public registerWorker(workerId: string, hostname = 'worker-node-1'): WorkerRegistration {
    const reg: WorkerRegistration = {
      workerId,
      hostname,
      status: 'idle',
      lastHeartbeat: new Date().toISOString(),
      jobsCompletedCount: 0,
      jobsFailedCount: 0,
    };
    this.workers.set(workerId, reg);

    mediaEventBus.publish({
      eventType: 'WorkerRegistered',
      mediaId: workerId,
      timestamp: new Date().toISOString(),
      stageName: 'WorkerPool',
      data: { hostname },
    });

    return reg;
  }

  /**
   * Validate job payload size and security constraints
   */
  private validateJobPayload(job: MediaProcessingJob): { valid: boolean; error?: string } {
    const { sizeBytes, mimeType, storagePath } = job.payload;

    // Check declared size
    if (typeof sizeBytes !== 'number' || sizeBytes <= 0) {
      return { valid: false, error: 'Invalid or missing sizeBytes in payload' };
    }

    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: `File size ${sizeBytes} exceeds maximum allowed ${MAX_FILE_SIZE_BYTES}` };
    }

    // Check storage path format
    if (!storagePath || typeof storagePath !== 'string') {
      return { valid: false, error: 'Missing or invalid storagePath' };
    }

    // Basic path traversal check
    if (storagePath.includes('..') || storagePath.startsWith('/')) {
      return { valid: false, error: 'Invalid storagePath format' };
    }

    // Validate mimeType
    if (!mimeType || typeof mimeType !== 'string') {
      return { valid: false, error: 'Missing or invalid mimeType' };
    }

    return { valid: true };
  }

  /**
   * Stream file from storage with size verification
   */
  private async streamFileFromStorage(storagePath: string, expectedSize: number): Promise<Buffer> {
    // For large files, we stream in chunks. For this implementation, we download with size verification.
    // In production, this would use a proper streaming approach with backpressure handling.
    
    const file = this.storageProvider.bucket.file(storagePath);
    
    // First, verify the actual file size matches expected
    const [metadata] = await file.getMetadata();
    const actualSize = parseInt(String(metadata.size || '0'), 10);
    
    if (actualSize !== expectedSize) {
      throw new Error(`File size mismatch: expected ${expectedSize}, actual ${actualSize}`);
    }

    if (actualSize > MAX_PROCESSING_SIZE_BYTES) {
      throw new Error(`File size ${actualSize} exceeds maximum processing size ${MAX_PROCESSING_SIZE_BYTES}. Use streaming processor.`);
    }

    // Download the file
    const [buffer] = await file.download();
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  }

  public async processNextJob(workerId: string): Promise<boolean> {
    const worker = this.workers.get(workerId);
    if (!worker) return false;

    const job = this.queue.dequeue(workerId);
    if (!job) return false;

    // Validate job payload before processing
    const validation = this.validateJobPayload(job);
    if (!validation.valid) {
      job.status = 'failed';
      job.errorReason = validation.error;
      this.queue.moveToDeadLetter(job, validation.error || 'Invalid job payload');
      return false;
    }

    worker.status = 'busy';
    worker.currentJobId = job.jobId;
    worker.lastHeartbeat = new Date().toISOString();

    mediaEventBus.publish({
      eventType: 'JobStarted',
      mediaId: job.mediaId,
      timestamp: new Date().toISOString(),
      stageName: 'WorkerPool',
      data: { jobId: job.jobId, workerId },
    });

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Job processing timeout')), JOB_TIMEOUT_MS);
    });

    try {
      // Stream file from storage instead of allocating based on untrusted size
      const fileBuffer = await Promise.race([
        this.streamFileFromStorage(job.payload.storagePath, job.payload.sizeBytes),
        timeoutPromise,
      ]);

      const pipeline = this.pipelineMap.get(job.jobType) || this.pipelineMap.get('image_processing')!;
      await pipeline.execute({
        mediaId: job.mediaId,
        file: fileBuffer,
        fileName: job.payload.fileName,
        mimeType: job.payload.mimeType,
        sizeBytes: fileBuffer.length, // Use actual downloaded size
        storagePath: job.payload.storagePath,
        metadata: { ...job.payload.metadata },
        completedStages: [],
        errors: [],
        cancelled: false,
        retryCount: job.attemptCount,
      });

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      worker.jobsCompletedCount++;

      mediaEventBus.publish({
        eventType: 'JobCompleted',
        mediaId: job.mediaId,
        timestamp: new Date().toISOString(),
        stageName: 'WorkerPool',
        data: { jobId: job.jobId },
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);

      if (RetryEngine.shouldRetry(job)) {
        // Release lock and re-queue with bounded backoff
        this.queue.releaseLockAndRequeue(job, 'exponential');

        mediaEventBus.publish({
          eventType: 'JobRetried',
          mediaId: job.mediaId,
          timestamp: new Date().toISOString(),
          stageName: 'WorkerPool',
          data: { attempt: job.attemptCount, delayMs: RetryEngine.calculateNextRetryDelay(job) },
        });
      } else {
        worker.jobsFailedCount++;
        this.queue.moveToDeadLetter(job, errMsg);

        mediaEventBus.publish({
          eventType: 'JobFailed',
          mediaId: job.mediaId,
          timestamp: new Date().toISOString(),
          stageName: 'WorkerPool',
          data: { jobId: job.jobId, error: errMsg },
        });
      }
    } finally {
      worker.status = 'idle';
      worker.currentJobId = undefined;
      worker.lastHeartbeat = new Date().toISOString();
    }

    return true;
  }

  public getActiveWorkerCount(): number {
    return this.workers.size;
  }

  public getWorkers(): WorkerRegistration[] {
    return Array.from(this.workers.values());
  }
}
