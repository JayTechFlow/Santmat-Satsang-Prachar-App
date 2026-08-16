// Sprint M6.0 — AIRouter Implementation

import type { IAIProvider } from '../Interfaces/IAIInterfaces';

export class AIRouter {
  private providers: IAIProvider[] = [];

  public registerProvider(provider: IAIProvider): void {
    this.providers.push(provider);
  }

  public selectProvider(): IAIProvider {
    if (this.providers.length === 0) {
      throw new Error('No AI Providers registered');
    }
    return this.providers[0];
  }
}
