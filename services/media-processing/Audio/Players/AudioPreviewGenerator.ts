// Sprint M3.3 — Audio Streaming & 30-Second Preview Generator

import type { AudioPreviewVariant } from '../Models/AudioModels';

export class AudioPreviewGenerator {
  public static generatePreview(
    storagePath: string,
    totalDurationSeconds: number,
    sizeBytes: number
  ): AudioPreviewVariant {
    const previewDuration = Math.min(30, totalDurationSeconds);
    const estimatedSizeBytes = Math.round((sizeBytes / (totalDurationSeconds || 1)) * previewDuration);

    return {
      previewDurationSeconds: previewDuration,
      streamingUrlPlaceholder: `${storagePath}#t=0,${previewDuration}`,
      is30SecondSample: totalDurationSeconds >= 30,
      bitrateKbps: 192,
      sizeBytes: estimatedSizeBytes,
    };
  }
}
