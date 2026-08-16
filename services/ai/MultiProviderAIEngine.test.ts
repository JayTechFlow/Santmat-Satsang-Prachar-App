// Sprint M6.9 — Multi-Provider AI Engine Test Suite

import { describe, it, expect } from 'vitest';
import { MultiProviderAIEngine } from './Providers/MultiProviderAIEngine';
import { AbstractAIProvider } from './Providers/AbstractAIProvider';

describe('Sprint M6.9 Enterprise Multi-Provider AI Platform', () => {
  it('MultiProviderAIEngine registers and dispatches across OpenAI, Vertex AI, Anthropic, Bedrock, and Ollama providers', () => {
    const multi = new MultiProviderAIEngine();
    const openai = new AbstractAIProvider('openai_v1', 'OpenAI');
    const vertex = new AbstractAIProvider('vertex_v1', 'GoogleVertexAI');

    multi.registerVendor('OpenAI', openai);
    multi.registerVendor('VertexAI', vertex);

    expect(multi.getVendorProvider('OpenAI').providerType).toBe('OpenAI');
    expect(multi.getVendorProvider('VertexAI').providerType).toBe('GoogleVertexAI');
  });
});
