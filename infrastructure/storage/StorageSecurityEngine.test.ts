// Sprint M4.7 & M6.10 — Enterprise Storage Security & Storage Rules Test Suite

import { describe, it, expect } from 'vitest';
import { StorageSecurityEngine } from './Security/StorageSecurityEngine';
import type { StorageObjectMetadata } from './Models/StorageModels';

describe('Sprint M4.7 & M6.10 Enterprise Storage Security Engine & Rules', () => {
  const security = new StorageSecurityEngine({
    algorithm: 'AWS-KMS',
    keyId: 'arn:aws:kms:us-east-1:123456789012:key/santmat-vault-key',
  });

  it('applies KMS security headers and validates object integrity checksums', () => {
    const headers = security.applyEncryptionHeaders({ 'Content-Type': 'application/pdf' });
    expect(headers['x-santmat-security-kms-key']).toContain('santmat-vault-key');
    expect(headers['x-santmat-security-algo']).toBe('AWS-KMS');

    const meta: StorageObjectMetadata = {
      storagePath: 'documents/legal.pdf',
      providerId: 'provider_1',
      bucketName: 'vault',
      sizeBytes: 1024,
      mimeType: 'application/pdf',
      checksum: 'hash_abc123',
      tier: 'hot',
      createdAt: new Date().toISOString(),
      lastModifiedAt: new Date().toISOString(),
      isEncrypted: true,
    };

    expect(security.validateObjectIntegrity(meta, 'hash_abc123')).toBe(true);
    expect(security.validateObjectIntegrity(meta, 'hash_tampered')).toBe(false);
  });

  it('detects and blocks executable file uploads (.exe, .sh, .bat, .apk, .js, etc.)', () => {
    expect(security.isExecutable('malicious.exe', 'application/x-msdownload')).toBe(true);
    expect(security.isExecutable('script.sh', 'text/x-shellscript')).toBe(true);
    expect(security.isExecutable('payload.bat', 'application/x-bat')).toBe(true);
    expect(security.isExecutable('app.apk', 'application/vnd.android.package-archive')).toBe(true);
    expect(security.isExecutable('hack.php', 'application/x-php')).toBe(true);
    expect(security.isExecutable('photo.jpg', 'image/jpeg')).toBe(false);
    expect(security.isExecutable('satsang.mp3', 'audio/mpeg')).toBe(false);
  });

  it('enforces Role-Based Access Control (RBAC) via custom claims/roles', () => {
    expect(security.hasAdminPermission({ admin: true })).toBe(true);
    expect(security.hasAdminPermission({ role: 'developer_super_admin' })).toBe(true);
    expect(security.hasAdminPermission({ role: 'client_super_admin' })).toBe(true);
    expect(security.hasAdminPermission({ role: 'super_admin' })).toBe(false);
    expect(security.hasAdminPermission({ role: 'user' })).toBe(false);
    expect(security.hasAdminPermission({ admin: true, accountStatus: 'suspended' })).toBe(false);
    expect(security.hasAdminPermission(null)).toBe(false);
  });

  it('validates path upload constraints for images, audio, video, books, documents, events, avatars, temp, trash', () => {
    // Valid uploads
    expect(security.validatePathUpload('images/banner.png', 'banner.png', 'image/png', 2 * 1024 * 1024).valid).toBe(true);
    expect(security.validatePathUpload('audio/satsang.mp3', 'satsang.mp3', 'audio/mpeg', 20 * 1024 * 1024).valid).toBe(true);
    expect(security.validatePathUpload('video/lecture.mp4', 'lecture.mp4', 'video/mp4', 200 * 1024 * 1024).valid).toBe(true);
    expect(security.validatePathUpload('books/spiritual.pdf', 'spiritual.pdf', 'application/pdf', 15 * 1024 * 1024).valid).toBe(true);
    expect(security.validatePathUpload('documents/guide.docx', 'guide.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 5 * 1024 * 1024).valid).toBe(true);
    expect(security.validatePathUpload('events/poster.jpg', 'poster.jpg', 'image/jpeg', 3 * 1024 * 1024).valid).toBe(true);
    expect(security.validatePathUpload('avatars/user123/profile.webp', 'profile.webp', 'image/webp', 1 * 1024 * 1024).valid).toBe(true);
    expect(security.validatePathUpload('temp/user123/draft.tmp', 'draft.tmp', 'application/octet-stream', 10 * 1024 * 1024).valid).toBe(true);
    expect(security.validatePathUpload('trash/deleted.pdf', 'deleted.pdf', 'application/pdf', 50 * 1024 * 1024).valid).toBe(true);

    // Oversized uploads
    expect(security.validatePathUpload('images/huge.jpg', 'huge.jpg', 'image/jpeg', 20 * 1024 * 1024).valid).toBe(false);
    expect(security.validatePathUpload('avatars/user1/pic.png', 'pic.png', 'image/png', 10 * 1024 * 1024).valid).toBe(false);

    // MIME spoofing & invalid extensions
    expect(security.validatePathUpload('images/fake.png', 'fake.png', 'application/pdf', 1 * 1024 * 1024).valid).toBe(false);
    expect(security.validatePathUpload('audio/virus.exe', 'virus.exe', 'audio/mpeg', 1 * 1024 * 1024).valid).toBe(false);
  });

  it('prevents overwrite attacks for non-admin users', () => {
    expect(security.validateOverwritePermission(true, { role: 'user' })).toBe(true);
    expect(security.validateOverwritePermission(false, { role: 'user' })).toBe(false);
    expect(security.validateOverwritePermission(false, { role: 'developer_super_admin' })).toBe(true);
  });

  it('validates signed upload tokens', () => {
    expect(security.validateSignedUploadToken('valid_signed_upload_token_hash_12345')).toBe(true);
    expect(security.validateSignedUploadToken('invalid')).toBe(false);
  });
});

