// Sprint M5.2 — AWS CloudFront CDN Provider Test Suite

import { describe, it, expect } from 'vitest';
import { AWSCloudFrontCDNProvider } from './Providers/AWS/AWSCloudFrontCDNProvider';
import { CDNRouter } from './Routing/CDNRouter';

describe('Sprint M5.2 Enterprise AWS CloudFront CDN Provider', () => {
  it('AWSCloudFrontCDNProvider executes invalidation, health checks, and RSA-SHA1 signed URL generation', async () => {
    const cf = new AWSCloudFrontCDNProvider({
      distributionId: 'E1234567890ABC',
      domainName: 'd111111abcdef8.cloudfront.net',
      keyPairId: 'K2JCJMDEIL355N',
      privateKey: 'pk_rsa',
    });

    expect(await cf.purgeCache(['https://d111111abcdef8.cloudfront.net/video/satsang.mp4'])).toBe(true);
    expect(await cf.purgeAll()).toBe(true);

    const signed = await cf.generateSignedUrl('https://d111111abcdef8.cloudfront.net/video/satsang.mp4', 3600);
    expect(signed).toContain('Key-Pair-Id=K2JCJMDEIL355N');

    const health = await cf.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('CDNRouter registers AWSCloudFrontCDNProvider correctly', () => {
    const router = new CDNRouter();
    const cf = new AWSCloudFrontCDNProvider({
      distributionId: 'E1234567890ABC',
      domainName: 'd111111abcdef8.cloudfront.net',
      keyPairId: 'K2JCJMDEIL355N',
      privateKey: 'pk_rsa',
    });
    router.registerProvider(cf);

    const selected = router.selectProvider('video/mp4');
    expect(selected.providerType).toBe('AWSCloudFrontCDN');
  });
});
