// Sprint M3.2 — Production ImageProcessingStage implementation

import type { IMediaProcessingStage, ProcessingContext, StageResult } from '../../Interfaces/IMediaProcessingPipeline';
import { ImageMetadataExtractor } from '../Metadata/ImageMetadataExtractor';
import { ThumbnailGenerator } from '../Generators/ThumbnailGenerator';
import { PreviewGenerator, BlurPlaceholderGenerator } from '../Generators/PreviewGenerator';
import { ImageOptimizer } from '../Optimizers/ImageOptimizer';
import { mediaEventBus } from '../../Events/MediaProcessingEvents';

export class ImageProcessingStage implements IMediaProcessingStage {
  readonly stageName = 'ImageProcessingStage';

  async execute(ctx: ProcessingContext): Promise<ProcessingContext> {
    const startTime = Date.now();

    // 1. Extract detailed image metadata & run security checks
    const imageMeta = await ImageMetadataExtractor.extract(ctx.file, ctx.fileName, ctx.mimeType);
    ctx.metadata['imageMetadata'] = imageMeta;

    mediaEventBus.publish({
      eventType: 'MetadataExtracted',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { dimensions: imageMeta.dimensions, format: imageMeta.extension },
    });

    // 2. Generate Thumbnails (Small, Medium, Large, Square)
    const thumbnails = ThumbnailGenerator.generateThumbnails(imageMeta.dimensions, ctx.sizeBytes);
    ctx.metadata['thumbnails'] = thumbnails;

    mediaEventBus.publish({
      eventType: 'ThumbnailGenerated',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { count: thumbnails.length },
    });

    // 3. Generate Responsive Preview & Blur Placeholder
    const preview = PreviewGenerator.generatePreview(imageMeta.dimensions, ctx.sizeBytes);
    const blurPlaceholder = BlurPlaceholderGenerator.generateBlurPlaceholder(imageMeta.dimensions);
    ctx.metadata['preview'] = preview;
    ctx.metadata['blurPlaceholder'] = blurPlaceholder;

    mediaEventBus.publish({
      eventType: 'PreviewGenerated',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { previewWidth: preview.width, hasBlur: true },
    });

    // 4. Run Image Optimization
    const optimization = ImageOptimizer.optimize(ctx.sizeBytes);
    ctx.metadata['optimization'] = optimization;

    mediaEventBus.publish({
      eventType: 'MediaOptimized',
      mediaId: ctx.mediaId,
      timestamp: new Date().toISOString(),
      stageName: this.stageName,
      data: { compressionRatio: optimization.compressionRatio, savingsBytes: optimization.savingsBytes },
    });

    const durationMs = Date.now() - startTime;
    const stageResult: StageResult = {
      stageName: this.stageName,
      status: 'completed',
      durationMs,
      data: {
        dimensions: imageMeta.dimensions,
        thumbnailsCount: thumbnails.length,
        savingsBytes: optimization.savingsBytes,
      },
    };

    ctx.completedStages.push(stageResult);
    return ctx;
  }
}
