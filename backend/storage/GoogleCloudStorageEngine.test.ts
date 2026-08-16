// Sprint M4.5 — Google Cloud Storage Provider Test Suite

import { describe, it, expect } from 'vitest';
import { GoogleCloudStorageProvider, GoogleCloudStorageException } from './Providers/GCS/GoogleCloudStorageProvider';
import { StorageRouterV2 } from './Routing/StorageRouterV2';

describe('Sprint M4.5 Enterprise Google Cloud Storage Provider', () => {
  it('GoogleCloudStorageProvider executes upload, download, exists, metadata and V4 signed URL generation', async () => {
    const provider = new GoogleCloudStorageProvider({
      bucketName: 'santmat-gcs-vault',
      projectId: 'santmat-satsang-prachar',
      clientEmail: 'sa-media-storage@santmat-satsang-prachar.iam.gserviceaccount.com',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----',
      storageClass: 'STANDARD',
    });

    const content = Buffer.from('Google Cloud Storage payload content');
    const meta = await provider.upload('audio/satsang_pravachan_01.mp3', content, { tier: 'hot' });

    expect(meta.storagePath).toBe('audio/satsang_pravachan_01.mp3');
    expect(meta.bucketName).toBe('santmat-gcs-vault');
    expect(await provider.exists('audio/satsang_pravachan_01.mp3')).toBe(true);

    const downloaded = await provider.download('audio/satsang_pravachan_01.mp3');
    expect(downloaded.toString()).toBe('Google Cloud Storage payload content');

    const signedUrl = await provider.generateSignedUrl('audio/satsang_pravachan_01.mp3', 'GET', 3600);
    expect(signedUrl.url).toContain('storage.googleapis.com');
  });

  it('GoogleCloudStorageProvider throws GoogleCloudStorageException on 404 missing objects', async () => {
    const provider = new GoogleCloudStorageProvider({
      bucketName: 'santmat-gcs-vault',
      projectId: 'santmat-satsang-prachar',
      clientEmail: 'sa-media-storage@santmat-satsang-prachar.iam.gserviceaccount.com',
      privateKey: 'key',
    });

    await expect(provider.download('missing_gcs.mp3')).rejects.toThrow(GoogleCloudStorageException);
  });

  it('StorageRouterV2 registers and routes to GoogleCloudStorageProvider', () => {
    const router = new StorageRouterV2();
    const gcsProvider = new GoogleCloudStorageProvider({
      bucketName: 'santmat-gcs-vault',
      projectId: 'santmat-satsang-prachar',
      clientEmail: 'sa-media-storage@santmat-satsang-prachar.iam.gserviceaccount.com',
      privateKey: 'key',
    });

    router.registerProvider(gcsProvider as any);
    const selected = router.selectProvider({ mimeType: 'audio/mpeg' });
    expect(selected).toBeDefined();
  });
});
