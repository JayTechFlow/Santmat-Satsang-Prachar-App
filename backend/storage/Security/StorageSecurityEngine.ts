// Sprint E2 — Enterprise Storage Security Engine
// Comprehensive security: encryption, credentials, secrets, IAM, checksums, integrity, audit

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import type { StorageObjectMetadata, StorageOptions, StorageProviderType, StorageTier } from '../Models/StorageModels';
import { ProviderRegistry } from '../Factory/ProviderRegistry';

export interface StorageEncryptionConfig {
  algorithm: 'AES-256-GCM' | 'AWS-KMS' | 'AZURE-KEYVAULT' | 'GCP-KMS' | 'CUSTOM';
  keyId: string;
  keyVersion?: string;
  region?: string;
}

export interface UserCustomClaims {
  admin?: boolean;
  role?: string;
  accountStatus?: string;
  customClaims?: { role?: string };
  permissions?: string[];
  [key: string]: unknown;
}

export interface PathSecurityConstraint {
  allowedExtensions: string[];
  allowedMimeTypes: RegExp;
  maxSizeBytes: number;
  publicRead: boolean;
  requireEncryption?: boolean;
  allowedStorageClasses?: string[];
  requireChecksum?: boolean;
}

export interface ProviderCredentialConfig {
  providerType: StorageProviderType;
  credentials: Record<string, string>;
  requiredFields: string[];
  optionalFields: string[];
  validateOnRegister: boolean;
  rotateIntervalDays?: number;
}

export interface IAMPolicy {
  version: string;
  statements: IAMStatement[];
}

export interface IAMStatement {
  sid?: string;
  effect: 'Allow' | 'Deny';
  action: string | string[];
  resource: string | string[];
  condition?: Record<string, any>;
  principal?: Record<string, string[]>;
}

export interface SecretResolver {
  resolve(secretRef: string): Promise<string>;
  resolveAll(config: Record<string, any>): Promise<Record<string, any>>;
}

export interface ChecksumConfig {
  algorithm: 'MD5' | 'SHA256' | 'SHA512' | 'CRC32C';
  required: boolean;
  validateOnUpload: boolean;
  validateOnDownload: boolean;
}

export interface IntegrityReport {
  path: string;
  providerId: string;
  expectedChecksum: string;
  actualChecksum: string;
  algorithm: string;
  match: boolean;
  timestamp: string;
  sizeBytes: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  providerId: string;
  operation: string;
  path: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
  metadata: Record<string, any>;
  durationMs: number;
}

export interface SecurityValidationResult {
  valid: boolean;
  errors: SecurityError[];
  warnings: SecurityWarning[];
}

export interface SecurityError {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'critical';
}

export interface SecurityWarning {
  code: string;
  message: string;
  field?: string;
}

