// Sprint M3.7 — Distributed Tracing & Structured Logging Engine

import type { OperationContext } from './Models/TelemetryModels';

export class DistributedTracer {
  public static createTraceContext(jobId?: string, mediaId?: string, workerId?: string): OperationContext {
    const randomHex = () => Math.random().toString(36).substring(2, 10);
    return {
      traceId: `tr_${randomHex()}_${randomHex()}`,
      correlationId: `corr_${randomHex()}`,
      jobId,
      mediaId,
      workerId,
      startTime: new Date().toISOString(),
    };
  }

  public static log(level: 'INFO' | 'WARN' | 'ERROR', ctx: OperationContext, message: string, extra?: Record<string, unknown>): void {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      traceId: ctx.traceId,
      correlationId: ctx.correlationId,
      jobId: ctx.jobId,
      workerId: ctx.workerId,
      message,
      extra,
    };
    // Structured JSON log output abstraction
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  }
}
