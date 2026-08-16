// Enterprise Media Platform — Validation Layer
// Sprint M1 Foundation

import {
  MediaType,
  MediaValidationErrorCode,
  type MediaValidationResult,
  type MediaValidationError,
} from '../types/media.types';

export interface MediaValidationConfig {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSizeBytes: number;
  maxFilenameLength?: number;
  requireChecksum?: boolean;
}

export const MEDIA_VALIDATION_CONFIGS: Record<MediaType, MediaValidationConfig> = {
  [MediaType.AUDIO]: {
    allowedMimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a'],
    allowedExtensions: ['mp3', 'mp4', 'm4a', 'wav', 'ogg', 'aac'],
    maxSizeBytes: 50 * 1024 * 1024, // 50 MB
    maxFilenameLength: 200,
  },
  [MediaType.IMAGE]: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    maxFilenameLength: 200,
  },
  [MediaType.BANNER]: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    maxFilenameLength: 200,
  },
  [MediaType.PDF]: {
    allowedMimeTypes: ['application/pdf'],
    allowedExtensions: ['pdf'],
    maxSizeBytes: 20 * 1024 * 1024, // 20 MB
    maxFilenameLength: 200,
  },
  [MediaType.VIDEO]: {
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    allowedExtensions: ['mp4', 'webm', 'mov'],
    maxSizeBytes: 500 * 1024 * 1024, // 500 MB
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
    maxSizeBytes: 20 * 1024 * 1024, // 20 MB
    maxFilenameLength: 200,
  },
};

// MIME type sniffing using file magic bytes
const MAGIC_BYTES: Array<{ bytes: number[]; offset: number; mimeType: string }> = [
  { bytes: [0xFF, 0xFB], offset: 0, mimeType: 'audio/mpeg' },
  { bytes: [0x49, 0x44, 0x33], offset: 0, mimeType: 'audio/mpeg' }, // ID3
  { bytes: [0x25, 0x50, 0x44, 0x46], offset: 0, mimeType: 'application/pdf' }, // %PDF
  { bytes: [0xFF, 0xD8, 0xFF], offset: 0, mimeType: 'image/jpeg' },
  { bytes: [0x89, 0x50, 0x4E, 0x47], offset: 0, mimeType: 'image/png' },
  { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, mimeType: 'audio/wav' }, // RIFF/WAV
];

export class MediaValidator {
  /**
   * Validate a file against the rules for its MediaType.
   */
  async validate(file: File, type: MediaType): Promise<MediaValidationResult> {
    const config = MEDIA_VALIDATION_CONFIGS[type];
    const errors: MediaValidationError[] = [];
    const warnings: Array<{ code: string; message: string }> = [];

    // 1. Validate MIME type (browser-declared)
    const mimeError = this.validateMimeType(file.type, config.allowedMimeTypes);
    if (mimeError) errors.push(mimeError);

    // 2. Validate extension
    const extError = this.validateExtension(file.name, config.allowedExtensions);
    if (extError) errors.push(extError);

    // 3. Validate size
    const sizeError = this.validateSize(file.size, config.maxSizeBytes);
    if (sizeError) errors.push(sizeError);

    // 4. Validate filename
    const filenameError = this.validateFilename(file.name, config.maxFilenameLength ?? 200);
    if (filenameError) errors.push(filenameError);

    // 5. Magic byte check (async read of first 8 bytes) — non-blocking warning
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
      };
    }
    return null;
  }

  private validateSize(sizeBytes: number, maxBytes: number): MediaValidationError | null {
    if (sizeBytes > maxBytes) {
      const maxMB = Math.round(maxBytes / 1024 / 1024);
      const actualMB = (sizeBytes / 1024 / 1024).toFixed(1);
      return {
        code: MediaValidationErrorCode.FILE_TOO_LARGE,
        message: `File is ${actualMB}MB, maximum allowed is ${maxMB}MB`,
        field: 'size',
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
      };
    }
    // eslint-disable-next-line no-control-regex
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
      // Non-fatal — proceed without magic byte validation
    }
    return null;
  }

  /**
   * Extension point: plug in a duplicate detection function.
   * Returns a validation error if a duplicate is found.
   */
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
      // Non-fatal — do not block upload on duplicate check failure
    }
    return null;
  }
}

export const mediaValidator = new MediaValidator();
