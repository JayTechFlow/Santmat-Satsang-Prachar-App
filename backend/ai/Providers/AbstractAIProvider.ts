// Sprint M6.0 — Abstract AI Provider Base Implementation

import type { IAIProvider } from '../Interfaces/IAIInterfaces';

export class AbstractAIProvider implements IAIProvider {
  constructor(public readonly providerId: string, public readonly providerType: string) {}

  public async getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latencyMs: number }> {
    return { status: 'healthy', latencyMs: 15 };
  }
}
