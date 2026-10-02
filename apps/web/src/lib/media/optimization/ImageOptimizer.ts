import { ServiceResponse } from '../../../types/common/index';

export interface ImageOptimizationResult {
  file: File;
  original: {
    sizeBytes: number;
    width: number;
    height: number;
    mimeType: string;
  };
  optimized: {
    sizeBytes: number;
    width: number;
    height: number;
    mimeType: string;
    compressionRatio: number;
  };
}

export class ImageOptimizer {
  /**
   * Resizes and compresses an image in the browser canvas environment
   */
  static async optimize(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      preferredMimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
    } = {}
  ): Promise<ServiceResponse<ImageOptimizationResult>> {
    // 0. Safety checks for non-image inputs
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File is not an image' };
    }

    // SVG files should not be canvas-optimized as it removes XML vector definitions
    if (file.type === 'image/svg+xml') {
      return {
        success: true,
        data: {
          file,
          original: { sizeBytes: file.size, width: 0, height: 0, mimeType: file.type },
          optimized: { sizeBytes: file.size, width: 0, height: 0, mimeType: file.type, compressionRatio: 1.0 },
        },
      };
    }

    try {
      // 1. Load file into Image object
      const img = await this.loadImage(file);

      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;

      // 2. Proportional target dimension calculations (NO upscaling)
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;
      const maxW = options.maxWidth ?? 1920;
      const maxH = options.maxHeight ?? 1080;

      if (targetWidth > maxW || targetHeight > maxH) {
        const ratio = Math.min(maxW / targetWidth, maxH / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      // 3. Create Canvas and draw
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { success: false, error: 'Failed to initialize canvas context' };
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // 4. Export type determination
      // Transparent PNG/WebP files should remain WebP or PNG to retain transparency alpha channel
      const isTransparentFormat = file.type === 'image/png' || file.type === 'image/webp';
      const exportMimeType = options.preferredMimeType ?? (isTransparentFormat ? 'image/webp' : 'image/jpeg');
      const quality = options.quality ?? 0.82; // 0.82 balances file-size and visual quality perfectly

      // 5. Canvas blob generation
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), exportMimeType, quality);
      });

      // 6. Size efficiency checks. If optimization yields larger size, fallback to original file (only if original is within dimensions limit)
      const isOriginalDimensionsValid = originalWidth <= maxW && originalHeight <= maxH;
      if (!blob || (blob.size >= file.size && isOriginalDimensionsValid)) {
        return {
          success: true,
          data: {
            file,
            original: {
              sizeBytes: file.size,
              width: originalWidth,
              height: originalHeight,
              mimeType: file.type,
            },
            optimized: {
              sizeBytes: file.size,
              width: originalWidth,
              height: originalHeight,
              mimeType: file.type,
              compressionRatio: 1.0,
            },
          },
        };
      }

      // 7. Output new File object
      const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const newExtension = exportMimeType === 'image/webp' ? '.webp' : exportMimeType === 'image/png' ? '.png' : '.jpg';
      const optimizedFile = new File([blob], `${originalNameWithoutExt}${newExtension}`, {
        type: exportMimeType,
        lastModified: Date.now(),
      });

      const compressionRatio = Number((file.size / blob.size).toFixed(2));

      return {
        success: true,
        data: {
          file: optimizedFile,
          original: {
            sizeBytes: file.size,
            width: originalWidth,
            height: originalHeight,
            mimeType: file.type,
          },
          optimized: {
            sizeBytes: blob.size,
            width: targetWidth,
            height: targetHeight,
            mimeType: exportMimeType,
            compressionRatio,
          },
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Image optimization failed' };
    }
  }

  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image file'));
      };
      img.src = url;
    });
  }
}
