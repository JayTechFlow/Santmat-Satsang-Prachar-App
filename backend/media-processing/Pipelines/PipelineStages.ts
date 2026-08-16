// Sprint M3.1 — Pipeline Stage Implementations
// ValidationStage, MetadataExtractionStage, OptimizationStage, ThumbnailStage, PreviewStage, StorageStage, AuditStage, EventStage

import type { IMediaProcessingStage, ProcessingContext, StageResult } from '../Interfaces/IMediaProcessingPipeline';
import { MediaValidator } from '../Validators/MediaValidator';
import { MetadataExtractor } from '../Extractors/MetadataExtractor';
import { mediaEventBus } from '../Events/MediaProcessingEvents';
import { ImageOptimizer } from '../Image/Optimizers/ImageOptimizer';
import { ThumbnailGenerator } from '../Image/Generators/ThumbnailGenerator';
import { PreviewGenerator, BlurPlaceholderGenerator } from '../Image/Generators/PreviewGenerator';
import type { ImageDimensions } from '../Image/Models/ImageModels';
import { AudioOptimizer } from '../Audio/Providers/AudioOptimizer';
import { WaveformGenerator } from '../Audio/Waveforms/WaveformGenerator';
import { AudioPreviewGenerator } from '../Audio/Players/AudioPreviewGenerator';
import { VideoOptimizer } from '../Video/Providers/VideoOptimizer';
import { VideoThumbnailGenerator } from '../Video/Thumbnails/VideoThumbnailGenerator';
import { VideoPreviewGenerator } from '../Video/Previews/VideoPreviewGenerator';
import type { VideoResolution } from '../Video/Models/VideoModels';
import { DocumentMetadataExtractor } from '../Documents/Metadata/DocumentMetadataExtractor';
import { DocumentPreviewGenerator } from '../Documents/Previews/DocumentPreviewGenerator';
import { DocumentAnalyzer } from '../Documents/Providers/DocumentAnalyzer';

/** Stage 1: ValidationStage */
export class ValidationStage implements IMediaProcessingStage {
  readonly stageName = 'ValidationStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    const isValidSize = MediaValidator.validateSize(ctx.sizeBytes);
    if (!isValidSize) {
      throw new Error(`File size ${ctx.sizeBytes} bytes exceeds maximum allowed limit.`);
    }

    const checksum = await MediaValidator.calculateChecksum(ctx.file);
    ctx.metadata['checksum'] = checksum;
    ctx.metadata['hash'] = checksum;

    const durationMs = Date.now() - startTime;
    const stageResult: StageResult = {
      stageName: this.stageName,
      status: 'completed',
      durationMs,
      data: { checksum, validSize: true },
    };

    ctx.completedStages.push(stageResult);
    mediaEventBus.publish({
      eventType: 'MediaValidationCompleted',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { checksum },
    });

    return ctx;
  }
}

/** Stage 2: MetadataExtractionStage */
export class MetadataExtractionStage implements IMediaProcessingStage {
  readonly stageName = 'MetadataExtractionStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    const extracted = await MetadataExtractor.extract(
      ctx.fileName,
      ctx.mimeType,
      ctx.sizeBytes,
      (ctx.metadata['checksum'] as string) || ''
    );

    ctx.metadata = { ...ctx.metadata, ...extracted };

    const durationMs = Date.now() - startTime;
    const stageResult: StageResult = {
      stageName: this.stageName,
      status: 'completed',
      durationMs,
      data: extracted as unknown as Record<string, unknown>,
    };

    ctx.completedStages.push(stageResult);
    mediaEventBus.publish({
      eventType: 'MetadataExtracted',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { extractedKeys: Object.keys(extracted) },
    });

    return ctx;
  }
}


