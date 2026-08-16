// Enterprise Media Platform — Upload Pipeline
// Sprint M1 Foundation

import type { IMediaStorageProvider } from '../interfaces/IMediaStorageProvider';
import { mediaValidator } from '../validation/MediaValidator';
import { mediaService } from '../../services/mediaService';
import {
  MediaStatus,
  MediaVisibility,
  type MediaAsset,
  type MediaUploadRequest,
  type MediaUploadResult,
} from '../types/media.types';

export async function computeFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Hook interface for upload pipeline extension points. */
export interface IUploadHook {
  name: string;
  execute(context: UploadPipelineContext): Promise<UploadPipelineContext>;
}

export interface UploadPipelineContext {
  request: MediaUploadRequest;
  file: File;
  userId: string;
  userEmail?: string;
  /** Generated storage path */
  storagePath?: string;
  /** Final download URL after upload */
  downloadUrl?: string;
  /** Thumbnail URL if generated */
  thumbnailUrl?: string;
  /** Extracted metadata */
  extractedMetadata?: Record<string, unknown>;
  /** Whether upload was successful */
  uploaded?: boolean;
  /** Any errors captured in the pipeline */
  errors: string[];
  /** Timing info */
  startedAt: Date;
}

/** Extension point: Virus scan hook (implement in M2+) */
export class VirusScanHook implements IUploadHook {
  readonly name = 'VirusScanHook';
  async execute(ctx: UploadPipelineContext): Promise<UploadPipelineContext> {
    // Extension point: plug in ClamAV, VirusTotal, or cloud scan API.
    // Currently a pass-through. Mark as 'pending' scan externally.
    return ctx;
  }
}

/** Extension point: Compression hook (implement in M2+) */
export class CompressionHook implements IUploadHook {
  readonly name = 'CompressionHook';
  async execute(ctx: UploadPipelineContext): Promise<UploadPipelineContext> {
    // Extension point: compress image/audio/video before upload.
    // Currently a pass-through.
    return ctx;
  }
}

/** Extension point: Thumbnail generation hook (implement in M2+) */
export class ThumbnailHook implements IUploadHook {
  readonly name = 'ThumbnailHook';
  async execute(ctx: UploadPipelineContext): Promise<UploadPipelineContext> {
    // Extension point: generate thumbnail for audio/video/PDF.
    // Currently a pass-through.
    return ctx;
  }
}

/** Metadata extraction hook */
export class MetadataExtractionHook implements IUploadHook {
  readonly name = 'MetadataExtractionHook';
  async execute(ctx: UploadPipelineContext): Promise<UploadPipelineContext> {
    const { file } = ctx;
    const metadata: Record<string, unknown> = {
      filename: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
      extension: file.name.split('.').pop()?.toLowerCase() ?? '',
      lastModified: file.lastModified,
    };

    // Calculate checksum for duplicate detection
    try {
      const checksum = await computeFileChecksum(file);
      metadata['checksum'] = checksum;
    } catch {
      // Non-fatal
    }

    // For images: extract dimensions
    if (file.type.startsWith('image/')) {
      try {
        const dimensions = await this.extractImageDimensions(file);
        metadata['width'] = dimensions.width;
        metadata['height'] = dimensions.height;
      } catch {
        // Non-fatal
      }
    }

    return { ...ctx, extractedMetadata: metadata };
  }

  private extractImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for dimension extraction'));
      };
      img.src = url;
    });
  }
}

/** Path generation utility */
function buildStoragePath(request: MediaUploadRequest, userId: string): string {
  const timestamp = Date.now();
  const ext = request.file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const safe = request.file.name
    .replace(`.${ext}`, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 60);
  const filename = `${safe}_${timestamp}.${ext}`;
  return `${request.folder}/${userId}/${filename}`;
}

/**
 * MediaUploadPipeline — Orchestrates the complete upload flow.
 *
 * Pipeline stages:
 *  1. Validation
 *  2. RBAC check
 *  3. Virus Scan (hook)
 *  4. Compression (hook)
 *  5. Thumbnail Generation (hook)
 *  6. Metadata Extraction
 *  7. Storage upload
 *  8. Result composition
 */
