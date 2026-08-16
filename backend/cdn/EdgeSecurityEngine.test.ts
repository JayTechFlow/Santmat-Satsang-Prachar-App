// Sprint M5.9 — Edge Security Engine Test Suite

import { describe, it, expect } from 'vitest';
import { EdgeSecurityEngine } from './Security/EdgeSecurityEngine';

describe('Sprint M5.9 Enterprise Edge Security Engine', () => {
  it('EdgeSecurityEngine inspects incoming requests and enforces WAF bot protection rules', () => {
    const security = new EdgeSecurityEngine({
      rateLimitRequestsPerMinute: 60,
      blockBots: true,
      ddosShieldMode: 'high',
    });

    const allowedRes = security.inspectRequest({ 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' });
    expect(allowedRes.allowed).toBe(true);

    const blockedRes = security.inspectRequest({ 'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' });
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.reason).toContain('Bot Traffic Blocked');
  });
});
