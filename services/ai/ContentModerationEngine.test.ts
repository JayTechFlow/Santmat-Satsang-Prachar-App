// Sprint M6.6 — Content Moderation Test Suite

import { describe, it, expect } from 'vitest';
import { ContentModerationEngine } from './Moderation/ContentModerationEngine';

describe('Sprint M6.6 Enterprise Content Moderation', () => {
  it('ContentModerationEngine inspects text and media for safety violations', async () => {
    const engine = new ContentModerationEngine();

    const safeResult = await engine.inspectContent('Devotional Satsang Video');
    expect(safeResult.isSafe).toBe(true);

    const toxicResult = await engine.inspectContent('toxic content sample');
    expect(toxicResult.isSafe).toBe(false);
    expect(toxicResult.flaggedCategories).toContain('policy_violation');
  });
});
