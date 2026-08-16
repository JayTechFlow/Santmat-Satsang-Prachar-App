// Sprint M3.6 — Exponential Backoff & Linear Retry Engine

import type { MediaProcessingJob } from '../Models/JobModels';

export class RetryEngine {
  public static calculateNextRetryDelay(job: MediaProcessingJob, strategy: 'exponential' | 'linear' | 'fixed' = 'exponential'): number {
    const attempt = job.attemptCount + 1;

    if (strategy === 'exponential') {
      // Exponential backoff: 2s, 4s, 8s, 16s, 32s (capped at 5 mins)
      const delaySec = Math.min(300, Math.pow(2, attempt));
      return delaySec * 1000;
    } else if (strategy === 'linear') {
      return attempt * 5000; // 5s, 10s, 15s
    } else {
      return 3000; // Fixed 3s
    }
  }

  public static shouldRetry(job: MediaProcessingJob): boolean {
    return job.attemptCount < job.maxAttempts;
  }
}
