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

export interface IUploadHook {
  name: string;
  execute(context: UploadPipelineContext): Promise<UploadPipelineContext>;
}

export interface UploadPipelineContext {
  request: MediaUploadRequest;
  file: File;
  userId: string;
  userEmail?: string;
  storagePath?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  extractedMetadata?: Record<string, unknown>;
  uploaded?: boolean;
  errors: string[];
  startedAt: Date;
}

export class VirusScanHook implements IUploadHook {
  readonly name = 'VirusScanHook';
  async execute(ctx: UploadPipelineContext): Promise<UploadPipelineContext> {
    return ctx;
  }
}

export class CompressionHook implements IUploadHook {
  readonly name = 'CompressionHook';
  async execute(ctx: UploadPipelineContext): Promise<UploadPipelineContext> {
    return ctx;
  }
}

export class ThumbnailHook implements IUploadHook {
  readonly name = 'ThumbnailHook';
  async execute(ctx: UploadPipelineContext): Promise<UploadPipelineContext> {
    return ctx;
  }
}

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

    try {
      const checksum = await computeFileChecksum(file);
      metadata['checksum'] = checksum;
    } catch {
      // Non-fatal
    }

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

    const validationResult = await mediaValidator.validate(request.file, request.type);
    if (!validationResult.valid) {
      const messages = validationResult.errors.map(e => e.message).join('; ');
      throw new Error(`Media validation failed: ${messages}`);
    }

    const isAdmin = await this.isAdminFn();
    if (!isAdmin) {
      throw new Error('Insufficient permissions: media upload requires admin role');
    }

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
        ctx.errors.push(`Hook ${hook.name} failed: ${(err as Error)?.message ?? 'unknown error'}`);
      }
    }

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

    const asset: MediaAsset = {
      id: '',
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
