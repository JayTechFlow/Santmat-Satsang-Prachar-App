import {
  MediaType,
  MediaValidationErrorCode,
  type MediaValidationResult,
  type MediaValidationError,
} from '../types/media.types';
import { AUDIO_MAX_UPLOAD_BYTES } from '../constants/media.constants';

export interface MediaValidationConfig {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSizeBytes: number;
  maxFilenameLength?: number;
  requireChecksum?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  aspectRatioTolerance?: number;
}

export const MEDIA_VALIDATION_CONFIGS: Record<string, MediaValidationConfig> = {
  [MediaType.AUDIO]: {
    allowedMimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a'],
    allowedExtensions: ['mp3', 'mp4', 'm4a', 'wav', 'ogg', 'aac'],
    maxSizeBytes: AUDIO_MAX_UPLOAD_BYTES,
    maxFilenameLength: 200,
  },
  [MediaType.IMAGE]: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    maxSizeBytes: 5 * 1024 * 1024,
    maxFilenameLength: 200,
  },
  [MediaType.BANNER]: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSizeBytes: 3 * 1024 * 1024,
    maxFilenameLength: 200,
    maxWidth: 1920,
    maxHeight: 1080,
    aspectRatio: 16 / 9,
    aspectRatioTolerance: 0.05,
  },
  [MediaType.PDF]: {
    allowedMimeTypes: ['application/pdf'],
    allowedExtensions: ['pdf'],
    maxSizeBytes: 20 * 1024 * 1024,
    maxFilenameLength: 200,
  },
  [MediaType.VIDEO]: {
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    allowedExtensions: ['mp4', 'webm', 'mov'],
    maxSizeBytes: 500 * 1024 * 1024,
    maxFilenameLength: 200,
  },
  [MediaType.DOCUMENT]: {
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    allowedExtensions: ['pdf', 'doc', 'docx', 'txt'],
    maxSizeBytes: 20 * 1024 * 1024,
    maxFilenameLength: 200,
  },
  // Category-specific overrides
  'stuti_vinati': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSizeBytes: 2 * 1024 * 1024,
    maxFilenameLength: 200,
    maxWidth: 1200,
    maxHeight: 675,
    aspectRatio: 16 / 9,
    aspectRatioTolerance: 0.05,
  },
  'book_cover': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSizeBytes: 2 * 1024 * 1024,
    maxFilenameLength: 200,
    maxWidth: 1600,
    maxHeight: 2400,
    aspectRatio: 2 / 3,
    aspectRatioTolerance: 0.05,
  },
  'avatar': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSizeBytes: 1 * 1024 * 1024,
    maxFilenameLength: 200,
    maxWidth: 512,
    maxHeight: 512,
    aspectRatio: 1.0,
    aspectRatioTolerance: 0.05,
  },
  'bhajan_thumbnail': {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSizeBytes: 1.5 * 1024 * 1024,
    maxFilenameLength: 200,
    maxWidth: 1200,
    maxHeight: 1200,
    aspectRatio: 1.0,
    aspectRatioTolerance: 0.05,
  }
};

const MAGIC_BYTES: Array<{ bytes: number[]; offset: number; mimeType: string }> = [
  { bytes: [0xFF, 0xFB], offset: 0, mimeType: 'audio/mpeg' },
  { bytes: [0x49, 0x44, 0x33], offset: 0, mimeType: 'audio/mpeg' },
  { bytes: [0x25, 0x50, 0x44, 0x46], offset: 0, mimeType: 'application/pdf' },
  { bytes: [0xFF, 0xD8, 0xFF], offset: 0, mimeType: 'image/jpeg' },
  { bytes: [0x89, 0x50, 0x4E, 0x47], offset: 0, mimeType: 'image/png' },
  { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, mimeType: 'audio/wav' },
];

