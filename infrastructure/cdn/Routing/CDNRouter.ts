// Sprint M5.0 — CDN Router Implementation

import type { ICDNProvider } from '../Interfaces/ICDNInterfaces';

export class CDNRouter {
  private providers: ICDNProvider[] = [];

  public registerProvider(provider: ICDNProvider): void {
    this.providers.push(provider);
  }

  public selectProvider(mimeType?: string): ICDNProvider {
    if (this.providers.length === 0) {
      throw new Error('No CDN Providers registered');
    }
    return this.providers[0];
  }
}
