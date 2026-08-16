// Sprint M5.0 — Abstract CDN Provider Implementation

import type { ICDNProvider } from '../Interfaces/ICDNInterfaces';

export class AbstractCDNProvider implements ICDNProvider {
  constructor(public readonly providerId: string, public readonly providerType: string) {}

  public async purgeCache(urls: string[]): Promise<boolean> {
    return urls.length > 0;
  }

  public async purgeAll(): Promise<boolean> {
    return true;
  }

  public async generateSignedUrl(url: string, expiresInSeconds: number): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return `${url}?cdn_token=abstract_token_hash&expires=${expiresAt}`;
  }

  public async getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latencyMs: number }> {
    return { status: 'healthy', latencyMs: 5 };
  }
}
