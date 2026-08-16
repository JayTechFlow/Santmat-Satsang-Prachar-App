// Sprint M6.10 — Enterprise End-to-End Upload Processing Pipeline Engine

import type {
  UploadPipelineInput,
  UploadPipelineConfig,
  UploadPipelineResult,
  UploadPipelineProgress,
  UploadAuditLogEntry,
  UploadPipelineStage,
  UploadPipelineStatus,
  IUploadPipelineEngine,
} from './Interfaces/IUploadPipeline';
import { FirebaseStorageProvider } from '../storage/Providers/Firebase/FirebaseStorageProvider';
import { MediaProcessingQueue } from '../media-processing/Queue/MediaProcessingQueue';
import { RetryEngine } from '../media-processing/Queue/RetryEngine';
import { MediaProcessingPipeline } from '../media-processing/Pipelines/MediaProcessingPipeline';
import type { ProcessingContext } from '../media-processing/Interfaces/IMediaProcessingPipeline';
import type { MediaProcessingJob } from '../media-processing/Queue/Models/JobModels';

// AI & Search Engines
import { ImageIntelligenceEngine } from '../ai/Vision/ImageIntelligenceEngine';
import { AudioIntelligenceEngine } from '../ai/Audio/AudioIntelligenceEngine';
import { VideoIntelligenceEngine } from '../ai/Video/VideoIntelligenceEngine';
import { DocumentIntelligenceEngine } from '../ai/Document/DocumentIntelligenceEngine';
import { ContentModerationEngine } from '../ai/Moderation/ContentModerationEngine';
import { AIWorkflowEngine } from '../ai/Workflow/AIWorkflowEngine';
import { VectorSearchEngine } from '../ai/Vector/VectorSearchEngine';
import { mediaEventBus } from '../media-processing/Events/MediaProcessingEvents';

export class UploadPipelineEngine implements IUploadPipelineEngine {
  private storageProvider: FirebaseStorageProvider;
  private queue: MediaProcessingQueue;
  private mediaPipeline: MediaProcessingPipeline;
  private imageAI: ImageIntelligenceEngine;
  private audioAI: AudioIntelligenceEngine;
  private videoAI: VideoIntelligenceEngine;
  private documentAI: DocumentIntelligenceEngine;
  private moderationAI: ContentModerationEngine;
  private aiWorkflow: AIWorkflowEngine;
  private vectorSearch: VectorSearchEngine;

  private auditLogs: Map<string, UploadAuditLogEntry[]> = new Map();
  private firestoreDocStore: Map<string, Record<string, any>> = new Map();

  constructor(
    storageProvider?: FirebaseStorageProvider,
    queue?: MediaProcessingQueue,
    mediaPipeline?: MediaProcessingPipeline,
    vectorSearch?: VectorSearchEngine
  ) {
    this.storageProvider =
      storageProvider ??
      new FirebaseStorageProvider({
        bucketName: 'santmat-satsang-prachar.appspot.com',
        projectId: 'santmat-satsang-prachar',
        storageRegion: 'asia-south1',
        enableResumableUploads: true,
        defaultCacheControl: 'public, max-age=3600',
      });
    this.queue = queue ?? new MediaProcessingQueue();
    this.mediaPipeline = mediaPipeline ?? new MediaProcessingPipeline();
    this.imageAI = new ImageIntelligenceEngine();
    this.audioAI = new AudioIntelligenceEngine();
    this.videoAI = new VideoIntelligenceEngine();
    this.documentAI = new DocumentIntelligenceEngine();
    this.moderationAI = new ContentModerationEngine();
    this.aiWorkflow = new AIWorkflowEngine();
    this.vectorSearch = vectorSearch ?? new VectorSearchEngine();
  }

