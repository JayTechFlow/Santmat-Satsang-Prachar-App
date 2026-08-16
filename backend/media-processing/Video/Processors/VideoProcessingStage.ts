// Sprint M3.4 — Production VideoProcessingStage implementation

import type { IMediaProcessingStage, ProcessingContext, StageResult } from '../../Interfaces/IMediaProcessingPipeline';
import { VideoMetadataExtractor } from '../Metadata/VideoMetadataExtractor';
import { VideoThumbnailGenerator } from '../Thumbnails/VideoThumbnailGenerator';
import { VideoPreviewGenerator } from '../Previews/VideoPreviewGenerator';
import { VideoOptimizer } from '../Providers/VideoOptimizer';
import { mediaEventBus } from '../../Events/MediaProcessingEvents';

export class VideoProcessingStage implements IMediaProcessingStage {
  readonly stageName = 'VideoProcessingStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    // 1. Extract detailed video metadata & container inspection
    const videoMeta = await VideoMetadataExtractor.extract(ctx.file, ctx.fileName, ctx.mimeType);
    ctx.metadata['videoMetadata'] = videoMeta;

    mediaEventBus.publish({
      eventType: 'MetadataExtracted',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { resolution: videoMeta.resolution.label, codec: videoMeta.videoCodec },
    });

    // 2. Generate Poster & Frame Thumbnails (First frame, Middle frame, Timestamps, Small, Med, Lg)
    const thumbnails = VideoThumbnailGenerator.generateThumbnails(videoMeta.resolution, videoMeta.durationSeconds, ctx.sizeBytes);
    ctx.metadata['videoThumbnails'] = thumbnails;

    mediaEventBus.publish({
      eventType: 'ThumbnailGenerated',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { count: thumbnails.length, poster: true },
    });

    // 3. Generate Responsive Video Preview Clip Abstraction
    const preview = VideoPreviewGenerator.generatePreview(ctx.storagePath, videoMeta.resolution, videoMeta.durationSeconds, ctx.sizeBytes);
    ctx.metadata['videoPreview'] = preview;

    mediaEventBus.publish({
      eventType: 'PreviewGenerated',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { previewClipDuration: preview.previewClipDurationSeconds },
    });

    // 4. Video Resolution, Bitrate & Quality Optimization Analysis
    const optimization = VideoOptimizer.analyzeAndOptimize(videoMeta.resolution, videoMeta.bitrateKbps);
    ctx.metadata['videoOptimization'] = optimization;

    mediaEventBus.publish({
      eventType: 'MediaOptimized',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { targetBitrate: optimization.targetBitrateKbps, qualityScore: optimization.qualityScore },
    });

    const durationMs = Date.now() - startTime;
    const stageResult: StageResult = {
      stageName: this.stageName,
      status: 'completed',
      durationMs,
      data: {
        resolution: videoMeta.resolution.label,
        durationSeconds: videoMeta.durationSeconds,
        thumbnailsCount: thumbnails.length,
        qualityScore: optimization.qualityScore,
      },
    };

    ctx.completedStages.push(stageResult);
    return ctx;
  }
}
