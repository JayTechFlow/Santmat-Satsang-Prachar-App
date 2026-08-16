// Sprint M3.6 — Enterprise Distributed Processing & Queue Engine Test Suite

import { describe, it, expect } from 'vitest';
import { MediaProcessingQueue } from './MediaProcessingQueue';
import { WorkerPool } from './Workers/WorkerPool';
import { RetryEngine } from './RetryEngine';
import type { MediaProcessingJob } from './Models/JobModels';

describe('Sprint M3.6 Enterprise Distributed Processing & Queue Engine', () => {
  it('MediaProcessingQueue enqueues jobs according to Priority Order (Critical -> High -> Normal -> Low)', () => {
    const queue = new MediaProcessingQueue();

    const lowJob: MediaProcessingJob = {
      jobId: 'job_low',
      mediaId: 'm_1',
      jobType: 'image_processing',
      priority: 'low',
      status: 'queued',
      payload: { storagePath: 'images/1.png', mimeType: 'image/png', sizeBytes: 100, fileName: '1.png', metadata: {} },
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      correlationId: 'c1',
      traceId: 't1',
    };

    const criticalJob: MediaProcessingJob = {
      jobId: 'job_critical',
      mediaId: 'm_2',
      jobType: 'image_processing',
      priority: 'critical',
      status: 'queued',
      payload: { storagePath: 'images/2.png', mimeType: 'image/png', sizeBytes: 200, fileName: '2.png', metadata: {} },
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      correlationId: 'c2',
      traceId: 't2',
    };

    queue.enqueue(lowJob);
    queue.enqueue(criticalJob);

    const dequeued = queue.dequeue('w_1');
    expect(dequeued?.jobId).toBe('job_critical');
  });

  it('WorkerPool registers worker nodes and processes next eligible queued job', async () => {
    const queue = new MediaProcessingQueue();
    const pool = new WorkerPool(queue);

    pool.registerWorker('worker_node_101', 'node-1.internal');
    expect(pool.getActiveWorkerCount()).toBe(1);

    const job: MediaProcessingJob = {
      jobId: 'job_img_101',
      mediaId: 'm_img',
      jobType: 'image_processing',
      priority: 'normal',
      status: 'queued',
      payload: { storagePath: 'images/sample.jpg', mimeType: 'image/jpeg', sizeBytes: 1024, fileName: 'sample.jpg', metadata: {} },
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      correlationId: 'c101',
      traceId: 't101',
    };

    queue.enqueue(job);

    const processed = await pool.processNextJob('worker_node_101');
    expect(processed).toBe(true);
    expect(job.status).toBe('completed');
  });

  it('RetryEngine calculates exponential backoff delays and manages max attempts', () => {
    const job: MediaProcessingJob = {
      jobId: 'job_retry',
      mediaId: 'm_retry',
      jobType: 'audio_processing',
      priority: 'normal',
      status: 'failed',
      payload: { storagePath: 'audio/bg.mp3', mimeType: 'audio/mpeg', sizeBytes: 2048, fileName: 'bg.mp3', metadata: {} },
      attemptCount: 1,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      correlationId: 'cr',
      traceId: 'tr',
    };

    expect(RetryEngine.shouldRetry(job)).toBe(true);
    const delayMs = RetryEngine.calculateNextRetryDelay(job, 'exponential');
    expect(delayMs).toBe(4000); // 2^2 * 1000 = 4000ms
  });

  it('MediaProcessingQueue moves poison/failed jobs to Dead-Letter Queue and supports replay', () => {
    const queue = new MediaProcessingQueue();
    const job: MediaProcessingJob = {
      jobId: 'job_dlq',
      mediaId: 'm_dlq',
      jobType: 'video_processing',
      priority: 'normal',
      status: 'queued',
      payload: { storagePath: 'videos/corrupt.mp4', mimeType: 'video/mp4', sizeBytes: 100, fileName: 'corrupt.mp4', metadata: {} },
      attemptCount: 3,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      correlationId: 'cdlq',
      traceId: 'tdlq',
    };

    queue.enqueue(job);
    queue.moveToDeadLetter(job, 'Corrupt container header');

    expect(queue.getDeadLetterJobs().length).toBe(1);
    expect(queue.getDeadLetterJobs()[0].status).toBe('dead_letter');

    // Replay job back to active queue
    const replayed = queue.replayDeadLetter('job_dlq');
    expect(replayed).toBe(true);
    expect(queue.getDeadLetterJobs().length).toBe(0);
  });
});
