// Sprint M5.6 — Enterprise Signed URL & Edge Security Platform

import * as crypto from 'crypto';

export interface SignedToken {
  token: string;
  expiresAt: number;
}

export interface TokenPayload {
  resource: string;
  operation: 'read' | 'write' | 'delete';
  expiresAt: number;
  issuer: string;
  context?: Record<string, string>;
}

export class SignedURLPlatform {
  private secretKey: Buffer;

  constructor(secretKey: string) {
    if (!secretKey || secretKey.length < 32) {
      throw new Error('Secret key must be at least 32 characters');
    }
    this.secretKey = Buffer.from(secretKey, 'utf8');
  }

  public generateSignedToken(payload: TokenPayload): SignedToken {
    const data = JSON.stringify(payload);
    const signature = this.sign(data);
    const token = Buffer.from(`${data}.${signature}`).toString('base64url');
    return { token, expiresAt: payload.expiresAt };
  }

  public validateToken(token: string, expectedResource?: string, expectedOperation?: 'read' | 'write' | 'delete'): { valid: boolean; payload?: TokenPayload; error?: string } {
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf8');
      const lastDotIndex = decoded.lastIndexOf('.');
      if (lastDotIndex === -1) {
        return { valid: false, error: 'Invalid token format' };
      }

      const data = decoded.substring(0, lastDotIndex);
      const signature = decoded.substring(lastDotIndex + 1);

      // Verify signature
      const expectedSignature = this.sign(data);
      if (!this.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return { valid: false, error: 'Invalid signature' };
      }

      const payload: TokenPayload = JSON.parse(data);

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.expiresAt) {
        return { valid: false, error: 'Token expired' };
      }

      // Check resource binding
      if (expectedResource && payload.resource !== expectedResource) {
        return { valid: false, error: 'Token resource mismatch' };
      }

      // Check operation binding
      if (expectedOperation && payload.operation !== expectedOperation) {
        return { valid: false, error: 'Token operation mismatch' };
      }

      // Check issuer
      if (payload.issuer !== 'santmat-cdn') {
        return { valid: false, error: 'Invalid issuer' };
      }

      return { valid: true, payload };
    } catch (err) {
      return { valid: false, error: `Token validation failed: ${(err as Error).message}` };
    }
  }

  private sign(data: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('base64url');
  }

  private timingSafeEqual(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  }

  /**
   * Generate a signed URL for a resource
   * For write operations, max expiration is 15 minutes (900 seconds)
   */
  public generateSignedUrl(
    baseUrl: string,
    resource: string,
    operation: 'read' | 'write' | 'delete',
    expiresInSeconds: number,
    context?: Record<string, string>
  ): { url: string; expiresAt: number } {
    // Enforce max expiration for write operations
    if (operation === 'write' && expiresInSeconds > 900) {
      expiresInSeconds = 900;
    }

    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload: TokenPayload = {
      resource,
      operation,
      expiresAt,
      issuer: 'santmat-cdn',
      context,
    };

    const { token } = this.generateSignedToken(payload);
    const url = `${baseUrl}?token=${encodeURIComponent(token)}`;
    return { url, expiresAt };
  }
}
