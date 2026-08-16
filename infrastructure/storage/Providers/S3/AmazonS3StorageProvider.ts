// Sprint E2.3 — AWS S3 Provider
// Enterprise Reference Provider implementing full S3 capabilities
// Inherits from S3CompatibleStorageProvider for reuse by Cloudflare R2, MinIO, Wasabi, DigitalOcean Spaces

import { S3Client } from '@aws-sdk/client-s3';
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import type { S3CompatibleConfiguration } from './S3CompatibleStorageProvider';
import { S3CompatibleStorageProvider } from './S3CompatibleStorageProvider';

export interface AmazonS3Configuration extends S3CompatibleConfiguration {
  bucketName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  storageClass?: 'STANDARD' | 'INTELLIGENT_TIERING' | 'STANDARD_IA' | 'ONEZONE_IA' | 'GLACIER' | 'DEEP_ARCHIVE' | 'REDUCED_REDUNDANCY';
  enableAccelerate?: boolean;
  cloudWatchEnabled?: boolean;
  cloudWatchNamespace?: string;
}

export class AmazonS3StorageProvider extends S3CompatibleStorageProvider {
  public readonly providerType: string = 'AWS_S3';
  private cloudWatchClient?: CloudWatchClient;
  private cloudWatchEnabled: boolean;
  private cloudWatchNamespace: string;

  constructor(config: AmazonS3Configuration) {
    const s3Config: S3CompatibleConfiguration = {
      region: config.region,
      bucketName: config.bucketName,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        sessionToken: config.sessionToken,
      },
      defaultStorageClass: config.storageClass,
      maxRetries: config.maxRetries,
      retryDelayMs: config.retryDelayMs,
      multipartThreshold: config.multipartThreshold,
      multipartPartSize: config.multipartPartSize,
      concurrentParts: config.concurrentParts,
    };

    super(s3Config);

    this.cloudWatchEnabled = config.cloudWatchEnabled ?? true;
    this.cloudWatchNamespace = config.cloudWatchNamespace || 'AWS/S3';

