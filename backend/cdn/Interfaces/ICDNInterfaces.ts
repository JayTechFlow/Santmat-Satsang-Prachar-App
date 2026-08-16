// Sprint M5.0 — Enterprise CDN Abstraction Layer

export interface ICDNProvider {
  readonly providerId: string;
  readonly providerType: string;
  purgeCache(urls: string[]): Promise<boolean>;
  purgeAll(): Promise<boolean>;
  generateSignedUrl(url: string, expiresInSeconds: number): Promise<string>;
  getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latencyMs: number }>;
}

export interface CDNCacheRule {
  pattern: string;
  ttlSeconds: number;
  browserCacheMaxAgeSeconds: number;
}
