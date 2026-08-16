// Sprint M4.0 — Enterprise Multi-Storage Abstraction Test Suite

import { describe, it, expect } from 'vitest';
import { AbstractStorageProvider } from './Providers/AbstractStorageProvider';
import { StorageRouterV2 } from './Routing/StorageRouterV2';
import { PrimarySecondaryStrategy } from './Strategies/PrimarySecondaryStrategy';
import { StorageLifecyclePolicy } from './Policies/StorageLifecyclePolicy';

describe('Sprint M4.0 Enterprise Multi-Storage Abstraction Platform', () => {
  it('AbstractStorageProvider executes upload, download, exists, and signed URL generation', async () => {
    const provider = new AbstractStorageProvider('p_1', 'AbstractVault');
    const content = Buffer.from('Enterprise media payload content');

    const meta = await provider.upload('documents/test.pdf', content, { tier: 'hot' });
    expect(meta.storagePath).toBe('documents/test.pdf');
    expect(meta.sizeBytes).toBe(content.length);
    expect(meta.isEncrypted).toBe(true);

    const downloaded = await provider.download('documents/test.pdf');
    expect(downloaded.toString()).toBe('Enterprise media payload content');

    const exists = await provider.exists('documents/test.pdf');
    expect(exists).toBe(true);

    const signedUrl = await provider.generateSignedUrl('documents/test.pdf', 'GET', 3600);
    expect(signedUrl.url).toContain('storage-gateway.internal');
  });

  it('StorageRouterV2 routes requests by MIME type to appropriate registered providers', () => {
    const router = new StorageRouterV2();
    const defaultProvider = new AbstractStorageProvider('primary_vault', 'AbstractVault');
    const videoProvider = new AbstractStorageProvider('video_replica_vault', 'AbstractVault');

    router.registerProvider(defaultProvider as any);
    router.registerProvider(videoProvider as any);

    const selectedForDoc = router.selectProvider({ mimeType: 'application/pdf' });
    expect(selectedForDoc).toBeDefined();

    const selectedForVideo = router.selectProvider({ mimeType: 'video/mp4' });
    expect(selectedForVideo).toBeDefined();
  });

  it('PrimarySecondaryStrategy writes to primary and replicates to secondary', async () => {
    const primary = new AbstractStorageProvider('p_primary', 'PrimaryVault');
    const secondary = new AbstractStorageProvider('p_secondary', 'SecondaryVault');
    const strategy = new PrimarySecondaryStrategy(primary, secondary);

    const meta = await strategy.executeUpload('images/sample.jpg', Buffer.from('image bytes'));
    expect(meta.providerId).toBe('p_primary');
    expect(await primary.exists('images/sample.jpg')).toBe(true);
  });

  it('StorageLifecyclePolicy evaluates tier progression based on object age', () => {
    expect(StorageLifecyclePolicy.evaluateTier(10, false)).toBe('hot');
    expect(StorageLifecyclePolicy.evaluateTier(120, false)).toBe('warm');
    expect(StorageLifecyclePolicy.evaluateTier(400, false)).toBe('cold');
    expect(StorageLifecyclePolicy.evaluateTier(10, true)).toBe('archive');
  });
});
