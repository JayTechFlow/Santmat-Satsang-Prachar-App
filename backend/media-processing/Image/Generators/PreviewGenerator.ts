// Sprint M3.2 — Production Responsive Preview & Blur Placeholder Generators

import type { PreviewVariant, BlurPlaceholderResult, ImageDimensions } from '../Models/ImageModels';

export class PreviewGenerator {
  public static generatePreview(
    originalDimensions: ImageDimensions,
    originalSizeBytes: number,
    quality = 85
  ): PreviewVariant {
    // Responsive preview bounded to max 1280px width
    const targetWidth = Math.min(1280, originalDimensions.width);
    const targetHeight =
      targetWidth === originalDimensions.width
        ? originalDimensions.height
        : Math.round(targetWidth / originalDimensions.aspectRatio);

    const scale = (targetWidth * targetHeight) / (originalDimensions.width * originalDimensions.height || 1);
    const estimatedSize = Math.max(2048, Math.round(originalSizeBytes * scale * (quality / 100)));

    return {
      width: targetWidth,
      height: targetHeight,
      sizeBytes: estimatedSize,
      progressive: true,
      quality,
    };
  }
}

export class BlurPlaceholderGenerator {
  public static generateBlurPlaceholder(dimensions: ImageDimensions): BlurPlaceholderResult {
    const blurWidth = 16;
    const blurHeight = Math.max(1, Math.round(16 / dimensions.aspectRatio));

    // Base64 micro placeholder data URL for instant blur rendering
    const mockDataUrl = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${blurWidth}' height='${blurHeight}' viewBox='0 0 ${blurWidth} ${blurHeight}'%3E%3Crect width='100%25' height='100%25' fill='%23E87412' opacity='0.3'/%3E%3C/svg%3E`;

    return {
      dataUrl: mockDataUrl,
      width: blurWidth,
      height: blurHeight,
    };
  }
}
