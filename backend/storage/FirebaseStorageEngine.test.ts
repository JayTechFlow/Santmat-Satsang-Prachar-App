// Sprint M6.10 — Firebase Storage Provider Test Suite

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FirebaseStorageProvider, FirebaseStorageException } from './Providers/Firebase/FirebaseStorageProvider';
import { StorageRouterV2 } from './Routing/StorageRouterV2';
import { Readable, Writable } from 'stream';

describe('Sprint M6.10 Enterprise Firebase Storage Provider', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
  });

  afterEach(() => {
    process.env = envBackup;
  });

  it('FirebaseStorageProvider executes upload, download, exists, metadata and signed URL generation', async () => {
    const provider = new FirebaseStorageProvider({
      bucketName: 'santmat-media-vault.appspot.com',
      projectId: 'santmat-satsang-prachar',
      storageRegion: 'asia-south1',
      enableResumableUploads: true,
      defaultCacheControl: 'public, max-age=86400',
    });

    const content = Buffer.from('Firebase storage payload content');
    const meta = await provider.upload('audio/bhajan_101.mp3', content, { tier: 'hot' });

    expect(meta.storagePath).toBe('audio/bhajan_101.mp3');
    expect(meta.bucketName).toBe('santmat-media-vault.appspot.com');
    expect(await provider.exists('audio/bhajan_101.mp3')).toBe(true);

    const downloaded = await provider.download('audio/bhajan_101.mp3');
    expect(downloaded.toString()).toBe('Firebase storage payload content');

    const signedUrl = await provider.generateSignedUrl('audio/bhajan_101.mp3', 'GET', 3600);
    expect(signedUrl.url).toContain('firebasestorage.googleapis.com');
  });

  it('reads bucket name from environment variables if not provided in config', () => {
    process.env.FIREBASE_STORAGE_BUCKET = 'env-bucket-123.appspot.com';
    const providerFromEnv = new FirebaseStorageProvider({});
    expect(providerFromEnv.providerId).toBe('firebase_storage_env-bucket-123.appspot.com');

    delete process.env.FIREBASE_STORAGE_BUCKET;
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'next-public-bucket-456.appspot.com';
    const providerFromNextEnv = new FirebaseStorageProvider({});
    expect(providerFromNextEnv.providerId).toBe('firebase_storage_next-public-bucket-456.appspot.com');
  });

  it('supports move, copy, restore, and delete operations', async () => {
    const provider = new FirebaseStorageProvider({ bucketName: 'test-bucket.appspot.com' });
    const content = Buffer.from('Test file for file operations');

    // Upload
    await provider.upload('docs/original.txt', content);
    expect(await provider.exists('docs/original.txt')).toBe(true);

    // Copy
    const copySuccess = await provider.copy('docs/original.txt', 'docs/copy.txt');
    expect(copySuccess).toBe(true);
    expect(await provider.exists('docs/copy.txt')).toBe(true);

    // Move
    const moveSuccess = await provider.move('docs/original.txt', 'docs/moved.txt');
    expect(moveSuccess).toBe(true);
    expect(await provider.exists('docs/original.txt')).toBe(false);
    expect(await provider.exists('docs/moved.txt')).toBe(true);

    // Restore & Health
    expect(await provider.restore('docs/moved.txt')).toBe(true);
    const health = await provider.verifyStorageHealth();
    expect(health.status).toBe('healthy');
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);

    // Delete
    const deleteSuccess = await provider.delete('docs/moved.txt');
    expect(deleteSuccess).toBe(true);
    expect(await provider.exists('docs/moved.txt')).toBe(false);
  });

  it('validates MD5 and SHA256 checksums correctly', async () => {
    const provider = new FirebaseStorageProvider({ bucketName: 'checksum-bucket.appspot.com' });
    const content = Buffer.from('Checksum payload test string');

    const meta = await provider.upload('checksum/file.bin', content);
    const expectedSha256 = provider.calculateChecksum(content, 'sha256');
    const expectedMd5 = provider.calculateChecksum(content, 'md5');

    expect(meta.checksum).toBe(expectedSha256);
    expect(await provider.validateChecksum('checksum/file.bin', expectedSha256, 'sha256')).toBe(true);
    expect(await provider.validateChecksum('checksum/file.bin', expectedMd5, 'md5')).toBe(true);
    expect(await provider.validateChecksum('checksum/file.bin', 'invalid_checksum', 'sha256')).toBe(false);
  });

  it('supports resumable uploads and stream downloading/uploading', async () => {
    const provider = new FirebaseStorageProvider({ bucketName: 'stream-bucket.appspot.com' });
    const content = Buffer.from('Stream content payload');

    // Resumable upload from buffer
    const resumableMeta = await provider.uploadResumable('streams/resumable.txt', content);
    expect(resumableMeta.sizeBytes).toBe(content.length);

    // Resumable upload from stream
    const readStream = Readable.from(['Chunk 1 ', 'Chunk 2']);
    const streamMeta = await provider.uploadResumable('streams/chunks.txt', readStream);
    expect(streamMeta.sizeBytes).toBe('Chunk 1 Chunk 2'.length);

    // Download stream
    const downloadStream = await provider.getDownloadStream('streams/chunks.txt');
    const downloadedChunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      downloadedChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    expect(Buffer.concat(downloadedChunks).toString()).toBe('Chunk 1 Chunk 2');
  });

  it('delegates to injected Firebase Admin Bucket when provided', async () => {
    const fileStore = new Map<string, { content: Buffer; metadata: any }>();
    const mockBucket = {
      file: (path: string) => ({
        save: async (content: Buffer, opts: any) => {
          fileStore.set(path, { content, metadata: opts.metadata });
        },
        download: async () => {
          const item = fileStore.get(path);
          if (!item) throw { code: 404, message: 'Not found' };
          return [item.content];
        },
        exists: async () => [fileStore.has(path)],
        delete: async () => {
          fileStore.delete(path);
        },
        getSignedUrl: async () => [`https://storage.googleapis.com/mock-bucket/${path}?signed=true`],
        getMetadata: async () => [
          {
            size: fileStore.get(path)?.content.length ?? 0,
            contentType: 'application/pdf',
            timeCreated: new Date().toISOString(),
            updated: new Date().toISOString(),
          },
        ],
      }),
      exists: async () => [true],
    };

    const provider = new FirebaseStorageProvider({
      bucketName: 'mock-bucket',
      bucket: mockBucket,
    });

    const meta = await provider.upload('mock/doc.pdf', Buffer.from('PDF data'), { metadata: { mimeType: 'application/pdf' } });
    expect(meta.storagePath).toBe('mock/doc.pdf');
    expect(await provider.exists('mock/doc.pdf')).toBe(true);

    const downloaded = await provider.download('mock/doc.pdf');
    expect(downloaded.toString()).toBe('PDF data');

    const signedUrl = await provider.generateSignedUrl('mock/doc.pdf', 'GET', 3600);
    expect(signedUrl.url).toContain('signed=true');
  });

  it('FirebaseStorageProvider throws FirebaseStorageException on missing objects', async () => {
    const provider = new FirebaseStorageProvider({
      bucketName: 'santmat-media-vault.appspot.com',
      projectId: 'santmat-satsang-prachar',
      storageRegion: 'asia-south1',
      enableResumableUploads: true,
      defaultCacheControl: 'public, max-age=86400',
    });

    await expect(provider.download('missing.mp3')).rejects.toThrow(FirebaseStorageException);
  });

  it('StorageRouterV2 successfully registers and routes to FirebaseStorageProvider', () => {
    const router = new StorageRouterV2();
    const firebaseProvider = new FirebaseStorageProvider({
      bucketName: 'santmat-media-vault.appspot.com',
      projectId: 'santmat-satsang-prachar',
      storageRegion: 'asia-south1',
      enableResumableUploads: true,
      defaultCacheControl: 'public, max-age=86400',
    });

    router.registerProvider(firebaseProvider as any);
    const selected = router.selectProvider({ mimeType: 'audio/mpeg' });
    expect(selected).toBeDefined();
  });
});