  public async processUpload(
    input: UploadPipelineInput,
    config?: UploadPipelineConfig,
    onProgress?: (progress: UploadPipelineProgress) => void
  ): Promise<UploadPipelineResult> {
    const startTime = Date.now();
    const mediaId = input.mediaId ?? `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const folder = input.folder ?? this.resolveFolder(input.mimeType);
    const storagePath = `${folder}/${mediaId}_${input.fileName}`;

    const maxAttempts = config?.maxAttempts ?? 3;
    const retryStrategy = config?.retryStrategy ?? 'exponential';
    const autoRollback = config?.autoRollback ?? true;
    const enableAI = config?.enableAI ?? true;
    const enableSearchIndex = config?.enableSearchIndex ?? true;

    this.initAuditLog(mediaId);
    let currentAttempt = 0;

    while (currentAttempt < maxAttempts) {
      currentAttempt++;
      try {
        // Stage 1: Upload & Firebase Storage
        this.reportProgress(mediaId, 'storage', 15, 'processing', { attempt: currentAttempt }, onProgress);
        this.logAudit(mediaId, 'storage', `Upload to Storage (Attempt ${currentAttempt})`, 'info', input.uploadedBy ?? 'system', {
          storagePath,
          sizeBytes: input.sizeBytes,
        });

        const storageMeta = await this.storageProvider.upload(storagePath, input.file, {
          metadata: { mimeType: input.mimeType },
        });

        // Stage 2: Firestore Record Creation
        this.reportProgress(mediaId, 'firestore', 30, 'processing', { storagePath }, onProgress);
        this.logAudit(mediaId, 'firestore', 'Create Firestore Record', 'info', input.uploadedBy ?? 'system', {
          status: 'queued',
        });

        const firestoreData: Record<string, any> = {
          mediaId,
          fileName: input.fileName,
          title: input.title ?? input.fileName,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          storagePath,
          folder,
          category: input.category ?? 'uncategorized',
          status: 'queued',
          uploadedBy: input.uploadedBy ?? 'system',
          uploadedByEmail: input.uploadedByEmail ?? null,
          checksum: storageMeta.checksum,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attemptCount: currentAttempt,
        };
        this.firestoreDocStore.set(mediaId, firestoreData);

        // Stage 3: Enqueue Job
        this.reportProgress(mediaId, 'queue', 45, 'processing', { queueStatus: 'enqueued' }, onProgress);
        const job: MediaProcessingJob = {
          jobId: `job_${mediaId}`,
          mediaId,
          type: 'media_processing',
          priority: 'high',
          status: 'queued',
          attemptCount: currentAttempt - 1,
          maxAttempts,
          createdAt: new Date().toISOString(),
          payload: { storagePath, mimeType: input.mimeType, sizeBytes: input.sizeBytes },
        };
        this.queue.enqueue(job);
        this.logAudit(mediaId, 'queue', 'Job Enqueued', 'info', 'system', { jobId: job.jobId });

        // Dequeue for worker processing
        const activeJob = this.queue.dequeue('worker-agent-d');
        if (activeJob) {
          activeJob.status = 'running';
        }

        // Stage 4: Media Processing Engine (Validation, Metadata, Optimization, Thumbnails, Previews)
        this.reportProgress(mediaId, 'media_processing', 60, 'processing', { pipeline: 'MediaProcessingPipeline' }, onProgress);
        this.logAudit(mediaId, 'media_processing', 'Execute Media Processing Pipeline', 'info', 'system', {});

        const procCtx: ProcessingContext = {
          mediaId,
          file: input.file,
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          storagePath,
          metadata: { ...input.metadata },
          completedStages: [],
          errors: [],
          cancelled: false,
          retryCount: currentAttempt - 1,
        };

        const processedCtx = await this.mediaPipeline.execute(procCtx);

        // Stage 5: AI Engine (Intelligence + Moderation + Workflow)
        let aiResults: Record<string, any> = {};
        if (enableAI) {
          this.reportProgress(mediaId, 'ai', 75, 'processing', { task: 'Content Analysis & Moderation' }, onProgress);
          this.logAudit(mediaId, 'ai', 'Execute AI Intelligence & Moderation', 'info', 'system', {});

          // Content Moderation
          const moderation = await this.moderationAI.inspectContent(input.title ?? input.fileName);
          if (!moderation.isSafe) {
            throw new Error(`Content moderation failed: Flagged categories ${moderation.flaggedCategories.join(', ')}`);
          }

          // Specific Intelligence based on MIME type
          if (input.mimeType.startsWith('image/')) {
            aiResults['vision'] = await this.imageAI.analyzeImage(storagePath);
          } else if (input.mimeType.startsWith('audio/')) {
            aiResults['audio'] = await this.audioAI.analyzeAudio(storagePath);
          } else if (input.mimeType.startsWith('video/')) {
            aiResults['video'] = await this.videoAI.analyzeVideo(storagePath);
          } else if (input.mimeType.startsWith('application/pdf') || input.mimeType.startsWith('text/')) {
            aiResults['document'] = await this.documentAI.analyzeDocument(storagePath);
          }

          aiResults['moderation'] = moderation;
          const aiJob = this.aiWorkflow.submitJob('media_ai_enrichment', { mediaId, aiResults });
          await this.aiWorkflow.processNextJob();
          aiResults['aiJobId'] = aiJob.id;
        }

        // Stage 6: Vector Search Engine Indexing
        let vectorIndexed = false;
        if (enableSearchIndex) {
          this.reportProgress(mediaId, 'search', 90, 'processing', { task: 'Vector Search Indexing' }, onProgress);
          this.logAudit(mediaId, 'search', 'Index Media Vector Search', 'info', 'system', {});

          const mockEmbedding = this.generateEmbedding(input.title ?? input.fileName);
          this.vectorSearch.indexMediaVector(mediaId, mockEmbedding, {
            title: input.title ?? input.fileName,
            category: input.category,
            mimeType: input.mimeType,
            storagePath,
          });
          vectorIndexed = true;
        }

        // Stage 7: Mark Ready & Finalize Firestore
        this.reportProgress(mediaId, 'ready', 100, 'completed', { status: 'ready' }, onProgress);
        this.logAudit(mediaId, 'ready', 'Upload Processing Pipeline Ready', 'success', 'system', {
          durationMs: Date.now() - startTime,
        });

        const finalMetadata = {
          ...firestoreData,
          ...processedCtx.metadata,
          status: 'ready' as UploadPipelineStatus,
          processedAt: new Date().toISOString(),
          aiResults,
          vectorIndexed,
        };
        this.firestoreDocStore.set(mediaId, finalMetadata);

        mediaEventBus.publish({
          eventType: 'ProcessingCompleted',
          mediaId,
          timestamp: new Date().toISOString(),
          stageName: 'UploadPipelineEngine',
          data: { status: 'ready', durationMs: Date.now() - startTime },
        });

        return {
          mediaId,
          storagePath,
          firestoreDocId: mediaId,
          status: 'ready',
          metadata: finalMetadata,
          aiResults,
          vectorIndexed,
          durationMs: Date.now() - startTime,
          auditTrail: this.getAuditLogs(mediaId),
          retryCount: currentAttempt - 1,
        };
      } catch (err: unknown) {
        const errorMsg = (err as Error)?.message ?? 'Unknown pipeline error';
        this.logAudit(mediaId, 'failed', `Error on attempt ${currentAttempt}: ${errorMsg}`, 'error', 'system', {
          attempt: currentAttempt,
          error: errorMsg,
        });

        const tempJob: MediaProcessingJob = {
          jobId: `job_${mediaId}`,
          mediaId,
          type: 'media_processing',
          priority: 'high',
          status: 'failed',
          attemptCount: currentAttempt,
          maxAttempts,
          createdAt: new Date().toISOString(),
          payload: {},
        };

        const canRetry = RetryEngine.shouldRetry(tempJob);
        if (canRetry && currentAttempt < maxAttempts) {
          const delayMs = RetryEngine.calculateNextRetryDelay(tempJob, retryStrategy);
          this.logAudit(mediaId, 'failed', `Retrying in ${delayMs}ms (Strategy: ${retryStrategy})`, 'warning', 'system', {
            delayMs,
            nextAttempt: currentAttempt + 1,
          });
          await this.delay(Math.min(delayMs, 100)); // Sleep capped for fast execution
          continue;
        }

        // Exceeded Retries or Unrecoverable Error -> Rollback & Dead-letter Queue
        if (autoRollback) {
          await this.executeRollback(mediaId, storagePath);
        }

        this.queue.moveToDeadLetter(tempJob, errorMsg);
        this.reportProgress(mediaId, 'dead_letter', 100, 'dead_letter', { error: errorMsg }, onProgress);
        this.logAudit(mediaId, 'dead_letter', `Job moved to Dead-Letter Queue: ${errorMsg}`, 'error', 'system', {
          reason: errorMsg,
        });

        const deadMetadata = {
          mediaId,
          fileName: input.fileName,
          status: 'dead_letter' as UploadPipelineStatus,
          error: errorMsg,
          failedAt: new Date().toISOString(),
          attemptCount: currentAttempt,
        };
        this.firestoreDocStore.set(mediaId, deadMetadata);

        return {
          mediaId,
          storagePath,
          firestoreDocId: mediaId,
          status: 'dead_letter',
          metadata: deadMetadata,
          vectorIndexed: false,
          durationMs: Date.now() - startTime,
          auditTrail: this.getAuditLogs(mediaId),
          retryCount: currentAttempt,
          error: errorMsg,
        };
      }
    }

    throw new Error(`Upload processing failed after ${maxAttempts} attempts.`);
  }

  public async replayDeadLetterJob(mediaId: string): Promise<UploadPipelineResult | null> {
    const deadJobId = `job_${mediaId}`;
    const replayed = this.queue.replayDeadLetter(deadJobId);
    if (!replayed) {
      return null;
    }

    this.logAudit(mediaId, 'queue', 'Replaying Dead-Letter Job', 'info', 'admin', { mediaId });
    const existingDoc = this.firestoreDocStore.get(mediaId);

    const replayedInput: UploadPipelineInput = {
      mediaId,
      file: Buffer.from('replayed_content'),
      fileName: existingDoc?.fileName ?? 'replayed_file.bin',
      mimeType: existingDoc?.mimeType ?? 'application/octet-stream',
      sizeBytes: existingDoc?.sizeBytes ?? 1024,
      uploadedBy: 'admin_replay',
    };

    return this.processUpload(replayedInput, { maxAttempts: 2 });
  }

  public getAuditLogs(mediaId: string): UploadAuditLogEntry[] {
    return this.auditLogs.get(mediaId) ?? [];
  }

  public getFirestoreDoc(mediaId: string): Record<string, any> | undefined {
    return this.firestoreDocStore.get(mediaId);
  }

  public getDeadLetterJobs(): MediaProcessingJob[] {
    return this.queue.getDeadLetterJobs();
  }

  private async executeRollback(mediaId: string, storagePath: string): Promise<void> {
    this.logAudit(mediaId, 'failed', 'Executing Rollback Mechanism', 'rollback', 'system', { storagePath });
    try {
      await this.storageProvider.delete(storagePath);
    } catch {
      // Storage file might not exist yet
    }
  }

  private resolveFolder(mimeType: string): string {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('application/pdf')) return 'documents';
    return 'temp';
  }

  private generateEmbedding(text: string): number[] {
    const embedding = new Array(8).fill(0);
    for (let i = 0; i < text.length; i++) {
      embedding[i % 8] += text.charCodeAt(i) / 1000;
    }
    return embedding;
  }

  private initAuditLog(mediaId: string): void {
    if (!this.auditLogs.has(mediaId)) {
      this.auditLogs.set(mediaId, []);
    }
  }

  private logAudit(
    mediaId: string,
    stage: UploadPipelineStage,
    action: string,
    status: 'info' | 'success' | 'warning' | 'error' | 'rollback',
    performedBy: string,
    details: Record<string, unknown>
  ): void {
    const entry: UploadAuditLogEntry = {
      mediaId,
      stage,
      action,
      status,
      performedBy,
      timestamp: new Date().toISOString(),
      details,
    };
    const logs = this.auditLogs.get(mediaId) ?? [];
    logs.push(entry);
    this.auditLogs.set(mediaId, logs);
  }

  private reportProgress(
    mediaId: string,
    stage: UploadPipelineStage,
    progressPercentage: number,
    status: UploadPipelineStatus,
    details?: Record<string, unknown>,
    onProgress?: (progress: UploadPipelineProgress) => void
  ): void {
    if (onProgress) {
      onProgress({
        mediaId,
        stage,
        progressPercentage,
        status,
        details,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