    if (this.cloudWatchEnabled) {
      this.cloudWatchClient = new CloudWatchClient({ region: config.region });
    }
  }

  protected getProviderType(): 'AWS_S3' {
    return 'AWS_S3';
  }

  protected getSupportedStorageClasses(): string[] {
    return [
      'STANDARD',
      'INTELLIGENT_TIERING',
      'STANDARD_IA',
      'ONEZONE_IA',
      'GLACIER',
      'DEEP_ARCHIVE',
      'REDUCED_REDUNDANCY',
    ];
  }

  protected getSupportedTiers(): StorageTier[] {
    return ['hot', 'warm', 'cold', 'archive'];
  }

  /**
   * Get detailed health metrics from CloudWatch
   */
  public async getHealth(): Promise<any> {
    const baseHealth = await super.getHealth();

    if (!this.cloudWatchClient || !this.cloudWatchEnabled) {
      return baseHealth;
    }

    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const [storageMetrics, requestMetrics] = await Promise.all([
        this.getCloudWatchMetric('BucketSizeBytes', fiveMinutesAgo, now),
        this.getCloudWatchMetric('AllRequests', fiveMinutesAgo, now),
      ]);

      return {
        ...baseHealth,
        availableCapacityBytes: storageMetrics?.Maximum || baseHealth.availableCapacityBytes,
        usedCapacityBytes: storageMetrics?.Minimum || 0,
        totalCapacityBytes: storageMetrics?.Maximum || baseHealth.totalCapacityBytes,
        throughputBytesPerSec: requestMetrics?.Sum || baseHealth.throughputBytesPerSec,
        connectionCount: requestMetrics?.SampleCount || 0,
      };
    } catch {
      return baseHealth;
    }
  }

  private async getCloudWatchMetric(metricName: string, startTime: Date, endTime: Date): Promise<any> {
    if (!this.cloudWatchClient) return null;

    try {
      const command = new GetMetricStatisticsCommand({
        Namespace: this.cloudWatchNamespace,
        MetricName: metricName,
        Dimensions: [
          { Name: 'BucketName', Value: this.bucketName },
          { Name: 'StorageType', Value: 'StandardStorage' },
        ],
        StartTime: startTime,
        EndTime: endTime,
        Period: 300,
        Statistics: ['Average', 'Maximum', 'Minimum', 'Sum', 'SampleCount'],
      });

      const response = await this.cloudWatchClient.send(command);
      if (response.Datapoints && response.Datapoints.length > 0) {
        // Return the most recent datapoint
        return response.Datapoints.sort((a, b) =>
          (b.Timestamp?.getTime() || 0) - (a.Timestamp?.getTime() || 0)
        )[0];
      }
    } catch {
      // CloudWatch metrics not available
    }
    return null;
  }

  /**
   * Get lifecycle configuration for bucket
   */
  public async getLifecycleConfiguration(): Promise<any> {
    const { GetBucketLifecycleConfigurationCommand } = await import('@aws-sdk/client-s3');
    const command = new GetBucketLifecycleConfigurationCommand({ Bucket: this.bucketName });
    return this.client.send(command);
  }

  /**
   * Set lifecycle configuration for bucket
   */
  public async setLifecycleConfiguration(rules: any[]): Promise<void> {
    const { PutBucketLifecycleConfigurationCommand } = await import('@aws-sdk/client-s3');
    const command = new PutBucketLifecycleConfigurationCommand({
      Bucket: this.bucketName,
      LifecycleConfiguration: { Rules: rules },
    });
    await this.client.send(command);
  }

  /**
   * Get bucket versioning status
   */
  public async getBucketVersioning(): Promise<any> {
    const { GetBucketVersioningCommand } = await import('@aws-sdk/client-s3');
    const command = new GetBucketVersioningCommand({ Bucket: this.bucketName });
    return this.client.send(command);
  }

  /**
   * Enable/disable bucket versioning
   */
  public async setBucketVersioning(enabled: boolean): Promise<void> {
    const { PutBucketVersioningCommand } = await import('@aws-sdk/client-s3');
    const command = new PutBucketVersioningCommand({
      Bucket: this.bucketName,
      VersioningConfiguration: { Status: enabled ? 'Enabled' : 'Suspended' },
    });
    await this.client.send(command);
  }

  /**
   * Get bucket replication configuration
   */
  public async getBucketReplication(): Promise<any> {
    const { GetBucketReplicationCommand } = await import('@aws-sdk/client-s3');
    const command = new GetBucketReplicationCommand({ Bucket: this.bucketName });
    return this.client.send(command);
  }

  /**
   * Set bucket replication configuration
   */
  public async setBucketReplication(config: any): Promise<void> {
    const { PutBucketReplicationCommand } = await import('@aws-sdk/client-s3');
    const command = new PutBucketReplicationCommand({
      Bucket: this.bucketName,
      ReplicationConfiguration: config,
    });
    await this.client.send(command);
  }

  /**
   * Get bucket encryption configuration
   */
  public async getBucketEncryption(): Promise<any> {
    const { GetBucketEncryptionCommand } = await import('@aws-sdk/client-s3');
    const command = new GetBucketEncryptionCommand({ Bucket: this.bucketName });
    return this.client.send(command);
  }

  /**
   * Get detailed metrics including CloudWatch data
   */
  public async getMetrics(): Promise<any> {
    const baseMetrics = await super.getMetrics();

    if (!this.cloudWatchClient || !this.cloudWatchEnabled) {
      return baseMetrics;
    }

    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const [getRequests, putRequests, deleteRequests, bytesDownloaded, bytesUploaded, errors4xx, errors5xx] = await Promise.all([
        this.getCloudWatchMetric('NumberOfObjects', oneHourAgo, now),
        this.getCloudWatchMetric('AllRequests', oneHourAgo, now),
        this.getCloudWatchMetric('DeleteRequests', oneHourAgo, now),
        this.getCloudWatchMetric('BytesDownloaded', oneHourAgo, now),
        this.getCloudWatchMetric('BytesUploaded', oneHourAgo, now),
        this.getCloudWatchMetric('4xxErrors', oneHourAgo, now),
        this.getCloudWatchMetric('5xxErrors', oneHourAgo, now),
      ]);

      return {
        ...baseMetrics,
        totalObjectsCount: getRequests?.Maximum || baseMetrics.totalObjectsCount,
        totalBytesStored: baseMetrics.totalBytesStored,
        throughputBytesPerSec: (bytesDownloaded?.Sum || 0 + bytesUploaded?.Sum || 0) / 3600,
        errorRatePercentage: ((errors4xx?.Sum || 0 + errors5xx?.Sum || 0) / (putRequests?.Sum || 1)) * 100,
        apiCallsCount: (putRequests?.Sum || 0) + (getRequests?.Sum || 0),
        uploadCount: putRequests?.Sum || baseMetrics.uploadCount,
        downloadCount: getRequests?.Sum || baseMetrics.downloadCount,
      };
    } catch {
      return baseMetrics;
    }
  }

  /**
   * Get provider-specific capabilities with S3-specific metadata
   */
  public getCapabilities(): any {
    const base = super.getCapabilities();

    // Add S3-specific capabilities
    base.add('encryption_sse_s3');
    base.add('encryption_sse_kms');
    base.add('encryption_cmek');
    base.add('lifecycle_rules');
    base.add('lifecycle_transitions');
    base.add('lifecycle_expiration');
    base.add('replication_cross_region');
    base.add('replication_same_region');
    base.add('replication_delete_marker');
    base.add('replication_time_control');
    base.add('cdn_integration');
    base.add('geo_routing');
    base.add('tagging');
    base.add('archive');
    base.add('restore_expedited');
    base.add('restore_standard');
    base.add('restore_bulk');
    base.add('object_lock');
    base.add('compression_gzip');
    base.add('compression_zstd');
    base.add('compression_auto');

    return base;
  }

  /**
   * Estimate monthly cost for this provider
   */
  public async estimateCost(storageBytes: number, requestCount: number, dataTransferOutBytes: number): Promise<number> {
    // AWS S3 pricing (us-east-1, approximate)
    const storageCostPerGB = 0.023; // STANDARD
    const requestCostPer10k = 0.0004; // PUT/COPY/POST/LIST
    const getRequestCostPer10k = 0.0004; // GET
    const dataTransferCostPerGB = 0.09; // First 10TB

    const storageGB = storageBytes / (1024 * 1024 * 1024);
    const storageCost = storageGB * storageCostPerGB;

    const requestCost = (requestCount / 10000) * requestCostPer10k;
    const transferGB = dataTransferOutBytes / (1024 * 1024 * 1024);
    const transferCost = transferGB * dataTransferCostPerGB;

    return storageCost + requestCost + transferCost;
  }

  /**
   * Check if bucket exists and is accessible
   */
  public async checkBucketAccess(): Promise<boolean> {
    try {
      await this.client.send(new (await import('@aws-sdk/client-s3')).HeadBucketCommand({ Bucket: this.bucketName }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get bucket location/region
   */
  public async getBucketLocation(): Promise<string> {
    const { GetBucketLocationCommand } = await import('@aws-sdk/client-s3');
    const command = new GetBucketLocationCommand({ Bucket: this.bucketName });
    const response = await this.client.send(command);
    return response.LocationConstraint || this.config.region;
  }
}