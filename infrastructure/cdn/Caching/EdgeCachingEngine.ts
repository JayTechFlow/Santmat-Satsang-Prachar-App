// Sprint M5.5 — Enterprise Edge Caching Engine

import type { CDNCacheRule } from '../Interfaces/ICDNInterfaces';

export class EdgeCachingEngine {
  private rules: CDNCacheRule[] = [];

  public addCacheRule(rule: CDNCacheRule): void {
    this.rules.push(rule);
  }

  public getCacheHeaders(urlPath: string): Record<string, string> {
    const matchedRule = this.rules.find((r) => new RegExp(r.pattern).test(urlPath));
    if (matchedRule) {
      return {
        'Cache-Control': `public, max-age=${matchedRule.browserCacheMaxAgeSeconds}, s-maxage=${matchedRule.ttlSeconds}`,
        'X-Edge-Cache': 'HIT',
      };
    }
    return {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Edge-Cache': 'MISS',
    };
  }
}
