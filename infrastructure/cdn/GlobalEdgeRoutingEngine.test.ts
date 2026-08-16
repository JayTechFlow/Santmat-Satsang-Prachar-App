// Sprint M5.7 — Global Edge Routing Test Suite

import { describe, it, expect } from 'vitest';
import { GlobalEdgeRoutingEngine } from './Routing/GlobalEdgeRoutingEngine';
import { CloudflareCDNProvider } from './Providers/Cloudflare/CloudflareCDNProvider';
import { AWSCloudFrontCDNProvider } from './Providers/AWS/AWSCloudFrontCDNProvider';

describe('Sprint M5.7 Enterprise Global Edge Routing Engine', () => {
  it('GlobalEdgeRoutingEngine routes users to closest or lowest latency edge node', () => {
    const routing = new GlobalEdgeRoutingEngine();

    const cf = new CloudflareCDNProvider({ zoneId: 'cf1', apiToken: 't1', domainName: 'cf.org' });
    const aws = new AWSCloudFrontCDNProvider({ distributionId: 'aws1', domainName: 'cf.net', keyPairId: 'k1', privateKey: 'pk' });

    routing.registerEdgeNode(cf, 'asia-south1', 10);
    routing.registerEdgeNode(aws, 'us-east-1', 45);

    const optimalIndia = routing.selectOptimalEdgeNode('asia-south1');
    expect(optimalIndia.providerType).toBe('CloudflareCDN');

    const optimalUnknown = routing.selectOptimalEdgeNode('eu-west-1');
    expect(optimalUnknown.providerType).toBe('CloudflareCDN');
  });
});
