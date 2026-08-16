// Sprint M3.2 — Production Thumbnail Generator Engine

import type { ThumbnailVariant, ImageDimensions } from '../Models/ImageModels';

export class ThumbnailGenerator {
  /**
   * Generate Small (150px), Medium (300px), Large (600px), and Square (200x200) thumbnail variants.
   * Rules: Preserve aspect ratio, never upscale if original dimension is smaller.
   */
  public static generateThumbnails(
    originalDimensions: ImageDimensions,
    originalSizeBytes: number
  ): ThumbnailVariant[] {
    const targets: { label: 'small' | 'medium' | 'large' | 'square'; maxW: number; maxH: number; square?: boolean }[] = [
      { label: 'small', maxW: 150, maxH: 150 },
      { label: 'medium', maxW: 300, maxH: 300 },
      { label: 'large', maxW: 600, maxH: 600 },
      { label: 'square', maxW: 200, maxH: 200, square: true },
    ];

    return targets.map((t) => {
      let width = t.maxW;
      let height = t.maxH;

      if (t.square) {
        width = Math.min(t.maxW, originalDimensions.width);
        height = width;
      } else {
        // Aspect-preserving scaling (never upscale)
        if (originalDimensions.width <= t.maxW && originalDimensions.height <= t.maxH) {
          width = originalDimensions.width;
          height = originalDimensions.height;
        } else if (originalDimensions.aspectRatio >= 1) {
          width = Math.min(t.maxW, originalDimensions.width);
          height = Math.round(width / originalDimensions.aspectRatio);
        } else {
          height = Math.min(t.maxH, originalDimensions.height);
          width = Math.round(height * originalDimensions.aspectRatio);
        }
      }

      // Estimated optimized thumb size
      const scaleFactor = (width * height) / (originalDimensions.width * originalDimensions.height || 1);
      const estimatedSize = Math.max(1024, Math.round(originalSizeBytes * scaleFactor * 0.4));

      return {
        sizeLabel: t.label,
        width,
        height,
        sizeBytes: estimatedSize,
      };
    });
  }
}
