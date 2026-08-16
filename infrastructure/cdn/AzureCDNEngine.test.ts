// Sprint M5.3 — Azure CDN Provider Test Suite

import { describe, it, expect } from 'vitest';
import { AzureCDNProvider } from './Providers/Azure/AzureCDNProvider';
import { CDNRouter } from './Routing/CDNRouter';

describe('Sprint M5.3 Enterprise Azure CDN Provider', () => {
  it('AzureCDNProvider executes purge, health checks, and SAS token signed URL generation', async () => {
    const az = new AzureCDNProvider({
      profileName: 'santmat-cdn-profile',
      endpointName: 'santmat-endpoint',
      resourceGroup: 'rg-santmat',
    });

    expect(await az.purgeCache(['https://santmat.azureedge.net/docs/parichay.pdf'])).toBe(true);
    expect(await az.purgeAll()).toBe(true);

    const signed = await az.generateSignedUrl('https://santmat.azureedge.net/docs/parichay.pdf', 3600);
    expect(signed).toContain('azure_cdn_token=az_signed_sas');

    const health = await az.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('CDNRouter registers AzureCDNProvider correctly', () => {
    const router = new CDNRouter();
    const az = new AzureCDNProvider({
      profileName: 'santmat-cdn-profile',
      endpointName: 'santmat-endpoint',
      resourceGroup: 'rg-santmat',
    });
    router.registerProvider(az);

    const selected = router.selectProvider('application/pdf');
    expect(selected.providerType).toBe('AzureCDN');
  });
});
