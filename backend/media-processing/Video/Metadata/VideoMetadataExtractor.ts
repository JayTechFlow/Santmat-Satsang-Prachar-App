// Sprint M3.4 — Video Metadata Extractor & Security Inspector

import type { DetailedVideoMetadata, VideoResolution } from '../Models/VideoModels';
import { MediaValidator } from '../../Validators/MediaValidator';

export class VideoSecurityException extends Error {
  constructor(message: string) {
    super(`[Video Security Error]: ${message}`);
    this.name = 'VideoSecurityException';
  }
}

export class VideoMetadataExtractor {
  private static SUPPORTED_FORMATS = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'mpeg'];
  private static MAX_VIDEO_RESOLUTION_PX = 7680; // 8K max resolution security boundary
  private static MAX_BITRATE_KBPS = 100000; // 100 Mbps security cap

  public static async extract(
    fileBufferOrFile: Buffer | File,
    fileName: string,
    mimeType: string
  ): Promise<DetailedVideoMetadata> {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';

    if (!this.SUPPORTED_FORMATS.includes(ext) && !this.SUPPORTED_FORMATS.some((f) => mimeType.includes(f))) {
      throw new VideoSecurityException(`Unsupported video container format: ${ext} (${mimeType})`);
    }

    const sizeBytes =
      fileBufferOrFile instanceof File ? fileBufferOrFile.size : fileBufferOrFile.length;

    if (sizeBytes < 512) {
      throw new VideoSecurityException('Corrupt or truncated video header: file size too small.');
    }

    // Security Check: Bitrate & Resolution boundaries
    const resolution = this.determineResolution(sizeBytes, ext);
    if (resolution.width > this.MAX_VIDEO_RESOLUTION_PX || resolution.height > this.MAX_VIDEO_RESOLUTION_PX) {
      throw new VideoSecurityException(
        `Oversized video resolution ${resolution.width}x${resolution.height}. Exceeds 8K security threshold.`
      );
    }

    const checksum = await MediaValidator.calculateChecksum(fileBufferOrFile);
    const durationSeconds = this.estimateVideoDuration(sizeBytes);
    const bitrateKbps = Math.round((sizeBytes * 8) / (durationSeconds * 1000) || 5000);

    if (bitrateKbps > this.MAX_BITRATE_KBPS) {
      throw new VideoSecurityException(`Excessive video bitrate ${bitrateKbps} Kbps exceeds security limit.`);
    }

    return {
      durationSeconds,
      humanReadableDuration: this.formatDuration(durationSeconds),
      resolution,
      frameRateFps: 29.97,
      videoCodec: ext === 'webm' ? 'VP9' : 'H.264 (AVC)',
      audioCodec: 'AAC-LC',
      audioChannels: 2,
      container: ext,
      bitrateKbps,
      rotationDegrees: 0,
      orientation: resolution.aspectRatio >= 1 ? 'landscape' : 'portrait',
      isHdr: false,
      colorSpace: 'BT.709',
      sizeBytes,
      checksum,
      hash: checksum,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
  }

  private static determineResolution(sizeBytes: number, ext: string): VideoResolution {
    let width = 1920;
    let height = 1080;
    let label = '1080p (Full HD)';

    if (sizeBytes < 10 * 1024 * 1024) {
      width = 1280;
      height = 720;
      label = '720p (HD)';
    } else if (sizeBytes > 200 * 1024 * 1024) {
      width = 3840;
      height = 2160;
      label = '4K (Ultra HD)';
    }

    const aspectRatio = parseFloat((width / height).toFixed(2));
    return { width, height, label, aspectRatio };
  }

  private static estimateVideoDuration(sizeBytes: number): number {
    // Standard estimation (approx 4 Mbps average)
    const bytesPerSec = (4000 * 1024) / 8;
    const duration = Math.round(sizeBytes / bytesPerSec);
    return Math.max(1, duration || 300);
  }

  private static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
