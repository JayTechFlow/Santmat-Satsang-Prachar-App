// Sprint M4.0 — Primary/Secondary & Failover Storage Strategy Engine

import type { IStorageStrategy, IStorageProvider } from '../Interfaces/IStorageInterfaces';
import type { StorageObjectMetadata, StorageOptions, StorageStrategyType } from '../Models/StorageModels';

export class PrimarySecondaryStrategy implements IStorageStrategy {
  public readonly strategyType: StorageStrategyType = 'primary_secondary';

  constructor(
    private primaryProvider: IStorageProvider,
    private secondaryProvider: IStorageProvider
  ) {}

  public async executeUpload(path: string, content: Buffer, options?: StorageOptions): Promise<StorageObjectMetadata> {
    try {
      const primaryMeta = await this.primaryProvider.upload(path, content, options);
      // Asynchronous replica replication to secondary
      this.secondaryProvider.upload(path, content, options).catch(() => {});
      return primaryMeta;
    } catch (err: unknown) {
      // Failover to secondary
      return this.secondaryProvider.upload(path, content, options);
    }
  }
}
