// Sprint M6.10 — Structured Telemetry Logging & Distributed Tracing Service

import { ObservabilityPlatform } from './ObservabilityPlatform';
import type { AlertSeverity } from './Models/ObservabilityModels';

export interface TelemetryLogEntry {
  timestamp: string;
  traceId: string;
  correlationId: string;
  level: AlertSeverity;
  component: string;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class ObservabilityLogger {
  private static logs: TelemetryLogEntry[] = [];
  private static currentTraceId: string = `tr_${Math.random().toString(36).substring(2, 10)}`;
  private static currentCorrelationId: string = `corr_${Math.random().toString(36).substring(2, 10)}`;

  public static startTrace(jobId?: string, mediaId?: string): { traceId: string; correlationId: string } {
    this.currentTraceId = `tr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    this.currentCorrelationId = `corr_${jobId ?? 'job'}_${mediaId ?? 'media'}`;
    ObservabilityPlatform.setTraceContext(this.currentTraceId, this.currentCorrelationId);
    return {
      traceId: this.currentTraceId,
      correlationId: this.currentCorrelationId,
    };
  }

  public static getTraceContext(): { traceId: string; correlationId: string } {
    return {
      traceId: this.currentTraceId,
      correlationId: this.currentCorrelationId,
    };
  }

  public static info(component: string, message: string, context?: Record<string, unknown>): void {
    this.log('info', component, message, context);
  }

  public static warn(component: string, message: string, context?: Record<string, unknown>): void {
    this.log('warning', component, message, context);
  }

  public static error(component: string, message: string, err?: Error | unknown, context?: Record<string, unknown>): void {
    const errorDetails = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : undefined;
    this.log('error', component, message, context, errorDetails);
    
    // Automatically record to Error Metrics in Observability Platform
    ObservabilityPlatform.recordErrorMetrics(component, 1);
  }

  public static critical(component: string, message: string, err?: Error | unknown, context?: Record<string, unknown>): void {
    const errorDetails = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : undefined;
    this.log('critical', component, message, context, errorDetails);
    
    // Raise operational alert in Observability Platform
    ObservabilityPlatform.raiseAlert('CriticalSystemFailure', component, 'critical', message);
    ObservabilityPlatform.recordErrorMetrics(component, 1);
  }

  private static log(
    level: AlertSeverity,
    component: string,
    message: string,
    context?: Record<string, unknown>,
    errorObj?: { name: string; message: string; stack?: string }
  ): void {
    const entry: TelemetryLogEntry = {
      timestamp: new Date().toISOString(),
      traceId: this.currentTraceId,
      correlationId: this.currentCorrelationId,
      level,
      component,
      message,
      context,
      error: errorObj,
    };

    this.logs.push(entry);
    if (this.logs.length > 5000) {
      this.logs.shift();
    }
  }

  public static getRecentLogs(limitCount = 100): TelemetryLogEntry[] {
    return this.logs.slice(-limitCount);
  }

  public static clearLogs(): void {
    this.logs = [];
  }
}
