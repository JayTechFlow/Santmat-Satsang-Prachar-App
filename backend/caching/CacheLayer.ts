// Sprint M7.10 — Enterprise Cache Layer (Agent J)

import type { CacheEntry, CacheOptions, CacheStats } from './Interfaces/IPerformanceCachingInterfaces';

export class CacheLayer<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxEntries: number;
  private defaultTtlSeconds: number;
  private hitCount = 0;
  private missCount = 0;
  private evictedCount = 0;

  constructor(maxEntries = 1000, defaultTtlSeconds = 300) {
    this.maxEntries = maxEntries;
    this.defaultTtlSeconds = defaultTtlSeconds;
  }

  public set(key: string, value: T, options: CacheOptions = {}): CacheEntry<T> {
    this.evictExpired();

    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    const ttl = options.ttlSeconds ?? this.defaultTtlSeconds;
    const now = Date.now();
    const expiresAt = ttl > 0 ? now + ttl * 1000 : null;

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt,
      lastAccessedAt: now,
      accessCount: 0,
      tags: options.tags || [],
      sizeBytes: JSON.stringify(value).length * 2,
    };

    this.cache.set(key, entry);
    return entry;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      this.missCount++;
      return null;
    }

    if (entry.expiresAt !== null && entry.expiresAt <= now) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    entry.lastAccessedAt = now;
    entry.accessCount++;
    this.hitCount++;
    return entry.value;
  }

  public getEntry(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry;
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public invalidateTag(tag: string): number {
    let invalidated = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  public invalidatePattern(pattern: string): number {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    let invalidated = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  public clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.evictedCount = 0;
  }

  public evictExpired(): number {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey: string | null = null;
    let oldestAccessTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessedAt < oldestAccessTime) {
        oldestAccessTime = entry.lastAccessedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.evictedCount++;
    }
  }

  public getStats(): CacheStats {
    let totalSizeBytes = 0;
    for (const entry of this.cache.values()) {
      totalSizeBytes += entry.sizeBytes;
    }

    const totalOps = this.hitCount + this.missCount;
    const hitRatio = totalOps > 0 ? this.hitCount / totalOps : 0;

    return {
      itemCount: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRatio: Math.round(hitRatio * 10000) / 100,
      evictedCount: this.evictedCount,
      totalSizeBytes,
    };
  }
}
