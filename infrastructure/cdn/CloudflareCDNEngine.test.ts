// Sprint M5.1 — Cloudflare CDN Provider Test Suite

import { describe, it, expect } from 'vitest';
import { CloudflareCDNProvider } from './Providers/Cloudflare/CloudflareCDNProvider';
import { CDNRouter } from './Routing/CDNRouter';

describe('Sprint M5.1 Enterprise Cloudflare CDN Provider', () => {
  it('CloudflareCDNProvider executes purge, health checks, and HMAC signed URL generation', async () => {
    const cf = new CloudflareCDNProvider({
      zoneId: 'cf_zone_987654',
      apiToken: 'cf_token_secret',
      domainName: 'cdn.santmat.org',
    });

    expect(await cf.purgeCache(['https://cdn.santmat.org/img/banner.jpg'])).toBe(true);
    expect(await cf.purgeAll()).toBe(true);
    
    const signed = await cf.generateSignedUrl('https://cdn.santmat.org/img/banner.jpg', 1800);
    expect(signed).toContain('cf_token=cf_signed_hmac_sha256');

    const health = await cf.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('CDNRouter registers CloudflareCDNProvider correctly', () => {
    const router = new CDNRouter();
    const cf = new CloudflareCDNProvider({
      zoneId: 'cf_zone_987654',
      apiToken: 'cf_token_secret',
      domainName: 'cdn.santmat.org',
    });
    router.registerProvider(cf);

    const selected = router.selectProvider('image/jpeg');
    expect(selected.providerType).toBe('CloudflareCDN');
  });
});
