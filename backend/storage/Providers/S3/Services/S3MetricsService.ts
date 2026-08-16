// Sprint E2 — S3 Metrics Service
// Handles metrics collection for S3-compatible storage

import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';
import type { S3Client } from '@aws-sdk/client-s3';
import type { StorageMetrics, StorageProviderType } from '../../../Models/StorageModels';

export interface S3MetricsConfig {
  bucketName: string;
  region: string;
  providerType: StorageProviderType;
  cloudWatchEnabled: boolean;
  cloudWatchNamespace: string;
}

export class S3MetricsService {
  private client: S3Client;
  private cloudWatchClient?: CloudWatchClient;
  private config: S3MetricsConfig;
  private uploadMetrics = { total: 0, success: 0, failed: 0, totalBytes: 0, totalLatencyMs: 0 };
  private downloadMetrics = { total: 0, success: 0, failed: 0, totalBytes: 0, totalLatencyMs: 0 };

  constructor(client: S3Client, config: S3MetricsConfig) {
    this.client = client;
    this.config = config;

    if (config.cloudWatchEnabled) {
      this.cloudWatchClient = new CloudWatchClient({ region: config.region });
    }
  }

  recordUpload(success: boolean, bytes: number, latencyMs: number): void {
    this.uploadMetrics.total++;
    this.uploadMetrics.totalBytes += bytes;
    this.uploadMetrics.totalLatencyMs += latencyMs;
    if (success) {
      this.uploadMetrics.success++;
    } else {
      this.uploadMetrics.failed++;
    }
  }

  recordDownload(success: boolean, bytes: number, latencyMs: number): void {
    this.downloadMetrics.total++;
    this.downloadMetrics.totalBytes += bytes;
    this.downloadMetrics.totalLatencyMs += latencyMs;
    if (success) {
      this.downloadMetrics.success++;
    } else {
      this.downloadMetrics.failed++;
    }
  }

  async getMetrics(): Promise<StorageMetrics> {
    const baseMetrics = this.getBaseMetrics();

    if (!this.cloudWatchClient || !this.config.cloudWatchEnabled) {
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

  private getBaseMetrics(): StorageMetrics {
    return {
      totalObjectsCount: 0,
      totalBytesStored: this.uploadMetrics.totalBytes,
      activeTierBreakdown: { hot: 0, warm: 0, cold: 0, archive: 0 },
      throughputBytesPerSec: this.uploadMetrics.totalLatencyMs > 0
        ? (this.uploadMetrics.totalBytes / this.uploadMetrics.totalLatencyMs) * 1000
        : 0,
      errorRatePercentage: this.uploadMetrics.total > 0
        ? (this.uploadMetrics.failed / this.uploadMetrics.total) * 100
        : 0,
      averageLatencyMs: this.uploadMetrics.total > 0
        ? this.uploadMetrics.totalLatencyMs / this.uploadMetrics.total
        : 0,
      costPerMonth: 0,
      costPerGB: 0,
      apiCallsCount: this.uploadMetrics.total + this.downloadMetrics.total,
      uploadCount: this.uploadMetrics.success,
      downloadCount: this.downloadMetrics.success,
      deleteCount: 0,
    };
  }

  private async getCloudWatchMetric(metricName: string, startTime: Date, endTime: Date): Promise<any> {
    if (!this.cloudWatchClient) return null;

    try {
      const command = new GetMetricStatisticsCommand({
        Namespace: this.config.cloudWatchNamespace,
        MetricName: metricName,
        Dimensions: [
          { Name: 'BucketName', Value: this.config.bucketName },
          { Name: 'StorageType', Value: 'StandardStorage' },
        ],
        StartTime: startTime,
        EndTime: endTime,
        Period: 300,
        Statistics: ['Average', 'Maximum', 'Minimum', 'Sum', 'SampleCount'],
      });

      const response = await this.cloudWatchClient.send(command);
      if (response.Datapoints && response.Datapoints.length > 0) {
        return response.Datapoints.sort((a, b) =>
          (b.Timestamp?.getTime() || 0) - (a.Timestamp?.getTime() || 0)
        )[0];
      }
    } catch {
      // CloudWatch metrics not available
    }
    return null;
  }

  async estimateCost(storageBytes: number, requestCount: number, dataTransferOutBytes: number): Promise<number> {
    const storageCostPerGB = 0.023;
    const requestCostPer10k = 0.0004;
    const getRequestCostPer10k = 0.0004;
    const dataTransferCostPerGB = 0.09;

    const storageGB = storageBytes / (1024 * 1024 * 1024);
    const storageCost = storageGB * storageCostPerGB;
    const requestCost = (requestCount / 10000) * requestCostPer10k;
    const transferGB = dataTransferOutBytes / (1024 * 1024 * 1024);
    const transferCost = transferGB * dataTransferCostPerGB;

    return storageCost + requestCost + transferCost;
  }
}