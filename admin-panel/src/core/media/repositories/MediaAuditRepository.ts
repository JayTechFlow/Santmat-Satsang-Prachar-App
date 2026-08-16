// Enterprise Media Platform — Media Audit Repository (Firestore)
// Sprint M6.10 — Agent C: Firestore Media Metadata

import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../../../firebase/config';
import type { MediaAuditLog, MediaAuditAction } from '../types/media.types';
import { MEDIA_FIRESTORE_COLLECTIONS } from '../constants/media.constants';

export class MediaAuditRepository {
  private readonly collectionName = MEDIA_FIRESTORE_COLLECTIONS.MEDIA_AUDIT;

  /**
   * Log an audit action to media_audit collection in Firestore.
   */
  async logAudit(
    mediaId: string,
    action: MediaAuditAction,
    details?: Record<string, any>,
    performedBy?: string,
    performedByEmail?: string
  ): Promise<string> {
    try {
      const user = auth.currentUser;
      const docRef = doc(collection(db, this.collectionName));

      const auditLog = {
        mediaId,
        action,
        performedBy: performedBy || user?.uid || 'anonymous',
        performedByEmail: performedByEmail || user?.email || undefined,
        timestamp: serverTimestamp(),
        details: details || {},
      };

      await setDoc(docRef, auditLog);
      return docRef.id;
    } catch {
      // Non-blocking audit logging
      return '';
    }
  }

  /**
   * Fetch audit logs for a specific media item or overall.
   */
  async getAuditLogs(mediaId?: string, limitCount = 50): Promise<MediaAuditLog[]> {
    let q = query(collection(db, this.collectionName), orderBy('timestamp', 'desc'), limit(limitCount));
    if (mediaId) {
      q = query(
        collection(db, this.collectionName),
        where('mediaId', '==', mediaId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.parseDoc(d));
  }

  private parseDoc(snap: DocumentSnapshot): MediaAuditLog {
    const data = snap.data()!;
    return {
      id: snap.id,
      ...data,
      timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now()),
    } as MediaAuditLog;
  }
}

export const mediaAuditRepository = new MediaAuditRepository();
