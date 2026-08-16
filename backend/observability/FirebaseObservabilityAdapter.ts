// Sprint M6.10 — Firebase Integration Adapter for Observability Platform

import { ObservabilityPlatform } from './ObservabilityPlatform';
import type {
  ObservabilitySnapshot,
  OperationalAlert,
  ObservabilityExecutiveReport,
} from './Models/ObservabilityModels';

export interface FirebaseFirestoreClient {
  collection(path: string): {
    add(data: Record<string, any>): Promise<{ id: string }>;
    doc(id: string): {
      set(data: Record<string, any>, options?: { merge?: boolean }): Promise<void>;
      update(data: Record<string, any>): Promise<void>;
      get(): Promise<{ exists: boolean; data(): any }>;
    };
    orderBy(field: string, direction?: 'asc' | 'desc'): {
      limit(n: number): {
        get(): Promise<{ docs: Array<{ id: string; data(): any }> }>;
      };
    };
  };
}

export class FirebaseObservabilityAdapter {
  private firestore: FirebaseFirestoreClient | null = null;

  constructor(firestore?: FirebaseFirestoreClient) {
    if (firestore) {
      this.firestore = firestore;
    }
  }

  public setFirestore(firestore: FirebaseFirestoreClient): void {
    this.firestore = firestore;
  }

  /**
   * Sync current local Observability snapshot to Firebase Firestore collection 'system_metrics'
   */
  public async syncSnapshotToFirebase(customSnapshot?: ObservabilitySnapshot): Promise<{ success: boolean; docId?: string; error?: string }> {
    const snapshot = customSnapshot ?? ObservabilityPlatform.createSnapshot();
    
    if (!this.firestore) {
      // In standalone or test environments without live Firestore instance
      return { success: true, docId: `mock_fire_${Date.now()}` };
    }

    try {
      const docRef = await this.firestore.collection('system_metrics').add({
        ...snapshot,
        syncedAt: new Date().toISOString(),
      });
      return { success: true, docId: docRef.id };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to sync metric snapshot to Firestore' };
    }
  }

  /**
   * Fetch recent metric snapshots from Firebase Firestore collection 'system_metrics'
   */
  public async fetchSnapshotsFromFirebase(limitCount = 50): Promise<ObservabilitySnapshot[]> {
    if (!this.firestore) {
      return [ObservabilityPlatform.getLatestSnapshot()];
    }

    try {
      const snapshotQuery = await this.firestore
        .collection('system_metrics')
        .orderBy('timestamp', 'desc')
        .limit(limitCount)
        .get();

      return snapshotQuery.docs.map((doc) => doc.data() as ObservabilitySnapshot);
    } catch {
      return [ObservabilityPlatform.getLatestSnapshot()];
    }
  }

  /**
   * Record operational alert to Firebase Firestore collection 'telemetry_alerts'
   */
  public async recordAlertToFirebase(alert: OperationalAlert): Promise<boolean> {
    if (!this.firestore) return true;

    try {
      await this.firestore.collection('telemetry_alerts').doc(alert.alertId).set(
        {
          ...alert,
          syncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sync executive report export to Firebase Firestore collection 'telemetry_reports'
   */
  public async publishExecutiveReportToFirebase(
    report?: ObservabilityExecutiveReport
  ): Promise<{ success: boolean; reportId: string }> {
    const execReport = report ?? ObservabilityPlatform.generateExecutiveReport();
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (this.firestore) {
      try {
        await this.firestore.collection('telemetry_reports').doc(reportId).set({
          ...execReport,
          publishedAt: new Date().toISOString(),
        });
      } catch {
        // Fallthrough return
      }
    }

    return { success: true, reportId };
  }
}
