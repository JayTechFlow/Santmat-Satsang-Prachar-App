// Sprint M4.4 — Azure Blob Storage Provider Test Suite

import { describe, it, expect } from 'vitest';
import { AzureBlobStorageProvider, AzureBlobException } from './Providers/Azure/AzureBlobStorageProvider';
import { StorageRouterV2 } from './Routing/StorageRouterV2';

describe('Sprint M4.4 Enterprise Azure Blob Storage Provider', () => {
  it('AzureBlobStorageProvider executes upload, download, exists, metadata and SAS token URL generation', async () => {
    const provider = new AzureBlobStorageProvider({
      accountName: 'santmatstorage',
      accountKey: 'azure_account_key_hash',
      containerName: 'media-container',
      accessTier: 'Hot',
    });

    const content = Buffer.from('Azure Blob document payload content');
    const meta = await provider.upload('documents/parichay.pdf', content, { tier: 'hot' });

    expect(meta.storagePath).toBe('documents/parichay.pdf');
    expect(meta.bucketName).toBe('media-container');
    expect(await provider.exists('documents/parichay.pdf')).toBe(true);

    const downloaded = await provider.download('documents/parichay.pdf');
    expect(downloaded.toString()).toBe('Azure Blob document payload content');

    const signedUrl = await provider.generateSignedUrl('documents/parichay.pdf', 'GET', 3600);
    expect(signedUrl.url).toContain('blob.core.windows.net');
  });

  it('AzureBlobStorageProvider throws AzureBlobException on missing blobs', async () => {
    const provider = new AzureBlobStorageProvider({
      accountName: 'santmatstorage',
      accountKey: 'azure_account_key_hash',
      containerName: 'media-container',
    });

    await expect(provider.download('missing_blob.pdf')).rejects.toThrow(AzureBlobException);
  });

  it('StorageRouterV2 registers and routes to AzureBlobStorageProvider', () => {
    const router = new StorageRouterV2();
    const azureProvider = new AzureBlobStorageProvider({
      accountName: 'santmatstorage',
      accountKey: 'azure_account_key_hash',
      containerName: 'media-container',
    });

    router.registerProvider(azureProvider as any);
    const selected = router.selectProvider({ mimeType: 'application/pdf' });
    expect(selected).toBeDefined();
  });
});
