// Sprint M6.0 — AI Abstraction Test Suite

import { describe, it, expect } from 'vitest';
import { AbstractAIProvider } from './Providers/AbstractAIProvider';
import { AIRouter } from './Routing/AIRouter';

describe('Sprint M6.0 AI Abstraction Platform', () => {
  it('AbstractAIProvider returns healthy status and latency', async () => {
    const ai = new AbstractAIProvider('ai_base_1', 'AbstractAI');
    const health = await ai.getHealth();

    expect(health.status).toBe('healthy');
    expect(health.latencyMs).toBeGreaterThan(0);
  });

  it('AIRouter registers and selects AI providers', () => {
    const router = new AIRouter();
    const ai = new AbstractAIProvider('ai_base_1', 'AbstractAI');
    router.registerProvider(ai);

    const selected = router.selectProvider();
    expect(selected.providerType).toBe('AbstractAI');
  });
});
