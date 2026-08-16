// Sprint M5.6 — Signed URL Platform Test Suite

import { describe, it, expect } from 'vitest';
import { SignedURLPlatform } from './Security/SignedURLPlatform';

describe('Sprint M5.6 Enterprise Signed URL Platform', () => {
  it('SignedURLPlatform generates and validates edge signed security tokens', () => {
    const platform = new SignedURLPlatform('santmat_cdn_secret_key_123');
    const { token, expiresAt } = platform.generateSignedToken('/private/audio/pravachan.mp3', 3600);

    expect(token).toContain('sig_');
    expect(platform.validateToken(token, expiresAt)).toBe(true);
    expect(platform.validateToken(token, Math.floor(Date.now() / 1000) - 10)).toBe(false);
  });
});
