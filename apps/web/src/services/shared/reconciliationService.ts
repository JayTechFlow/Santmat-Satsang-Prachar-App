import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase/config';
import { ServiceResponse } from '../../types/common/index';

export interface StorageFile {
  path: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  updatedAt: string;
  md5Hash?: string;
}

export interface ContentReference {
  col: string;
  id: string;
  title: string;
}

export interface ReconciliationData {
  users: Array<{
    uid: string;
    email: string;
    displayName: string;
    type: 'MISSING_PROFILE' | 'ORPHAN_PROFILE' | 'ROLE_DRIFT';
    details: {
      authRole?: string;
      firestoreRole?: string;
      authStatus?: string;
      firestoreStatus?: string;
    };
  }>;
  media: Array<{
    path: string;
    name: string;
    contentType?: string;
    sizeBytes?: number;
    updatedAt?: string;
    type: 'ORPHAN_MEDIA' | 'DUPLICATE_MEDIA';
    details: {
      message?: string;
      duplicateReason?: string;
      hash?: string;
      matchingPaths?: string[];
    };
  }>;
  content: Array<{
    collection: string;
    id: string;
    title: string;
    type: 'BROKEN_CONTENT' | 'MISSING_MEDIA' | 'DUPLICATE_CONTENT';
    details: {
      reasons?: string[];
      brokenPath?: string;
      sharedPath?: string;
      matchingDocuments?: Array<{ col: string; id: string; title: string }>;
      status?: string;
    };
  }>;
  storageFiles: StorageFile[];
  mediaPathReferences: Record<string, ContentReference[]>;
  metrics: {
    totalUsersScanned: number;
    totalStorageObjectsScanned: number;
    totalContentRecordsScanned: number;
  };
}

export class ReconciliationService {
  async runReconciliation(): Promise<ServiceResponse<ReconciliationData>> {
    try {
      const reconcileFn = httpsCallable(functions, 'reconciliation-reconcileSystem');
      const res = await reconcileFn();
      return { success: true, data: res.data as ReconciliationData };
    } catch (error: any) {
      console.error('Reconciliation Service Error:', error);
      return { success: false, error: error.message || 'System reconciliation failed.' };
    }
  }
}

export const reconciliationService = new ReconciliationService();
export default reconciliationService;