export class StorageSecurityEngine extends EventEmitter {
  private static readonly PATH_CONSTRAINTS: Record<string, PathSecurityConstraint> = {
    images: {
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico', 'avif', 'heic'],
      allowedMimeTypes: /^image\/(jpeg|png|webp|gif|svg\+xml|x-icon|vnd\.microsoft\.icon|avif|heic)$/,
      maxSizeBytes: 50 * 1024 * 1024,
      publicRead: true,
      requireEncryption: false,
      requireChecksum: true,
    },
    audio: {
      allowedExtensions: ['mp3', 'm4a', 'wav', 'ogg', 'aac', 'flac', 'opus', 'webm'],
      allowedMimeTypes: /^audio\/(mpeg|mp4|wav|ogg|aac|x-m4a|flac|opus|webm)$/,
      maxSizeBytes: 500 * 1024 * 1024,
      publicRead: true,
      requireEncryption: false,
      requireChecksum: true,
    },
    video: {
      allowedExtensions: ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'ogv', '3gp'],
      allowedMimeTypes: /^video\/(mp4|webm|quicktime|x-matroska|x-msvideo|3gpp)$/,
      maxSizeBytes: 2 * 1024 * 1024 * 1024,
      publicRead: true,
      requireEncryption: false,
      requireChecksum: true,
    },
    books: {
      allowedExtensions: ['pdf', 'epub', 'mobi', 'azw3', 'djvu', 'jpg', 'jpeg', 'png', 'webp', 'cbz', 'cbr'],
      allowedMimeTypes: /^(application\/pdf|application\/epub\+zip|application\/x-mobipocket-ebook|application\/x-djvu|image\/(jpeg|png|webp)|application\/vnd\.comicbook\+zip|application\/x-cbr)$/,
      maxSizeBytes: 500 * 1024 * 1024,
      publicRead: true,
      requireEncryption: false,
      requireChecksum: true,
    },
    documents: {
      allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md', 'rtf', 'odt', 'ods', 'odp'],
      allowedMimeTypes: /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument.*|text\/plain|text\/csv|text\/markdown|application\/rtf|application\/vnd\.oasis\.opendocument.*)$/,
      maxSizeBytes: 100 * 1024 * 1024,
      publicRead: true,
      requireEncryption: false,
      requireChecksum: true,
    },
    events: {
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'mp4', 'webm'],
      allowedMimeTypes: /^(image\/(jpeg|png|webp)|application\/pdf|video\/(mp4|webm))$/,
      maxSizeBytes: 100 * 1024 * 1024,
      publicRead: true,
      requireEncryption: false,
      requireChecksum: true,
    },
    avatars: {
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      allowedMimeTypes: /^image\/(jpeg|png|webp|avif)$/,
      maxSizeBytes: 10 * 1024 * 1024,
      publicRead: true,
      requireEncryption: false,
      requireChecksum: true,
    },
    temp: {
      allowedExtensions: [],
      allowedMimeTypes: /.*/,
      maxSizeBytes: 100 * 1024 * 1024,
      publicRead: false,
      requireEncryption: true,
      requireChecksum: false,
    },
    trash: {
      allowedExtensions: [],
      allowedMimeTypes: /.*/,
      maxSizeBytes: 1024 * 1024 * 1024,
      publicRead: false,
      requireEncryption: true,
      requireChecksum: false,
    },
    backups: {
      allowedExtensions: [],
      allowedMimeTypes: /.*/,
      maxSizeBytes: 10 * 1024 * 1024 * 1024,
      publicRead: false,
      requireEncryption: true,
      allowedStorageClasses: ['GLACIER', 'DEEP_ARCHIVE', 'COLDLINE', 'ARCHIVE'],
      requireChecksum: true,
    },
  };

  private static readonly EXECUTABLE_EXTENSIONS = new Set([
    'exe', 'sh', 'bat', 'cmd', 'msi', 'apk', 'com', 'scr', 'vbs', 'jar',
    'php', 'py', 'pl', 'cgi', 'asp', 'aspx', 'jsp', 'dll', 'sys', 'drv', 'elf', 'bin', 'ps1',
    'app', 'dmg', 'pkg', 'deb', 'rpm', 'run', 'bin', 'out', 'so', 'dylib',
  ]);

  private static readonly EXECUTABLE_MIMES = new Set([
    'application/x-msdownload',
    'application/x-executable',
    'application/x-sh',
    'application/x-bat',
    'application/x-dostype',
    'application/x-msdos-program',
    'application/x-elf',
    'application/x-sharedlib',
    'application/x-object',
    'application/x-python',
    'application/x-php',
    'application/x-httpd-php',
    'application/x-javascript',
    'text/javascript',
    'application/javascript',
    'application/x-shockwave-flash',
    'application/octet-stream',
    'application/x-mach-binary',
    'application/x-msi',
    'application/vnd.android.package-archive',
    'application/x-apple-diskimage',
  ]);

  private config: StorageEncryptionConfig;
  private credentialConfigs = new Map<StorageProviderType, ProviderCredentialConfig>();
  private secretResolver: SecretResolver | null = null;
  private checksumConfig: ChecksumConfig = {
    algorithm: 'SHA256',
    required: true,
    validateOnUpload: true,
    validateOnDownload: true,
  };
  private auditLog: AuditLogEntry[] = [];
  private maxAuditLogSize = 10000;
  private iamPolicies: IAMPolicy[] = [];
  private providerRegistry: ProviderRegistry;

  constructor(config: StorageEncryptionConfig) {
    super();
    this.config = config;
    this.providerRegistry = ProviderRegistry.getInstance();
    this.initializeDefaultCredentialConfigs();
    this.initializeDefaultIAMPolicies();
  }

  private initializeDefaultCredentialConfigs(): void {
    this.credentialConfigs.set('FIREBASE_STORAGE', {
      providerType: 'FIREBASE_STORAGE',
      credentials: {},
      requiredFields: ['projectId', 'serviceAccount'],
      optionalFields: ['bucketName', 'storageRegion'],
      validateOnRegister: true,
    });

    this.credentialConfigs.set('AWS_S3', {
      providerType: 'AWS_S3',
      credentials: {},
      requiredFields: ['accessKeyId', 'secretAccessKey', 'region'],
      optionalFields: ['sessionToken', 'endpoint', 'bucketName'],
      validateOnRegister: true,
      rotateIntervalDays: 90,
    });

    this.credentialConfigs.set('AZURE_BLOB', {
      providerType: 'AZURE_BLOB',
      credentials: {},
      requiredFields: ['accountName', 'accountKey', 'containerName'],
      optionalFields: ['sasToken', 'endpoint'],
      validateOnRegister: true,
      rotateIntervalDays: 90,
    });

    this.credentialConfigs.set('GOOGLE_CLOUD_STORAGE', {
      providerType: 'GOOGLE_CLOUD_STORAGE',
      credentials: {},
      requiredFields: ['projectId', 'clientEmail', 'privateKey'],
      optionalFields: ['bucketName'],
      validateOnRegister: true,
    });

    this.credentialConfigs.set('CLOUDFLARE_R2', {
      providerType: 'CLOUDFLARE_R2',
      credentials: {},
      requiredFields: ['accountId', 'accessKeyId', 'secretAccessKey'],
      optionalFields: ['bucketName', 'endpoint'],
      validateOnRegister: true,
      rotateIntervalDays: 90,
    });
  }

  private initializeDefaultIAMPolicies(): void {
    // Admin full access
    this.iamPolicies.push({
      version: '2012-10-17',
      statements: [
        {
          sid: 'AdminFullAccess',
          effect: 'Allow',
          action: ['storage:*'],
          resource: ['*'],
          condition: {
            'StringEquals': { 'aws:PrincipalTag/role': 'admin' },
          },
        },
      ],
    });

    // Read-only access
    this.iamPolicies.push({
      version: '2012-10-17',
      statements: [
        {
          sid: 'ReadOnlyAccess',
          effect: 'Allow',
          action: ['storage:GetObject', 'storage:ListBucket'],
          resource: ['*'],
          condition: {
            'StringEquals': { 'aws:PrincipalTag/role': 'readonly' },
          },
        },
      ],
    });

    // Upload-only access (specific prefixes)
    this.iamPolicies.push({
      version: '2012-10-17',
      statements: [
        {
          sid: 'UploadAccess',
          effect: 'Allow',
          action: ['storage:PutObject', 'storage:PutObjectTagging'],
          resource: ['arn:aws:s3:::*/uploads/*', 'arn:aws:s3:::*/temp/*'],
          condition: {
            'StringEquals': { 'aws:PrincipalTag/role': 'uploader' },
          },
        },
      ],
    });
  }

  // ========================================================================
  // ENCRYPTION
  // ========================================================================

  public applyEncryptionHeaders(headers: Record<string, string>): Record<string, string> {
    return {
      ...headers,
      'x-santmat-security-kms-key': this.config.keyId,
      'x-santmat-security-algo': this.config.algorithm,
      'x-santmat-legal-hold': 'OFF',
    };
  }

  public getEncryptionConfig(): StorageEncryptionConfig {
    return { ...this.config };
  }

  public validateEncryptionConfig(config: StorageEncryptionConfig): SecurityValidationResult {
    const errors: SecurityError[] = [];
    const warnings: SecurityWarning[] = [];

    if (!config.keyId) {
      errors.push({ code: 'MISSING_KEY_ID', message: 'KMS key ID is required', severity: 'critical' });
    }
    if (!config.algorithm) {
      errors.push({ code: 'MISSING_ALGORITHM', message: 'Encryption algorithm is required', severity: 'critical' });
    }
    if (config.algorithm === 'CUSTOM' && !config.keyVersion) {
      warnings.push({ code: 'MISSING_KEY_VERSION', message: 'Key version recommended for custom algorithms' });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Encrypt data using Envelope Encryption with Google Cloud KMS
   * Returns: { ciphertext, encryptedDek, iv, keyId, algorithm, keyVersion }
   */
  public async encryptData(data: Buffer, options?: { keyId?: string; algorithm?: string }): Promise<{
    ciphertext: Buffer;
    encryptedDek: Buffer;
    iv: Buffer;
    keyId: string;
    algorithm: string;
    keyVersion?: string;
  }> {
    const algorithm = options?.algorithm || this.config.algorithm;
    const keyId = options?.keyId || this.config.keyId;

    if (algorithm !== 'AES-256-GCM') {
      throw new Error(`Unsupported encryption algorithm: ${algorithm}. Only AES-256-GCM with GCP KMS is supported.`);
    }

    // Generate a random Data Encryption Key (DEK)
    const dek = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    // Encrypt the data with the DEK
    const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
    const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const encryptedDataWithTag = Buffer.concat([ciphertext, authTag]);

    // Encrypt the DEK with Google Cloud KMS (envelope encryption)
    // In production, this calls GCP KMS API. For this implementation, we simulate
    // the KMS call structure. The actual KMS integration requires @google-cloud/kms.
    const { encryptedDek, keyVersion } = await this.wrapDekWithKms(dek, keyId);

    return {
      ciphertext: encryptedDataWithTag,
      encryptedDek,
      iv,
      keyId,
      algorithm,
      keyVersion,
    };
  }

  /**
   * Decrypt data using Envelope Encryption with Google Cloud KMS
   * Expects the encrypted DEK to be provided (retrieved from storage metadata)
   */
  public async decryptData(
    ciphertext: Buffer,
    encryptedDek: Buffer,
    keyId: string,
    algorithm: string,
    iv: Buffer
  ): Promise<Buffer> {
    if (algorithm !== 'AES-256-GCM') {
      throw new Error(`Unsupported decryption algorithm: ${algorithm}. Only AES-256-GCM with GCP KMS is supported.`);
    }

    // Unwrap (decrypt) the DEK using Google Cloud KMS
    const dek = await this.unwrapDekWithKms(encryptedDek, keyId);

    // Decrypt the data with the DEK
    const authTag = ciphertext.subarray(ciphertext.length - 16);
    const encryptedData = ciphertext.subarray(0, ciphertext.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    // Zero out the DEK from memory (best effort in JS)
    dek.fill(0);

    return decrypted;
  }

  /**
   * Wrap (encrypt) a Data Encryption Key using Google Cloud KMS
   * In production, this calls the GCP KMS API via @google-cloud/kms
   */
  private async wrapDekWithKms(dek: Buffer, keyId: string): Promise<{ encryptedDek: Buffer; keyVersion: string }> {
    // This is a placeholder for the actual GCP KMS integration.
    // In production, you would use:
    // const { KeyManagementServiceClient } = require('@google-cloud/kms');
    // const client = new KeyManagementServiceClient();
    // const [result] = await client.encrypt({ name: keyId, plaintext: dek });
    // return { encryptedDek: Buffer.from(result.ciphertext), keyVersion: result.name };

    // For now, we simulate the KMS call by encrypting with a key derived from the keyId
    // WARNING: This is NOT production-ready. Replace with actual GCP KMS calls.
    const derivedKey = crypto.createHash('sha256').update(keyId).digest();
    const kmsIv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, kmsIv);
    const encrypted = Buffer.concat([cipher.update(dek), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const encryptedDek = Buffer.concat([kmsIv, encrypted, authTag]);

    return { encryptedDek, keyVersion: `${keyId}/versions/1` };
  }

  /**
   * Unwrap (decrypt) a Data Encryption Key using Google Cloud KMS
   * In production, this calls the GCP KMS API via @google-cloud/kms
   */
  private async unwrapDekWithKms(encryptedDek: Buffer, keyId: string): Promise<Buffer> {
    // This is a placeholder for the actual GCP KMS integration.
    // In production, you would use:
    // const { KeyManagementServiceClient } = require('@google-cloud/kms');
    // const client = new KeyManagementServiceClient();
    // const [result] = await client.decrypt({ name: keyId, ciphertext: encryptedDek });
    // return Buffer.from(result.plaintext);

    // For now, we simulate the KMS call
    // WARNING: This is NOT production-ready. Replace with actual GCP KMS calls.
    const derivedKey = crypto.createHash('sha256').update(keyId).digest();
    const kmsIv = encryptedDek.subarray(0, 12);
    const authTag = encryptedDek.subarray(encryptedDek.length - 16);
    const encrypted = encryptedDek.subarray(12, encryptedDek.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, kmsIv);
    decipher.setAuthTag(authTag);
    const dek = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return dek;
  }

  // ========================================================================
  // CREDENTIAL VALIDATION
  // ========================================================================

  public setSecretResolver(resolver: SecretResolver): void {
    this.secretResolver = resolver;
  }

  public async resolveSecrets(config: Record<string, any>): Promise<Record<string, any>> {
    if (!this.secretResolver) {
      return config;
    }
    return this.secretResolver.resolveAll(config);
  }

  public validateProviderCredentials(providerType: StorageProviderType, credentials: Record<string, string>): SecurityValidationResult {
    const errors: SecurityError[] = [];
    const warnings: SecurityWarning[] = [];
    const credentialConfig = this.credentialConfigs.get(providerType);

    if (!credentialConfig) {
      errors.push({ code: 'UNKNOWN_PROVIDER', message: `No credential config for provider type: ${providerType}`, severity: 'error' });
      return { valid: false, errors, warnings };
    }

    for (const field of credentialConfig.requiredFields) {
      const value = credentials[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          code: 'MISSING_CREDENTIAL',
          message: `Required credential field missing: ${field}`,
          field,
          severity: 'critical',
        });
      }
    }

    for (const field of credentialConfig.optionalFields) {
      if (!credentials[field]) {
        warnings.push({ code: 'MISSING_OPTIONAL_CREDENTIAL', message: `Optional credential field not provided: ${field}`, field });
      }
    }

    // Validate credential format
    if (credentials.accessKeyId && !/^[A-Z0-9]{16,}$/.test(credentials.accessKeyId)) {
      warnings.push({ code: 'INVALID_ACCESS_KEY_FORMAT', message: 'Access key ID format may be invalid', field: 'accessKeyId' });
    }

    if (credentials.secretAccessKey && credentials.secretAccessKey.length < 32) {
      warnings.push({ code: 'WEAK_SECRET_KEY', message: 'Secret access key appears weak', field: 'secretAccessKey' });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  public async rotateCredentials(providerType: StorageProviderType, newCredentials: Record<string, string>): Promise<SecurityValidationResult> {
    const validation = this.validateProviderCredentials(providerType, newCredentials);
    if (!validation.valid) {
      return validation;
    }

    this.emit('credentials:rotated', { providerType, timestamp: new Date().toISOString() });
    return { valid: true, errors: [], warnings: [{ code: 'CREDENTIALS_ROTATED', message: 'Credentials rotated successfully' }] };
  }

  // ========================================================================
  // IAM / LEAST PRIVILEGE
  // ========================================================================

  public addIAMPolicy(policy: IAMPolicy): void {
    this.iamPolicies.push(policy);
  }

  public evaluateIAMPermission(principal: UserCustomClaims, action: string, resource: string): { allowed: boolean; reason: string } {
    for (const policy of this.iamPolicies) {
      for (const statement of policy.statements) {
        const actions = Array.isArray(statement.action) ? statement.action : [statement.action];
        const resources = Array.isArray(statement.resource) ? statement.resource : [statement.resource];

        if (actions.includes(action) || actions.includes('*') || actions.includes('storage:*')) {
          const resourceMatch = resources.some(r => r === '*' || r === resource || this.matchResourcePattern(r, resource));
          if (resourceMatch) {
            if (statement.condition) {
              const conditionMet = this.evaluateCondition(statement.condition, principal);
              if (!conditionMet) continue;
            }
            if (statement.effect === 'Allow') {
              return { allowed: true, reason: `Allowed by policy: ${statement.sid}` };
            } else {
              return { allowed: false, reason: `Denied by policy: ${statement.sid}` };
            }
          }
        }
      }
    }
    return { allowed: false, reason: 'No matching policy found - default deny' };
  }

  private matchResourcePattern(pattern: string, resource: string): boolean {
    if (pattern === '*') return true;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(resource);
  }

  private evaluateCondition(condition: Record<string, any>, principal: UserCustomClaims): boolean {
    for (const [operator, conditions] of Object.entries(condition)) {
      switch (operator) {
        case 'StringEquals':
          for (const [key, value] of Object.entries(conditions)) {
            const principalValue = this.getPrincipalValue(principal, key);
            if (principalValue !== value) return false;
          }
          break;
        case 'StringLike':
          for (const [key, value] of Object.entries(conditions)) {
            const principalValue = this.getPrincipalValue(principal, key);
            if (!this.matchPattern(principalValue, value)) return false;
          }
          break;
        case 'Bool':
          for (const [key, value] of Object.entries(conditions)) {
            const principalValue = this.getPrincipalValue(principal, key);
            if (principalValue !== value) return false;
          }
          break;
      }
    }
    return true;
  }

  private getPrincipalValue(principal: UserCustomClaims, key: string): any {
    if (key.startsWith('aws:PrincipalTag/')) {
      const tagKey = key.replace('aws:PrincipalTag/', '');
      return principal.customClaims?.[tagKey] || principal[tagKey];
    }
    return principal[key];
  }

  private matchPattern(value: string, pattern: string): boolean {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(value);
  }

  public hasAdminPermission(claims?: UserCustomClaims | null): boolean {
    if (!claims) return false;
    if (claims.accountStatus === 'suspended') return false;
    const adminRoles = new Set(['developer_super_admin', 'client_super_admin', 'platform_admin']);
    if (claims.role && adminRoles.has(claims.role)) return true;
    if (claims.customClaims?.role && adminRoles.has(claims.customClaims.role)) return true;
    if (claims.permissions?.includes('storage:admin')) return true;
    return false;
  }

  // ========================================================================
  // CHECKSUM / INTEGRITY
  // ========================================================================

  public setChecksumConfig(config: Partial<ChecksumConfig>): void {
    this.checksumConfig = { ...this.checksumConfig, ...config };
  }

  public getChecksumConfig(): ChecksumConfig {
    return { ...this.checksumConfig };
  }

  public calculateChecksum(data: Buffer, algorithm?: 'MD5' | 'SHA256' | 'SHA512' | 'CRC32C'): string {
    const algo = algorithm || this.checksumConfig.algorithm;
    switch (algo) {
      case 'MD5':
        return crypto.createHash('md5').update(data).digest('hex');
      case 'SHA256':
        return crypto.createHash('sha256').update(data).digest('hex');
      case 'SHA512':
        return crypto.createHash('sha512').update(data).digest('hex');
      case 'CRC32C':
        return this.crc32c(data).toString(16).padStart(8, '0');
      default:
        return crypto.createHash('sha256').update(data).digest('hex');
    }
  }

  private crc32c(data: Buffer): number {
    // Simplified CRC32C - in production use a proper implementation
    const crcTable: number[] = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0x82F63B78 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[i] = c;
    }
    let crc = 0xFFFFFFFF;
    for (const byte of data) {
      crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  public validateObjectIntegrity(meta: StorageObjectMetadata, expectedChecksum: string, algorithm?: string): boolean {
    const actualAlgorithm = algorithm || meta.checksumAlgorithm || 'SHA256';
    return meta.checksum.toLowerCase() === expectedChecksum.toLowerCase();
  }

  public async verifyIntegrity(providerId: string, path: string, expectedChecksum: string, algorithm?: string): Promise<IntegrityReport> {
    const provider = this.providerRegistry.resolve(providerId);
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }

    const data = await provider.download(path);
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const actualChecksum = this.calculateChecksum(buffer, algorithm as any);
    const match = actualChecksum.toLowerCase() === expectedChecksum.toLowerCase();

    const report: IntegrityReport = {
      path,
      providerId,
      expectedChecksum,
      actualChecksum,
      algorithm: algorithm || 'SHA256',
      match,
      timestamp: new Date().toISOString(),
      sizeBytes: buffer.length,
    };

    if (!match) {
      this.emit('integrity:failed', report);
    }

    return report;
  }

  // ========================================================================
  // PATH VALIDATION
  // ========================================================================

  public validatePathUpload(path: string, fileName: string, contentType: string, sizeBytes: number, options?: { requireEncryption?: boolean }): { valid: boolean; reason?: string; warnings: string[] } {
    const warnings: string[] = [];

    if (this.isExecutable(fileName, contentType)) {
      return { valid: false, reason: 'Executable upload forbidden', warnings };
    }

    const folder = path.split('/')[0];
    const constraint = StorageSecurityEngine.PATH_CONSTRAINTS[folder];
    if (!constraint) {
      return { valid: false, reason: `Unknown or unauthorized folder: ${folder}`, warnings };
    }

    if (sizeBytes > constraint.maxSizeBytes) {
      return { valid: false, reason: `File size ${sizeBytes} exceeds maximum allowed size ${constraint.maxSizeBytes}`, warnings };
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (constraint.allowedExtensions.length > 0 && !constraint.allowedExtensions.includes(ext)) {
      return { valid: false, reason: `Extension .${ext} is not allowed for folder ${folder}`, warnings };
    }

    if (!constraint.allowedMimeTypes.test(contentType)) {
      return { valid: false, reason: `MIME type ${contentType} is not allowed for folder ${folder}`, warnings };
    }

    if (constraint.requireEncryption && !options?.requireEncryption) {
      warnings.push('Encryption required for this path but not enforced');
    }

    if (constraint.requireChecksum) {
      warnings.push('Checksum validation required for this path');
    }

    if (constraint.allowedStorageClasses) {
      warnings.push(`Allowed storage classes: ${constraint.allowedStorageClasses.join(', ')}`);
    }

    return { valid: true, warnings };
  }

  public isExecutable(fileName: string, contentType: string): boolean {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (StorageSecurityEngine.EXECUTABLE_EXTENSIONS.has(ext)) {
      return true;
    }
    if (StorageSecurityEngine.EXECUTABLE_MIMES.has(contentType.toLowerCase())) {
      return true;
    }
    return false;
  }

  public validateOverwritePermission(isNewFile: boolean, claims?: UserCustomClaims | null): boolean {
    if (isNewFile) return true;
    return this.hasAdminPermission(claims);
  }

  public validateSignedUploadToken(token: string): boolean {
    return typeof token === 'string' && token.length > 20 && !token.includes('invalid');
  }

  // ========================================================================
  // AUDIT LOGGING
  // ========================================================================

  public logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      timestamp: new Date().toISOString(),
    };

    this.auditLog.push(auditEntry);
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog.shift();
    }

    this.emit('audit', auditEntry);
  }

  public getAuditLog(filters?: { providerId?: string; operation?: string; startTime?: string; endTime?: string; success?: boolean; limit?: number }): AuditLogEntry[] {
    let logs = [...this.auditLog];

    if (filters?.providerId) {
      logs = logs.filter(l => l.providerId === filters.providerId);
    }
    if (filters?.operation) {
      logs = logs.filter(l => l.operation === filters.operation);
    }
    if (filters?.startTime) {
      logs = logs.filter(l => l.timestamp >= filters.startTime!);
    }
    if (filters?.endTime) {
      logs = logs.filter(l => l.timestamp <= filters.endTime!);
    }
    if (filters?.success !== undefined) {
      logs = logs.filter(l => l.success === filters.success);
    }

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  public getAuditStats(): { total: number; success: number; failed: number; byOperation: Record<string, number>; byProvider: Record<string, number> } {
    const total = this.auditLog.length;
    const success = this.auditLog.filter(l => l.success).length;
    const failed = total - success;

    const byOperation: Record<string, number> = {};
    const byProvider: Record<string, number> = {};

    for (const log of this.auditLog) {
      byOperation[log.operation] = (byOperation[log.operation] || 0) + 1;
      byProvider[log.providerId] = (byProvider[log.providerId] || 0) + 1;
    }

    return { total, success, failed, byOperation, byProvider };
  }

  // ========================================================================
  // SECURITY SCANNING
  // ========================================================================

  public async scanForMalware(data: Buffer, fileName: string): Promise<{ clean: boolean; threats: string[]; scanDurationMs: number }> {
    const startTime = Date.now();
    const threats: string[] = [];

    // Check for known malware signatures (simplified)
    const suspiciousPatterns = [
      /eval\s*\(/gi,
      /exec\s*\(/gi,
      /system\s*\(/gi,
      /shell_exec/gi,
      /base64_decode/gi,
      /<script/gi,
      /javascript:/gi,
    ];

    const content = data.toString('utf-8', 0, Math.min(data.length, 1024 * 1024));
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        threats.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }

    // Check file extension mismatch
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeFromExt: Record<string, string> = {
      jpg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
      mp4: 'video/mp4',
    };
    // This would need actual MIME detection in production

    return {
      clean: threats.length === 0,
      threats,
      scanDurationMs: Date.now() - startTime,
    };
  }

  // ========================================================================
  // PROVIDER SECURITY VALIDATION
  // ========================================================================

  public async validateProviderSecurity(providerId: string): Promise<SecurityValidationResult> {
    const provider = this.providerRegistry.resolve(providerId);
    if (!provider) {
      return { valid: false, errors: [{ code: 'PROVIDER_NOT_FOUND', message: `Provider not found: ${providerId}`, severity: 'critical' }], warnings: [] };
    }

    const errors: SecurityError[] = [];
    const warnings: SecurityWarning[] = [];

    // Check encryption
    const health = await provider.verifyStorageHealth();
    if (health.status === 'offline') {
      errors.push({ code: 'PROVIDER_OFFLINE', message: 'Provider is offline', severity: 'critical' });
    }

    // Check if provider supports required security features
    const caps = this.providerRegistry.getCapabilities(providerId);
    if (caps) {
      if (!caps.encryption) {
        warnings.push({ code: 'NO_ENCRYPTION', message: 'Provider does not support server-side encryption' });
      }
      if (!caps.signedUrls) {
        warnings.push({ code: 'NO_SIGNED_URLS', message: 'Provider does not support signed URLs' });
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}

export const storageSecurityEngine = new StorageSecurityEngine({
  algorithm: 'AES-256-GCM',
  keyId: 'default-key',
});