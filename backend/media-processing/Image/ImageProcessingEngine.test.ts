// Sprint M3.2 — Enterprise Image Processing Engine Test Suite

import { describe, it, expect } from 'vitest';
import { ImageMetadataExtractor, ImageSecurityException } from '../Image/Metadata/ImageMetadataExtractor';
import { ThumbnailGenerator } from '../Image/Generators/ThumbnailGenerator';
import { PreviewGenerator, BlurPlaceholderGenerator } from '../Image/Generators/PreviewGenerator';
import { ImageOptimizer } from '../Image/Optimizers/ImageOptimizer';
import { ImageProcessingStage } from '../Image/Processors/ImageProcessingStage';
import { MediaProcessingPipeline } from '../Pipelines/MediaProcessingPipeline';
import type { ProcessingContext } from '../Interfaces/IMediaProcessingPipeline';

describe('Sprint M3.2 Enterprise Image Processing Engine', () => {
  it('ImageMetadataExtractor extracts dimensions, format, and EXIF summary', async () => {
    const mockBuffer = Buffer.alloc(100);
    const meta = await ImageMetadataExtractor.extract(mockBuffer, 'sample_photo.jpg', 'image/jpeg');

    expect(meta.extension).toBe('jpg');
    expect(meta.mimeType).toBe('image/jpeg');
    expect(meta.dimensions.width).toBeGreaterThan(0);
    expect(meta.dimensions.height).toBeGreaterThan(0);
    expect(meta.exif).toBeDefined();
    expect(meta.exif?.cameraMake).toBe('Canon');
  });

  it('ImageMetadataExtractor rejects unsupported formats with ImageSecurityException', async () => {
    const mockBuffer = Buffer.alloc(50);
    await expect(
      ImageMetadataExtractor.extract(mockBuffer, 'script.exe', 'application/x-msdownload')
    ).rejects.toThrow(ImageSecurityException);
  });

  it('ThumbnailGenerator creates 4 proportional non-upscaled variants', () => {
    const dims = { width: 1920, height: 1080, aspectRatio: 1.78 };
    const thumbs = ThumbnailGenerator.generateThumbnails(dims, 500000);

    expect(thumbs.length).toBe(4);
    const small = thumbs.find((t) => t.sizeLabel === 'small');
    const square = thumbs.find((t) => t.sizeLabel === 'square');

    expect(small?.width).toBe(150);
    expect(square?.width).toBe(200);
    expect(square?.height).toBe(200);
  });

  it('PreviewGenerator & BlurPlaceholderGenerator generate responsive previews', () => {
    const dims = { width: 2400, height: 1600, aspectRatio: 1.5 };
    const preview = PreviewGenerator.generatePreview(dims, 800000);
    const blur = BlurPlaceholderGenerator.generateBlurPlaceholder(dims);

    expect(preview.width).toBe(1280);
    expect(preview.progressive).toBe(true);
    expect(blur.dataUrl).toContain('data:image/svg+xml');
  });

  it('ImageOptimizer calculates lossless compression savings', () => {
    const opt = ImageOptimizer.optimize(100000, 85, true);

    expect(opt.originalSizeBytes).toBe(100000);
    expect(opt.optimizedSizeBytes).toBeLessThan(100000);
    expect(opt.compressionRatio).toBeGreaterThan(0);
    expect(opt.strippedMetadata).toBe(true);
  });

  it('MediaProcessingPipeline executes ImageProcessingStage end-to-end', async () => {
    const pipeline = new MediaProcessingPipeline([new ImageProcessingStage()]);
    const mockContext: ProcessingContext = {
      mediaId: 'img_test_101',
      file: Buffer.alloc(1024),
      fileName: 'gallery_photo.png',
      mimeType: 'image/png',
      sizeBytes: 1024,
      storagePath: 'images/gallery_photo.png',
      metadata: {},
      completedStages: [],
      errors: [],
      cancelled: false,
      retryCount: 0,
    };

    const resultCtx = await pipeline.execute(mockContext);

    expect(resultCtx.completedStages.length).toBe(1);
    expect(resultCtx.metadata['imageMetadata']).toBeDefined();
    expect(resultCtx.metadata['thumbnails']).toBeDefined();
    expect(resultCtx.metadata['preview']).toBeDefined();
    expect(resultCtx.metadata['blurPlaceholder']).toBeDefined();
    expect(resultCtx.metadata['optimization']).toBeDefined();
  });
});