/** Stage 3: OptimizationStage */
export class OptimizationStage implements IMediaProcessingStage {
  readonly stageName = 'OptimizationStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    if (ctx.mimeType.startsWith('image/')) {
      const optimization = ImageOptimizer.optimize(ctx.sizeBytes);
      ctx.metadata['optimization'] = optimization;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { compressionRatio: optimization.compressionRatio, savingsBytes: optimization.savingsBytes },
      });

      mediaEventBus.publish({
        eventType: 'MediaOptimized',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { compressionRatio: optimization.compressionRatio, savingsBytes: optimization.savingsBytes },
      });
    } else if (ctx.mimeType.startsWith('audio/')) {
      const durationSec = (ctx.metadata['durationSeconds'] as number) || 180;
      const audioOpt = AudioOptimizer.analyzeAndOptimize(durationSec);
      ctx.metadata['audioOptimization'] = audioOpt;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { peakLevelDb: audioOpt.peakLevelDb, dynamicRangeDb: audioOpt.dynamicRangeDb },
      });

      mediaEventBus.publish({
        eventType: 'MediaOptimized',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { peakLevelDb: audioOpt.peakLevelDb, dynamicRangeDb: audioOpt.dynamicRangeDb },
      });
    } else if (ctx.mimeType.startsWith('video/')) {
      const res: VideoResolution = (ctx.metadata['resolution'] as VideoResolution) ?? { width: 1920, height: 1080, label: '1080p', aspectRatio: 1.78 };
      const bitrate = (ctx.metadata['bitrateKbps'] as number) || 5000;
      const videoOpt = VideoOptimizer.analyzeAndOptimize(res, bitrate);
      ctx.metadata['videoOptimization'] = videoOpt;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { targetBitrate: videoOpt.targetBitrateKbps, qualityScore: videoOpt.qualityScore },
      });

      mediaEventBus.publish({
        eventType: 'MediaOptimized',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { targetBitrate: videoOpt.targetBitrateKbps, qualityScore: videoOpt.qualityScore },
      });
    } else {
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'skipped',
        durationMs: Date.now() - startTime,
        data: { reason: 'Unsupported MIME for optimization' },
      });
    }

    return ctx;
  }
}

/** Stage 4: ThumbnailStage */
export class ThumbnailStage implements IMediaProcessingStage {
  readonly stageName = 'ThumbnailStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    if (ctx.mimeType.startsWith('image/')) {
      const dimensions = (ctx.metadata['dimensions'] as ImageDimensions) ?? { width: 1200, height: 800, aspectRatio: 1.5 };
      const thumbnails = ThumbnailGenerator.generateThumbnails(dimensions, ctx.sizeBytes);
      ctx.metadata['thumbnails'] = thumbnails;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { count: thumbnails.length },
      });

      mediaEventBus.publish({
        eventType: 'ThumbnailGenerated',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { count: thumbnails.length },
      });
    } else if (ctx.mimeType.startsWith('audio/')) {
      // Audio Waveform Generation in Thumbnail Stage
      const durationSec = (ctx.metadata['durationSeconds'] as number) || 180;
      const waveform = WaveformGenerator.generateWaveform(ctx.sizeBytes, durationSec);
      ctx.metadata['waveform'] = waveform;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { waveformSamples: waveform.sampleCount },
      });

      mediaEventBus.publish({
        eventType: 'WaveformGenerated',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { sampleCount: waveform.sampleCount },
      });
    } else if (ctx.mimeType.startsWith('video/')) {
      const res: VideoResolution = (ctx.metadata['resolution'] as VideoResolution) ?? { width: 1920, height: 1080, label: '1080p', aspectRatio: 1.78 };
      const durationSec = (ctx.metadata['durationSeconds'] as number) || 300;
      const vThumbs = VideoThumbnailGenerator.generateThumbnails(res, durationSec, ctx.sizeBytes);
      ctx.metadata['videoThumbnails'] = vThumbs;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { count: vThumbs.length, poster: true },
      });

      mediaEventBus.publish({
        eventType: 'ThumbnailGenerated',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { count: vThumbs.length, poster: true },
      });
    } else if (ctx.mimeType.startsWith('application/') || ctx.mimeType.startsWith('text/')) {
      const docMeta = await DocumentMetadataExtractor.extract(ctx.file, ctx.fileName, ctx.mimeType);
      const docPreviews = DocumentPreviewGenerator.generateDocumentPreviews(ctx.storagePath, docMeta);
      ctx.metadata['documentThumbnails'] = docPreviews.thumbnail;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { category: docMeta.documentCategory, pageCount: docMeta.pageCount },
      });

      mediaEventBus.publish({
        eventType: 'ThumbnailGenerated',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { category: docMeta.documentCategory },
      });
    } else {
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'skipped',
        durationMs: Date.now() - startTime,
        data: { reason: 'Unsupported MIME for thumbnail' },
      });
    }

    return ctx;
  }
}

/** Stage 5: PreviewStage */
export class PreviewStage implements IMediaProcessingStage {
  readonly stageName = 'PreviewStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    if (ctx.mimeType.startsWith('image/')) {
      const dimensions = (ctx.metadata['dimensions'] as ImageDimensions) ?? { width: 1200, height: 800, aspectRatio: 1.5 };
      const preview = PreviewGenerator.generatePreview(dimensions, ctx.sizeBytes);
      const blurPlaceholder = BlurPlaceholderGenerator.generateBlurPlaceholder(dimensions);
      
