// Sprint M3.1 — Media Processing Pipeline Engine

import type {
  IMediaProcessingPipeline,
  IMediaProcessingStage,
  ProcessingContext,
  ProcessingProgress,
} from '../Interfaces/IMediaProcessingPipeline';
import { mediaEventBus } from '../Events/MediaProcessingEvents';
import {
  ValidationStage,
  MetadataExtractionStage,
  OptimizationStage,
  ThumbnailStage,
  PreviewStage,
  StorageStage,
  AuditStage,
  EventStage,
} from './PipelineStages';

export class MediaProcessingPipeline implements IMediaProcessingPipeline {
  private stages: IMediaProcessingStage[] = [];

  constructor(customStages?: IMediaProcessingStage[]) {
    if (customStages && customStages.length > 0) {
      this.stages = customStages;
    } else {
      // Default Sprint M3.1 Pipeline Order
      this.stages = [
        new ValidationStage(),
        new MetadataExtractionStage(),
        new OptimizationStage(),
        new ThumbnailStage(),
        new PreviewStage(),
        new StorageStage(),
        new AuditStage(),
        new EventStage(),
      ];
    }
  }

  public addStage(stage: IMediaProcessingStage): IMediaProcessingPipeline {
    this.stages.push(stage);
    return this;
  }

  public async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    mediaEventBus.publish({
      eventType: 'MediaProcessingStarted',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      data: { totalStages: this.stages.length },
    });

    const totalStages = this.stages.length;

    for (let i = 0; i < totalStages; i++) {
      const stage = this.stages[i];

      // Check cancellation token
      if (ctx.cancelled) {
        ctx.errors.push(`Processing cancelled before executing ${stage.stageName}`);
        this.reportProgress(ctx, stage.stageName, i, totalStages, 'cancelled');
        break;
      }

      this.reportProgress(ctx, stage.stageName, i, totalStages, 'processing');

      try {
        ctx = await stage.execute(ctx);
      } catch (err: unknown) {
        const errorMsg = (err as Error)?.message ?? 'Unknown stage execution error';
        ctx.errors.push(`Stage [${stage.stageName}] failed: ${errorMsg}`);

        this.reportProgress(ctx, stage.stageName, i, totalStages, 'failed', stage.stageName, errorMsg);

        mediaEventBus.publish({
          eventType: 'ProcessingFailed',
          mediaId: ctx.mediaId,
          timestamp: new Date().toISOString(),
          stageName: stage.stageName,
          error: errorMsg,
        });

        throw new Error(`Media processing pipeline failed at stage ${stage.stageName}: ${errorMsg}`);
      }
    }

    if (!ctx.cancelled && ctx.errors.length === 0) {
      this.reportProgress(ctx, 'Completed', totalStages, totalStages, 'completed');
    }

    return ctx;
  }

  public cancel(ctx?: ProcessingContext): void {
    if (ctx) {
      ctx.cancelled = true;
    }
  }

  private reportProgress(
    ctx: ProcessingContext,
    currentStage: string,
    completedCount: number,
    totalStages: number,
    status: 'processing' | 'completed' | 'failed' | 'cancelled',
    failedStage?: string,
    errorMessage?: string
  ): void {
    if (ctx.onProgress) {
      const percentage = Math.round((completedCount / totalStages) * 100);
      const progress: ProcessingProgress = {
        mediaId: ctx.mediaId,
        currentStage,
        completedStages: ctx.completedStages.map((s) => s.stageName),
        totalStages,
        percentage,
        status,
        failedStage,
        errorMessage,
      };
      ctx.onProgress(progress);
    }
  }
}