export class MediaUploadPipeline {
  private readonly hooks: IUploadHook[];
  private readonly storageProvider: IMediaStorageProvider;
  private readonly isAdminFn: () => Promise<boolean>;

  constructor(
    storageProvider: IMediaStorageProvider,
    isAdminFn: () => Promise<boolean>,
    hooks?: IUploadHook[]
  ) {
    this.storageProvider = storageProvider;
    this.isAdminFn = isAdminFn;
    this.hooks = hooks ?? [
      new VirusScanHook(),
      new CompressionHook(),
      new ThumbnailHook(),
      new MetadataExtractionHook(),
    ];
  }

  async execute(
    request: MediaUploadRequest,
    userId: string,
    userEmail?: string
  ): Promise<MediaUploadResult> {
    const startedAt = new Date();

    // Stage 1: Validation
    const validationResult = await mediaValidator.validate(request.file, request.type);
    if (!validationResult.valid) {
      const messages = validationResult.errors.map(e => e.message).join('; ');
      throw new Error(`Media validation failed: ${messages}`);
    }

    // Stage 2: RBAC check
    const isAdmin = await this.isAdminFn();
    if (!isAdmin) {
      throw new Error('Insufficient permissions: media upload requires admin role');
    }

    // Stage 3-6: Run hooks
    let ctx: UploadPipelineContext = {
      request,
      file: request.file,
      userId,
      userEmail,
      storagePath: buildStoragePath(request, userId),
      errors: [],
      startedAt,
    };

    for (const hook of this.hooks) {
      try {
        ctx = await hook.execute(ctx);
      } catch (err: unknown) {
        // Non-fatal hooks: log and continue
        ctx.errors.push(`Hook ${hook.name} failed: ${(err as Error)?.message ?? 'unknown error'}`);
      }
    }

    // Stage 6.5: Duplicate Detection Check
    const meta = ctx.extractedMetadata ?? {};
    if (!request.allowDuplicate && meta['checksum']) {
      const existing = await mediaService.findAssetByChecksum(meta['checksum'] as string);
      if (existing) {
        throw new Error(
          `DUPLICATE_DETECTED: A file with identical content already exists ("${
            existing.title || existing.metadata.originalFilename
          }", ID: ${existing.id})`
        );
      }
    }

    // Stage 7: Storage upload
    const uploadResult = await this.storageProvider.upload(
      ctx.storagePath!,
      request.file,
      {
        contentType: request.file.type,
        onProgress: (progress) => {
          if (request.onProgress) request.onProgress(progress);
        },
        onTaskCreated: request.onTaskCreated,
      }
    );

    // Stage 8: Compose result
    const asset: MediaAsset = {
      id: '',  // Firestore will assign on save
      type: request.type,
      category: request.category,
      status: MediaStatus.ACTIVE,
      visibility: request.visibility ?? MediaVisibility.AUTHENTICATED,
      folder: request.folder,
      storageUrl: uploadResult.downloadUrl,
      storagePath: uploadResult.storagePath,
      thumbnailUrl: ctx.thumbnailUrl,
      metadata: {
        filename: (meta['filename'] as string) ?? request.file.name,
        originalFilename: request.file.name,
        mimeType: request.file.type,
        sizeBytes: uploadResult.sizeBytes,
        extension: (meta['extension'] as string) ?? request.file.name.split('.').pop() ?? '',
        checksum: meta['checksum'] as string | undefined,
        width: meta['width'] as number | undefined,
        height: meta['height'] as number | undefined,
      },
      tags: request.tags ?? [],
      title: request.title,
      description: request.description,
      linkedEntityId: request.linkedEntityId,
      linkedEntityType: request.linkedEntityType,
      uploadedBy: userId,
      uploadedByEmail: userEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      asset,
      downloadUrl: uploadResult.downloadUrl,
      storagePath: uploadResult.storagePath,
      durationMs: Date.now() - startedAt.getTime(),
    };
  }
}