export class MediaValidator {
  async validate(file: File, type: MediaType, category?: string, skipDimensions = false): Promise<MediaValidationResult> {
    const policyKey = category && MEDIA_VALIDATION_CONFIGS[category] ? category : type;
    const config = MEDIA_VALIDATION_CONFIGS[policyKey] || MEDIA_VALIDATION_CONFIGS[type];
    const errors: MediaValidationError[] = [];
    const warnings: Array<{ code: string; message: string }> = [];

    const mimeError = this.validateMimeType(file.type, config.allowedMimeTypes);
    if (mimeError) errors.push(mimeError);

    const extError = this.validateExtension(file.name, config.allowedExtensions);
    if (extError) errors.push(extError);

    const sizeError = this.validateSize(file.size, config.maxSizeBytes, file.type.startsWith('image/'));
    if (sizeError) errors.push(sizeError);

    const filenameError = this.validateFilename(file.name, config.maxFilenameLength ?? 200);
    if (filenameError) errors.push(filenameError);

    // If it's a valid image layout wise, run dimension, aspect ratio, and corruption validations
    if (errors.length === 0 && file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      if (!skipDimensions) {
        const imgErrors = await this.validateImage(file, config);
        errors.push(...imgErrors);
      }
    }

    if (errors.length === 0) {
      const magicWarning = await this.validateMagicBytes(file);
      if (magicWarning) {
        warnings.push({ code: 'MAGIC_BYTE_MISMATCH', message: magicWarning });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private validateMimeType(mimeType: string, allowed: string[]): MediaValidationError | null {
    if (!mimeType || !allowed.includes(mimeType)) {
      return {
        code: MediaValidationErrorCode.INVALID_MIME_TYPE,
        message: `Invalid MIME type: ${mimeType || 'unknown'}. Allowed: ${allowed.join(', ')}`,
        field: 'mimeType',
        actualValue: mimeType || 'unknown',
        expectedValue: allowed.join(', '),
      };
    }
    return null;
  }

  private validateExtension(filename: string, allowed: string[]): MediaValidationError | null {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) {
      return {
        code: MediaValidationErrorCode.INVALID_EXTENSION,
        message: `Invalid extension: .${ext ?? 'none'}. Allowed: ${allowed.join(', ')}`,
        field: 'extension',
        actualValue: ext ?? 'none',
        expectedValue: allowed.join(', '),
      };
    }
    return null;
  }

  private validateSize(sizeBytes: number, maxBytes: number, isImage: boolean): MediaValidationError | null {
    if (sizeBytes > maxBytes) {
      const maxMB = Math.round(maxBytes / 1024 / 1024);
      const actualMB = (sizeBytes / 1024 / 1024).toFixed(1);
      return {
        code: isImage ? 'IMAGE_TOO_LARGE' : MediaValidationErrorCode.FILE_TOO_LARGE,
        message: `File is ${actualMB}MB, maximum allowed is ${maxMB}MB`,
        field: 'size',
        actualValue: `${actualMB}MB`,
        expectedValue: `${maxMB}MB`,
      };
    }
    return null;
  }

  private validateFilename(filename: string, maxLength: number): MediaValidationError | null {
    if (!filename || filename.trim().length === 0) {
      return {
        code: MediaValidationErrorCode.INVALID_FILENAME,
        message: 'Filename is required',
        field: 'filename',
      };
    }
    if (filename.length > maxLength) {
      return {
        code: MediaValidationErrorCode.INVALID_FILENAME,
        message: `Filename exceeds maximum length of ${maxLength} characters`,
        field: 'filename',
        actualValue: `${filename.length} chars`,
        expectedValue: `${maxLength} chars`,
      };
    }
    const invalidChars = /[<>:"/\\|?*\u0000-\u001F]/;
    if (invalidChars.test(filename)) {
      return {
        code: MediaValidationErrorCode.INVALID_FILENAME,
        message: 'Filename contains invalid characters',
        field: 'filename',
      };
    }
    return null;
  }

  private validateImage(file: File, config: MediaValidationConfig): Promise<MediaValidationError[]> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const errors: MediaValidationError[] = [];
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const actualRatio = width / height;

        if (config.maxWidth && width > config.maxWidth) {
          errors.push({
            code: 'IMAGE_DIMENSION_TOO_LARGE',
            message: `Image width is ${width}px, maximum allowed is ${config.maxWidth}px`,
            field: 'width',
            actualValue: `${width}px`,
            expectedValue: `${config.maxWidth}px`,
          });
        }

        if (config.maxHeight && height > config.maxHeight) {
          errors.push({
            code: 'IMAGE_DIMENSION_TOO_LARGE',
            message: `Image height is ${height}px, maximum allowed is ${config.maxHeight}px`,
            field: 'height',
            actualValue: `${height}px`,
            expectedValue: `${config.maxHeight}px`,
          });
        }

        if (config.aspectRatio) {
          const tolerance = config.aspectRatioTolerance ?? 0.05;
          if (Math.abs(actualRatio - config.aspectRatio) > tolerance) {
            errors.push({
              code: 'IMAGE_ASPECT_RATIO_INVALID',
              message: `Image aspect ratio is ${actualRatio.toFixed(2)}, expected ${config.aspectRatio.toFixed(2)}`,
              field: 'aspectRatio',
              actualValue: actualRatio.toFixed(2),
              expectedValue: config.aspectRatio.toFixed(2),
            });
          }
        }

        resolve(errors);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve([
          {
            code: 'IMAGE_CORRUPTED',
            message: 'The image file is corrupted or cannot be read',
            field: 'file',
          },
        ]);
      };
      img.src = url;
    });
  }

  private async validateMagicBytes(file: File): Promise<string | null> {
    try {
      const slice = await file.slice(0, 8).arrayBuffer();
      const bytes = Array.from(new Uint8Array(slice));
      for (const signature of MAGIC_BYTES) {
        const match = signature.bytes.every(
          (b, i) => bytes[signature.offset + i] === b
        );
        if (match && !file.type.includes(signature.mimeType.split('/')[1]!)) {
          return `File content suggests ${signature.mimeType} but declared as ${file.type}`;
        }
      }
    } catch {
      // Non-fatal
    }
    return null;
  }

  async checkDuplicate(
    checkFn: () => Promise<boolean>
  ): Promise<MediaValidationError | null> {
    try {
      const isDuplicate = await checkFn();
      if (isDuplicate) {
        return {
          code: MediaValidationErrorCode.DUPLICATE_DETECTED,
          message: 'A file with the same content already exists',
        };
      }
    } catch {
      // Non-fatal
    }
    return null;
  }
}

export const mediaValidator = new MediaValidator();
export default mediaValidator;
