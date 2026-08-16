// Sprint M4.0 — Storage Lifecycle Policy Engine (Hot, Warm, Cold, Archive, Expiration)

import type { StorageTier, StorageObjectMetadata } from '../Models/StorageModels';

export class StorageLifecyclePolicy {
  public static evaluateTier(ageDays: number, isArchived: boolean): StorageTier {
    if (isArchived) return 'archive';
    if (ageDays > 365) return 'cold';
    if (ageDays > 90) return 'warm';
    return 'hot';
  }

  public static isExpired(meta: StorageObjectMetadata, retentionDays?: number): boolean {
    if (!retentionDays) return false;
    const created = new Date(meta.createdAt).getTime();
    const expiryTime = created + retentionDays * 86400 * 1000;
    return Date.now() > expiryTime;
  }
}