      ctx.metadata['preview'] = preview;
      ctx.metadata['blurPlaceholder'] = blurPlaceholder;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { previewWidth: preview.width, hasBlur: true },
      });

      mediaEventBus.publish({
        eventType: 'PreviewGenerated',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { previewWidth: preview.width, hasBlur: true },
      });
    } else if (ctx.mimeType.startsWith('audio/')) {
      const durationSec = (ctx.metadata['durationSeconds'] as number) || 180;
      const audioPreview = AudioPreviewGenerator.generatePreview(ctx.storagePath, durationSec, ctx.sizeBytes);
      ctx.metadata['audioPreview'] = audioPreview;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { previewDuration: audioPreview.previewDurationSeconds },
      });

      mediaEventBus.publish({
        eventType: 'PreviewGenerated',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { previewDuration: audioPreview.previewDurationSeconds },
      });
    } else if (ctx.mimeType.startsWith('video/')) {
      const res: VideoResolution = (ctx.metadata['resolution'] as VideoResolution) ?? { width: 1920, height: 1080, label: '1080p', aspectRatio: 1.78 };
      const durationSec = (ctx.metadata['durationSeconds'] as number) || 300;
      const vPreview = VideoPreviewGenerator.generatePreview(ctx.storagePath, res, durationSec, ctx.sizeBytes);
      ctx.metadata['videoPreview'] = vPreview;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { previewClipDuration: vPreview.previewClipDurationSeconds },
      });

      mediaEventBus.publish({
        eventType: 'PreviewGenerated',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { previewClipDuration: vPreview.previewClipDurationSeconds },
      });
    } else if (ctx.mimeType.startsWith('application/') || ctx.mimeType.startsWith('text/')) {
      const docMeta = await DocumentMetadataExtractor.extract(ctx.file, ctx.fileName, ctx.mimeType);
      const docPreviews = DocumentPreviewGenerator.generateDocumentPreviews(ctx.storagePath, docMeta);
      ctx.metadata['documentPreviews'] = docPreviews;

      const durationMs = Date.now() - startTime;
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'completed',
        durationMs,
        data: { category: docMeta.documentCategory, pageCount: docMeta.pageCount },
      });

      mediaEventBus.publish({
        eventType: 'PreviewGenerated',
        mediaId: ctx.mediaId,
        timestamp: new Date().toISOString(),
        stageName: this.stageName,
        data: { category: docMeta.documentCategory, pageCount: docMeta.pageCount },
      });
    } else {
      ctx.completedStages.push({
        stageName: this.stageName,
        status: 'skipped',
        durationMs: Date.now() - startTime,
        data: { reason: 'Unsupported MIME for preview' },
      });
    }

    return ctx;
  }
}

/** Stage 6: StorageStage */
export class StorageStage implements IMediaProcessingStage {
  readonly stageName = 'StorageStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    // Storage path routing metadata ready for Storage provider
    const durationMs = Date.now() - startTime;
    const stageResult: StageResult = {
      stageName: this.stageName,
      status: 'completed',
      durationMs,
      data: { storagePath: ctx.storagePath, readyForStorage: true },
    };

    ctx.completedStages.push(stageResult);
    mediaEventBus.publish({
      eventType: 'MediaStored',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { storagePath: ctx.storagePath },
    });

    return ctx;
  }
}

/** Stage 7: AuditStage */
export class AuditStage implements IMediaProcessingStage {
  readonly stageName = 'AuditStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    const auditTrail = {
      mediaId: ctx.mediaId,
      totalStagesExecuted: ctx.completedStages.length,
      errorsCount: ctx.errors.length,
      retryCount: ctx.retryCount,
      timestamp: new Date().toISOString(),
    };

    const durationMs = Date.now() - startTime;
    const stageResult: StageResult = {
      stageName: this.stageName,
      status: 'completed',
      durationMs,
      data: auditTrail,
    };

    ctx.completedStages.push(stageResult);
    return ctx;
  }
}

/** Stage 8: EventStage */
export class EventStage implements IMediaProcessingStage {
  readonly stageName = 'EventStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    mediaEventBus.publish({
      eventType: 'ProcessingCompleted',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { totalStages: ctx.completedStages.length },
    });

    const durationMs = Date.now() - startTime;
    const stageResult: StageResult = {
      stageName: this.stageName,
      status: 'completed',
      durationMs,
    };

    ctx.completedStages.push(stageResult);
    return ctx;
  }
}
