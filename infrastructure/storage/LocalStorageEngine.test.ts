// Sprint M4.1 — Local Storage Provider Test Suite

import { describe, it, expect } from 'vitest';
import { LocalStorageProvider, LocalStorageException } from './Providers/Local/LocalStorageProvider';
import { StorageRouterV2 } from './Routing/StorageRouterV2';

describe('Sprint M4.1 Enterprise Local Storage Provider', () => {
  it('LocalStorageProvider executes upload, download, exists, metadata and local URL generation', async () => {
    const provider = new LocalStorageProvider({
      baseDirectory: '/tmp/santmat-storage',
      publicUrlPrefix: 'http://localhost:5000/storage',
    });

    const content = Buffer.from('Local disk payload content');
    const meta = await provider.upload('documents/sample.pdf', content, { tier: 'hot' });

    expect(meta.storagePath).toBe('documents/sample.pdf');
    expect(meta.providerId).toBe('local_disk_provider_1');
    expect(await provider.exists('documents/sample.pdf')).toBe(true);

    const downloaded = await provider.download('documents/sample.pdf');
    expect(downloaded.toString()).toBe('Local disk payload content');

    const signedUrl = await provider.generateSignedUrl('documents/sample.pdf', 'GET', 3600);
    expect(signedUrl.url).toContain('http://localhost:5000/storage/documents/sample.pdf');
  });

  it('LocalStorageProvider throws LocalStorageException on missing local files', async () => {
    const provider = new LocalStorageProvider({
      baseDirectory: '/tmp/santmat-storage',
      publicUrlPrefix: 'http://localhost:5000/storage',
    });

    await expect(provider.download('non_existent.pdf')).rejects.toThrow(LocalStorageException);
  });

  it('StorageRouterV2 registers and routes to LocalStorageProvider', () => {
    const router = new StorageRouterV2();
    const localProvider = new LocalStorageProvider({
      baseDirectory: '/tmp/santmat-storage',
      publicUrlPrefix: 'http://localhost:5000/storage',
    });

    router.registerProvider(localProvider as any);
    const selected = router.selectProvider({ mimeType: 'text/plain' });
    expect(selected).toBeDefined();
  });
});
