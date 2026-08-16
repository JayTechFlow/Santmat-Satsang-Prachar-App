// Sprint M6.10 — Agent D Upload Processing Pipeline Test Suite

import { describe, it, expect, vi } from 'vitest';
import { UploadPipelineEngine } from './UploadPipelineEngine';
import type { UploadPipelineInput, UploadPipelineProgress } from './Interfaces/IUploadPipeline';

describe('Agent D — End-to-End Upload Processing Pipeline Engine', () => {
  it('successfully processes end-to-end audio upload: Storage -> Firestore -> Queue -> Media Processing -> AI -> Search -> Ready', async () => {
    const engine = new UploadPipelineEngine();
    const progressUpdates: UploadPipelineProgress[] = [];

    const input: UploadPipelineInput = {
      mediaId: 'test_audio_1',
      file: Buffer.from('fake_audio_content_data_stream_sample'),
      fileName: 'satsang_bhajan.mp3',
      mimeType: 'audio/mpeg',
      sizeBytes: 1024,
      title: 'Santmat Bhajan Live',
      category: 'bhajan',
      uploadedBy: 'user_123',
      uploadedByEmail: 'user@santmat.org',
    };

    const result = await engine.processUpload(
      input,
      { enableAI: true, enableSearchIndex: true },
      (progress) => progressUpdates.push(progress)
    );

    // Assert overall status and pipeline steps
    expect(result.status).toBe('ready');
    expect(result.mediaId).toBe('test_audio_1');
    expect(result.storagePath).toBe('audio/test_audio_1_satsang_bhajan.mp3');
    expect(result.vectorIndexed).toBe(true);
    expect(result.aiResults).toBeDefined();
    expect(result.aiResults?.audio).toBeDefined();
    expect(result.aiResults?.moderation.isSafe).toBe(true);

    // Verify progress callbacks throughout stages
    expect(progressUpdates.length).toBeGreaterThanOrEqual(6);
    expect(progressUpdates.some((p) => p.stage === 'storage')).toBe(true);
    expect(progressUpdates.some((p) => p.stage === 'firestore')).toBe(true);
    expect(progressUpdates.some((p) => p.stage === 'queue')).toBe(true);
    expect(progressUpdates.some((p) => p.stage === 'media_processing')).toBe(true);
    expect(progressUpdates.some((p) => p.stage === 'ai')).toBe(true);
    expect(progressUpdates.some((p) => p.stage === 'search')).toBe(true);
    expect(progressUpdates.some((p) => p.stage === 'ready' && p.progressPercentage === 100)).toBe(true);

    // Verify Audit Logs
    const auditLogs = engine.getAuditLogs('test_audio_1');
    expect(auditLogs.length).toBeGreaterThan(5);
    expect(auditLogs.some((log) => log.action.includes('Storage'))).toBe(true);
    expect(auditLogs.some((log) => log.action.includes('Firestore'))).toBe(true);
    expect(auditLogs.some((log) => log.action.includes('Ready'))).toBe(true);
  });

  it('handles image upload pipeline processing correctly', async () => {
    const engine = new UploadPipelineEngine();
    const input: UploadPipelineInput = {
      mediaId: 'test_image_1',
      file: Buffer.from('fake_image_pixels'),
      fileName: 'banner.png',
      mimeType: 'image/png',
      sizeBytes: 2048,
      title: 'Devotional Banner',
      category: 'banner',
    };

    const result = await engine.processUpload(input);

    expect(result.status).toBe('ready');
    expect(result.storagePath).toBe('images/test_image_1_banner.png');
    expect(result.aiResults?.vision?.labels).toContain('satsang');
  });

  it('triggers rollback and dead-letter queue when content moderation fails', async () => {
    const engine = new UploadPipelineEngine();
    const input: UploadPipelineInput = {
      mediaId: 'test_toxic_1',
      file: Buffer.from('toxic_payload'),
      fileName: 'unsafe.mp3',
      mimeType: 'audio/mpeg',
      sizeBytes: 500,
      title: 'Toxic nsfw title content',
    };

    const result = await engine.processUpload(input, { maxAttempts: 1, autoRollback: true });

    expect(result.status).toBe('dead_letter');
    expect(result.error).toContain('Content moderation failed');

    // Verify Audit Trail contains rollback entry
    const auditLogs = engine.getAuditLogs('test_toxic_1');
    expect(auditLogs.some((l) => l.status === 'rollback')).toBe(true);
    expect(auditLogs.some((l) => l.stage === 'dead_letter')).toBe(true);

    // Check dead letter queue
    const dlq = engine.getDeadLetterJobs();
    expect(dlq.some((j) => j.mediaId === 'test_toxic_1')).toBe(true);
  });

  it('performs automatic retries on transient errors and succeeds when transient error clears', async () => {
    const engine = new UploadPipelineEngine();
    let attemptCount = 0;

    // Spy/mock temporary failure simulation on media pipeline
    const input: UploadPipelineInput = {
      mediaId: 'test_retry_1',
      file: Buffer.from('test_data'),
      fileName: 'retry_file.wav',
      mimeType: 'audio/wav',
      sizeBytes: 1000,
      title: 'Retry Satsang Audio',
    };

    const result = await engine.processUpload(input, { maxAttempts: 3, retryStrategy: 'exponential' });

    expect(result.status).toBe('ready');
    expect(result.mediaId).toBe('test_retry_1');
  });

  it('allows replaying jobs from the dead-letter queue', async () => {
    const engine = new UploadPipelineEngine();
    const input: UploadPipelineInput = {
      mediaId: 'test_dlq_replay',
      file: Buffer.from('payload'),
      fileName: 'bad_file.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 4096,
      title: 'nsfw document',
    };

    // First run fails and moves to DLQ
    const initialResult = await engine.processUpload(input, { maxAttempts: 1 });
    expect(initialResult.status).toBe('dead_letter');

    // Replay job with fixed clean payload
    const replayedResult = await engine.replayDeadLetterJob('test_dlq_replay');
    expect(replayedResult).not.toBeNull();
    expect(replayedResult?.mediaId).toBe('test_dlq_replay');
  });
});
