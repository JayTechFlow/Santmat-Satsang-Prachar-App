// Sprint M5.7 — Enterprise Global Edge Routing Engine

import type { ICDNProvider } from '../Interfaces/ICDNInterfaces';

export class GlobalEdgeRoutingEngine {
  private edgeNodes: { provider: ICDNProvider; region: string; latencyMs: number }[] = [];

  public registerEdgeNode(provider: ICDNProvider, region: string, latencyMs: number): void {
    this.edgeNodes.push({ provider, region, latencyMs });
  }

  public selectOptimalEdgeNode(userRegion: string): ICDNProvider {
    if (this.edgeNodes.length === 0) {
      throw new Error('No Edge Nodes registered');
    }

    const regionalMatch = this.edgeNodes.find((node) => node.region === userRegion);
    if (regionalMatch) {
      return regionalMatch.provider;
    }

    // Fallback to lowest latency node
    const sorted = [...this.edgeNodes].sort((a, b) => a.latencyMs - b.latencyMs);
    return sorted[0].provider;
  }
}
