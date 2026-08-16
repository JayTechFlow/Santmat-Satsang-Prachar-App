// Sprint M5.4 — Google Cloud CDN Provider Test Suite

import { describe, it, expect } from 'vitest';
import { GoogleCloudCDNProvider } from './Providers/GCP/GoogleCloudCDNProvider';
import { CDNRouter } from './Routing/CDNRouter';

describe('Sprint M5.4 Enterprise Google Cloud CDN Provider', () => {
  it('GoogleCloudCDNProvider executes purge, health checks, and signed URL generation', async () => {
    const gcp = new GoogleCloudCDNProvider({
      projectId: 'santmat-satsang-prachar',
      backendService: 'media-backend-cdn',
      cdnKeyName: 'gcp_signed_key',
      cdnKeyValue: 'secret_key_base64',
    });

    expect(await gcp.purgeCache(['https://cdn.santmat.org/audio/bhajan.mp3'])).toBe(true);
    expect(await gcp.purgeAll()).toBe(true);

    const signed = await gcp.generateSignedUrl('https://cdn.santmat.org/audio/bhajan.mp3', 3600);
    expect(signed).toContain('gcp_cdn_token=gcp_v4_signed');

    const health = await gcp.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('CDNRouter registers GoogleCloudCDNProvider correctly', () => {
    const router = new CDNRouter();
    const gcp = new GoogleCloudCDNProvider({
      projectId: 'santmat-satsang-prachar',
      backendService: 'media-backend-cdn',
      cdnKeyName: 'gcp_signed_key',
      cdnKeyValue: 'secret_key_base64',
    });
    router.registerProvider(gcp);

    const selected = router.selectProvider('audio/mpeg');
    expect(selected.providerType).toBe('GoogleCloudCDN');
  });
});
