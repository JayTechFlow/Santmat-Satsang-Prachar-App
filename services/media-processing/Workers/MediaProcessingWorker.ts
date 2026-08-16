// Sprint M3.1 — Media Processing Worker Manager & Retry Engine

import type { ProcessingContext, ProcessingProgress } from '../Interfaces/IMediaProcessingPipeline';
import { MediaProcessingPipeline } from '../Pipelines/MediaProcessingPipeline';

export class MediaProcessingWorker {
  private pipeline: MediaProcessingPipeline;

  constructor(pipeline?: MediaProcessingPipeline) {
    this.pipeline = pipeline ?? new MediaProcessingPipeline();
  }

  public async processJob(
    mediaId: string,
    file: File | Buffer,
    fileName: string,
    mimeType: string,
    sizeBytes: number,
    storagePath: string,
    maxRetries = 3,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<ProcessingContext> {
    let attempts = 0;
    let lastError: Error | null = null;

    let ctx: ProcessingContext = {
      mediaId,
      file,
      fileName,
      mimeType,
      sizeBytes,
      storagePath,
      metadata: {},
      completedStages: [],
      errors: [],
      cancelled: false,
      retryCount: 0,
      onProgress,
    };

    while (attempts < maxRetries) {
      try {
        ctx.retryCount = attempts;
        return await this.pipeline.execute(ctx);
      } catch (err: unknown) {
        attempts++;
        lastError = err as Error;
        if (attempts >= maxRetries) {
          throw new Error(`Media processing worker failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
        }
        // Reset stages for clean retry attempt
        ctx.completedStages = [];
      }
    }

    throw lastError ?? new Error('Worker failed');
  }
}
