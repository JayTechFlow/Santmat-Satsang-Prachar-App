// Sprint M3.7 — AlertManager & Rule Evaluator

import type { OperationalAlert, AlertSeverity } from './Models/TelemetryModels';

export class AlertManager {
  private static alerts: OperationalAlert[] = [];

  public static raiseAlert(ruleName: string, severity: AlertSeverity, message: string): OperationalAlert {
    const alert: OperationalAlert = {
      alertId: `alert_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      ruleName,
      severity,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    this.alerts.unshift(alert);
    return alert;
  }

  public static acknowledgeAlert(alertId: string, userId: string): boolean {
    const target = this.alerts.find((a) => a.alertId === alertId);
    if (!target) return false;

    target.acknowledged = true;
    target.acknowledgedBy = userId;
    target.acknowledgedAt = new Date().toISOString();
    return true;
  }

  public static getActiveAlerts(): OperationalAlert[] {
    return [...this.alerts];
  }
}
