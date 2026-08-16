// Sprint M4.3 — Amazon S3 Storage Provider Test Suite

import { describe, it, expect } from 'vitest';
import { AmazonS3StorageProvider } from './Providers/S3/AmazonS3StorageProvider';
import { StorageRouterV2 } from './Routing/StorageRouterV2';

describe('Sprint M4.3 Enterprise Amazon S3 Storage Provider', () => {
  it('AmazonS3StorageProvider executes upload, download, exists, metadata and presigned URL generation', async () => {
    const provider = new AmazonS3StorageProvider({
      bucketName: 'santmat-s3-vault',
      region: 'us-east-1',
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      storageClass: 'INTELLIGENT_TIERING',
    });

    const content = Buffer.from('Amazon S3 video payload content');
    const meta = await provider.upload('videos/satsang_hd.mp4', content, { tier: 'hot' });

    expect(meta.storagePath).toBe('videos/satsang_hd.mp4');
    expect(meta.bucketName).toBe('santmat-s3-vault');
    expect(await provider.exists('videos/satsang_hd.mp4')).toBe(true);

    const downloaded = await provider.download('videos/satsang_hd.mp4');
    expect(downloaded.toString()).toBe('Amazon S3 video payload content');

    const signedUrl = await provider.generateSignedUrl('videos/satsang_hd.mp4', 'GET', 3600);
    expect(signedUrl.url).toContain('amazonaws.com');
    expect(provider.providerId).toBe('aws-s3-primary');
  });

  it('AmazonS3StorageProvider throws on NoSuchKey download errors', async () => {
    const provider = new AmazonS3StorageProvider({
      bucketName: 'santmat-s3-vault',
      region: 'us-east-1',
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    });

    await expect(provider.download('non_existent.mp4')).rejects.toThrow();
  });

  it('StorageRouterV2 registers and routes to AmazonS3StorageProvider', () => {
    const router = new StorageRouterV2();
    const s3Provider = new AmazonS3StorageProvider({
      bucketName: 'santmat-s3-vault',
      region: 'us-east-1',
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    });

    router.registerProvider(s3Provider as any);
    const selected = router.selectProvider({ mimeType: 'video/mp4' });
    expect(selected).toBeDefined();
  });
});
