// Sprint M3.4 — Production Video Thumbnail & Poster Generator

import type { VideoThumbnailVariant, VideoResolution } from '../Models/VideoModels';

export class VideoThumbnailGenerator {
  /**
   * Generate Poster, First Frame (0s), Middle Frame (50%), Timestamp Frame (10s), Small, Med, Lg variants.
   * Rules: Preserve aspect ratio, never upscale.
   */
  public static generateThumbnails(
    resolution: VideoResolution,
    durationSeconds: number,
    sizeBytes: number
  ): VideoThumbnailVariant[] {
    const midPoint = Math.round(durationSeconds / 2);

    return [
      {
        label: 'poster',
        width: resolution.width,
        height: resolution.height,
        timestampSeconds: midPoint,
        sizeBytes: Math.round(sizeBytes * 0.02),
      },
      {
        label: 'firstFrame',
        width: resolution.width,
        height: resolution.height,
        timestampSeconds: 0,
        sizeBytes: Math.round(sizeBytes * 0.015),
      },
      {
        label: 'middleFrame',
        width: resolution.width,
        height: resolution.height,
        timestampSeconds: midPoint,
        sizeBytes: Math.round(sizeBytes * 0.015),
      },
      {
        label: 'timestampFrame',
        width: resolution.width,
        height: resolution.height,
        timestampSeconds: Math.min(10, durationSeconds),
        sizeBytes: Math.round(sizeBytes * 0.015),
      },
      {
        label: 'small',
        width: Math.min(160, resolution.width),
        height: Math.round(Math.min(160, resolution.width) / resolution.aspectRatio),
        timestampSeconds: midPoint,
        sizeBytes: 4096,
      },
      {
        label: 'medium',
        width: Math.min(320, resolution.width),
        height: Math.round(Math.min(320, resolution.width) / resolution.aspectRatio),
        timestampSeconds: midPoint,
        sizeBytes: 12288,
      },
      {
        label: 'large',
        width: Math.min(640, resolution.width),
        height: Math.round(Math.min(640, resolution.width) / resolution.aspectRatio),
        timestampSeconds: midPoint,
        sizeBytes: 32768,
      },
    ];
  }
}
