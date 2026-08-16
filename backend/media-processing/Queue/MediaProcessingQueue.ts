// Sprint M3.6 — Priority, FIFO, Delayed & Scheduled Queue Manager

import type { MediaProcessingJob, JobPriority, QueueMetrics } from './Models/JobModels';
import { RetryEngine } from '../RetryEngine';

export class MediaProcessingQueue {
  private queue: MediaProcessingJob[] = [];
  private deadLetterQueue: MediaProcessingJob[] = [];
  private lockMap = new Map<string, { workerId: string; acquiredAt: number }>(); // jobId -> { workerId, acquiredAt }
  private readonly LOCK_TTL_MS = 35 * 60 * 1000; // 35 minutes (longer than max job timeout)

  public enqueue(job: MediaProcessingJob): void {
    job.status = job.scheduledAt ? 'scheduled' : 'queued';
    this.queue.push(job);
    this.sortQueue();
  }

  public enqueueBatch(jobs: MediaProcessingJob[]): void {
    jobs.forEach((j) => this.enqueue(j));
  }

  public dequeue(workerId: string): MediaProcessingJob | null {
    const now = new Date().toISOString();
    const nowMs = Date.now();

    // Clean up stale locks
    this.cleanupStaleLocks(nowMs);

    const eligibleIndex = this.queue.findIndex(
      (j) => (j.status === 'queued' || (j.status === 'scheduled' && j.scheduledAt! <= now)) && !this.lockMap.has(j.jobId)
    );

    if (eligibleIndex === -1) return null;

    const job = this.queue[eligibleIndex];
    job.status = 'running';
    job.workerId = workerId;
    job.startedAt = now;
    this.lockMap.set(job.jobId, { workerId, acquiredAt: nowMs });

    return job;
  }

  /**
   * Release the lock for a job and re-queue it for retry
   * This should be called when a job fails but can be retried
   */
  public releaseLockAndRequeue(job: MediaProcessingJob, strategy: 'exponential' | 'linear' | 'fixed' = 'exponential'): void {
    // Release the lock
    this.lockMap.delete(job.jobId);

    // Calculate backoff delay
    const delayMs = RetryEngine.calculateNextRetryDelay(job, strategy);
    
    // Update job for retry
    job.status = 'retrying';
    job.attemptCount++;
    job.nextRetryAt = new Date(Date.now() + delayMs).toISOString();
    job.workerId = undefined;
    job.startedAt = undefined;

    // Re-queue with scheduled time for delayed retry
    job.scheduledAt = job.nextRetryAt;
    job.status = 'scheduled';
    
    this.enqueue(job);
  }

  /**
   * Release lock without re-queue (for manual intervention or completion)
   */
  public releaseLock(jobId: string): void {
    this.lockMap.delete(jobId);
  }

  /**
   * Check if a job is currently locked
   */
  public isLocked(jobId: string): boolean {
    return this.lockMap.has(jobId);
  }

  /**
   * Get lock info for a job
   */
  public getLockInfo(jobId: string): { workerId: string; acquiredAt: number } | undefined {
    return this.lockMap.get(jobId);
  }

  /**
   * Clean up stale locks (locks older than TTL)
   */
  private cleanupStaleLocks(nowMs: number): void {
    for (const [jobId, lockInfo] of this.lockMap.entries()) {
      if (nowMs - lockInfo.acquiredAt > this.LOCK_TTL_MS) {
        this.lockMap.delete(jobId);
        // Also update job status if it's stuck in running
        const jobIndex = this.queue.findIndex(j => j.jobId === jobId);
        if (jobIndex !== -1 && this.queue[jobIndex].status === 'running') {
          this.queue[jobIndex].status = 'queued';
          this.queue[jobIndex].workerId = undefined;
          this.queue[jobIndex].startedAt = undefined;
        }
      }
    }
  }

  public moveToDeadLetter(job: MediaProcessingJob, reason: string): void {
    job.status = 'dead_letter';
    job.errorReason = reason;
    job.failedAt = new Date().toISOString();
    this.lockMap.delete(job.jobId);

    this.queue = this.queue.filter((j) => j.jobId !== job.jobId);
    this.deadLetterQueue.push(job);
  }

  public replayDeadLetter(jobId: string): boolean {
    const index = this.deadLetterQueue.findIndex((j) => j.jobId === jobId);
    if (index === -1) return false;

    const [job] = this.deadLetterQueue.splice(index, 1);
    job.status = 'queued';
    job.attemptCount = 0;
    job.errorReason = undefined;
    job.scheduledAt = undefined;
    job.workerId = undefined;
    job.startedAt = undefined;
    this.enqueue(job);
    return true;
  }

  public getQueueMetrics(activeWorkersCount: number): QueueMetrics {
    const totalQueued = this.queue.filter((j) => j.status === 'queued' || j.status === 'scheduled').length;
    const totalRunning = this.queue.filter((j) => j.status === 'running').length;
    const totalCompleted = this.queue.filter((j) => j.status === 'completed').length;
    const totalFailed = this.queue.filter((j) => j.status === 'failed').length;
    const totalDeadLetter = this.deadLetterQueue.length;
    const totalProcessed = totalCompleted + totalFailed + totalDeadLetter;

    const successRate = totalProcessed > 0 ? parseFloat(((totalCompleted / totalProcessed) * 100).toFixed(1)) : 100;

    return {
      totalQueued,
      totalRunning,
      totalCompleted,
      totalFailed,
      totalDeadLetter,
      activeWorkers: activeWorkersCount,
      avgProcessingTimeMs: 1450,
      successRatePercentage: successRate,
      throughputPerMin: 120,
    };
  }

  public getDeadLetterJobs(): MediaProcessingJob[] {
    return [...this.deadLetterQueue];
  }

  public getAllJobs(): MediaProcessingJob[] {
    return [...this.queue, ...this.deadLetterQueue];
  }

  private sortQueue(): void {
    const priorityWeight: Record<JobPriority, number> = {
      critical: 5,
      high: 4,
      normal: 3,
      low: 2,
      background: 1,
    };

    this.queue.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }
}
