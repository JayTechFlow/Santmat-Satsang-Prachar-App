// Sprint M3.4 — Responsive Video Preview & Streaming Abstraction Generator

import type { VideoPreviewVariant, VideoResolution } from '../Models/VideoModels';

export class VideoPreviewGenerator {
  public static generatePreview(
    storagePath: string,
    resolution: VideoResolution,
    durationSeconds: number,
    sizeBytes: number
  ): VideoPreviewVariant {
    const previewClipDuration = Math.min(15, durationSeconds);
    const targetWidth = Math.min(1280, resolution.width);
    const targetHeight = Math.round(targetWidth / resolution.aspectRatio);

    const estimatedSizeBytes = Math.round((sizeBytes / (durationSeconds || 1)) * previewClipDuration * 0.7);

    return {
      previewClipDurationSeconds: previewClipDuration,
      posterUrlPlaceholder: `${storagePath}_poster.jpg`,
      streamingPreviewUrlPlaceholder: `${storagePath}#t=0,${previewClipDuration}`,
      targetWidth,
      targetHeight,
      bitrateKbps: 2500,
      estimatedSizeBytes,
    };
  }
}
