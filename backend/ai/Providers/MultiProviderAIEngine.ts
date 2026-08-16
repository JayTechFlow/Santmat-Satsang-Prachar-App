// Sprint M6.9 — Enterprise Multi-Provider AI Engine Implementation

import type { IAIProvider } from '../Interfaces/IAIInterfaces';

export class MultiProviderAIEngine {
  private providers: Map<string, IAIProvider> = new Map();

  public registerVendor(vendorName: string, provider: IAIProvider): void {
    this.providers.set(vendorName.toLowerCase(), provider);
  }

  public getVendorProvider(vendorName: string): IAIProvider {
    const provider = this.providers.get(vendorName.toLowerCase());
    if (!provider) {
      throw new Error(`AI Vendor Provider ${vendorName} not registered`);
    }
    return provider;
  }
}
