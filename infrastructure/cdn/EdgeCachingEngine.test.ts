// Sprint M5.5 — Edge Caching Engine Test Suite

import { describe, it, expect } from 'vitest';
import { EdgeCachingEngine } from './Caching/EdgeCachingEngine';

describe('Sprint M5.5 Enterprise Edge Caching Engine', () => {
  it('EdgeCachingEngine matches regex pattern rules and outputs proper Cache-Control headers', () => {
    const engine = new EdgeCachingEngine();
    engine.addCacheRule({
      pattern: '\\.(jpg|jpeg|png|webp)$',
      ttlSeconds: 31536000,
      browserCacheMaxAgeSeconds: 86400,
    });

    const matchedHeaders = engine.getCacheHeaders('https://cdn.santmat.org/images/banner_01.webp');
    expect(matchedHeaders['Cache-Control']).toContain('s-maxage=31536000');
    expect(matchedHeaders['X-Edge-Cache']).toBe('HIT');

    const defaultHeaders = engine.getCacheHeaders('https://cdn.santmat.org/api/v1/status');
    expect(defaultHeaders['X-Edge-Cache']).toBe('MISS');
  });
});
