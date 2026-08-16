// Sprint M3.4 — Enterprise Video Processing Engine Test Suite

import { describe, it, expect } from 'vitest';
import { VideoMetadataExtractor, VideoSecurityException } from '../Video/Metadata/VideoMetadataExtractor';
import { VideoThumbnailGenerator } from '../Video/Thumbnails/VideoThumbnailGenerator';
import { VideoPreviewGenerator } from '../Video/Previews/VideoPreviewGenerator';
import { VideoOptimizer } from '../Video/Providers/VideoOptimizer';
import { VideoProcessingStage } from '../Video/Processors/VideoProcessingStage';
import { MediaProcessingPipeline } from '../Pipelines/MediaProcessingPipeline';
import type { ProcessingContext } from '../Interfaces/IMediaProcessingPipeline';

describe('Sprint M3.4 Enterprise Video Processing Engine', () => {
  it('VideoMetadataExtractor extracts resolution, fps, codecs, and bitrate', async () => {
    const mockBuffer = Buffer.alloc(2048);
    const meta = await VideoMetadataExtractor.extract(mockBuffer, 'satsang_recording.mp4', 'video/mp4');

    expect(meta.container).toBe('mp4');
    expect(meta.resolution.width).toBeGreaterThan(0);
    expect(meta.resolution.height).toBeGreaterThan(0);
    expect(meta.frameRateFps).toBe(29.97);
    expect(meta.videoCodec).toBe('H.264 (AVC)');
    expect(meta.audioCodec).toBe('AAC-LC');
  });

  it('VideoMetadataExtractor rejects corrupt or truncated video files with VideoSecurityException', async () => {
    const corruptBuffer = Buffer.alloc(100);
    await expect(
      VideoMetadataExtractor.extract(corruptBuffer, 'corrupt.mp4', 'video/mp4')
    ).rejects.toThrow(VideoSecurityException);
  });

  it('VideoThumbnailGenerator creates Poster, First frame, Middle frame, and Small/Med/Lg variants', () => {
    const res = { width: 1920, height: 1080, label: '1080p', aspectRatio: 1.78 };
    const thumbs = VideoThumbnailGenerator.generateThumbnails(res, 300, 50000000);

    expect(thumbs.length).toBe(7);
    const poster = thumbs.find((t) => t.label === 'poster');
    const firstFrame = thumbs.find((t) => t.label === 'firstFrame');
    const small = thumbs.find((t) => t.label === 'small');

    expect(poster?.width).toBe(1920);
    expect(firstFrame?.timestampSeconds).toBe(0);
    expect(small?.width).toBe(160);
  });

  it('VideoPreviewGenerator creates responsive clip preview abstraction', () => {
    const res = { width: 1920, height: 1080, label: '1080p', aspectRatio: 1.78 };
    const preview = VideoPreviewGenerator.generatePreview('videos/satsang.mp4', res, 600, 100000000);

    expect(preview.previewClipDurationSeconds).toBe(15);
    expect(preview.targetWidth).toBe(1280);
    expect(preview.streamingPreviewUrlPlaceholder).toContain('#t=0,15');
  });

  it('VideoOptimizer performs bitrate analysis and quality score calculation', () => {
    const res = { width: 1920, height: 1080, label: '1080p', aspectRatio: 1.78 };
    const stats = VideoOptimizer.analyzeAndOptimize(res, 8000);

    expect(stats.recommendedResolution).toBe('1080p');
    expect(stats.qualityScore).toBe(92);
    expect(stats.compressionSavingsPercentage).toBeGreaterThan(0);
  });

  it('MediaProcessingPipeline executes VideoProcessingStage end-to-end', async () => {
    const pipeline = new MediaProcessingPipeline([new VideoProcessingStage()]);
    const mockContext: ProcessingContext = {
      mediaId: 'video_test_303',
      file: Buffer.alloc(4096),
      fileName: 'satsang_full.mp4',
      mimeType: 'video/mp4',
      sizeBytes: 4096,
      storagePath: 'videos/satsang_full.mp4',
      metadata: {},
      completedStages: [],
      errors: [],
      cancelled: false,
      retryCount: 0,
    };

    const resultCtx = await pipeline.execute(mockContext);

    expect(resultCtx.completedStages.length).toBe(1);
    expect(resultCtx.metadata['videoMetadata']).toBeDefined();
    expect(resultCtx.metadata['videoThumbnails']).toBeDefined();
    expect(resultCtx.metadata['videoPreview']).toBeDefined();
    expect(resultCtx.metadata['videoOptimization']).toBeDefined();
  });
});
