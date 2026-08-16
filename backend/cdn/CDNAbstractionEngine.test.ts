// Sprint M5.0 — CDN Abstraction Test Suite

import { describe, it, expect } from 'vitest';
import { AbstractCDNProvider } from './Providers/AbstractCDNProvider';
import { CDNRouter } from './Routing/CDNRouter';

describe('Sprint M5.0 CDN Abstraction Layer', () => {
  it('AbstractCDNProvider performs cache purge, signed URL generation, and health check', async () => {
    const cdn = new AbstractCDNProvider('cdn_base_1', 'AbstractCDN');
    expect(await cdn.purgeCache(['https://cdn.santmat.org/audio/1.mp3'])).toBe(true);
    expect(await cdn.purgeAll()).toBe(true);
    
    const signed = await cdn.generateSignedUrl('https://cdn.santmat.org/audio/1.mp3', 3600);
    expect(signed).toContain('cdn_token=abstract_token_hash');

    const health = await cdn.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('CDNRouter registers and selects providers', () => {
    const router = new CDNRouter();
    const cdn = new AbstractCDNProvider('cdn_base_1', 'AbstractCDN');
    router.registerProvider(cdn);

    const selected = router.selectProvider('audio/mpeg');
    expect(selected.providerType).toBe('AbstractCDN');
  });
});
