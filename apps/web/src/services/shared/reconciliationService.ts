import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { ServiceResponse } from '../../types/common/index';
import { storageService, StorageFileItem } from '../storage/storageService';

export interface StorageFile {
  path: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  updatedAt: string;
  md5Hash?: string;
  downloadUrl?: string;
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
    type: 'MISSING_PROFILE' | 'ORPHAN_PROFILE' | 'ROLE_DRIFT' | 'SUSPENDED_USER';
    details: {
      authRole?: string;
      firestoreRole?: string;
      authStatus?: string;
      firestoreStatus?: string;
      message?: string;
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

/**
 * Extracts normalized storage path from a URL or raw storage path.
 * e.g. "https://firebasestorage.googleapis.com/v0/b/.../o/audio%2Fbhajans%2Fsong.mp3?alt=media" -> "audio/bhajans/song.mp3"
 */
export function getStoragePath(urlOrPath: string | undefined | null): string | null {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;
  const trimmed = urlOrPath.trim();
  if (!trimmed) return null;

  if (trimmed.includes('firebasestorage.googleapis.com')) {
    try {
      const parts = trimmed.split('/o/');
      if (parts.length > 1) {
        const pathPart = parts[1].split('?')[0];
        return decodeURIComponent(pathPart);
      }
    } catch (_) {
      // Ignored
    }
  }

  // If already a relative storage path (e.g. audio/bhajans/song.mp3)
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.replace(/^\/+/, '');
  }

  return null;
}

/**
 * Maps technical Firebase errors to actionable Hindi user-facing messages.
 */
export function mapFirebaseErrorToUserMessage(err: any): string {
  if (!err) return 'रीकॉन्सिलिएशन डेटा लोड करने में विफल।';

  const errStr = typeof err === 'string' ? err : '';
  const code = (err.code || '').toLowerCase();
  const message = (err.message || errStr || '').toLowerCase();

  if (code.includes('permission-denied') || message.includes('permission-denied') || code.includes('unauthorized')) {
    return 'स्टोरेज एवं फायरस्टोर देखने की प्रशासनिक अनुमति उपलब्ध नहीं है।';
  }
  if (code.includes('unauthenticated') || message.includes('unauthenticated')) {
    return 'सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।';
  }
  if (
    code.includes('unavailable') ||
    message.includes('unavailable') ||
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('cors')
  ) {
    return 'नेटवर्क या CORS त्रुटि: सर्वर से संपर्क नहीं हो सका।';
  }
  if (code.includes('not-found') || message.includes('not-found')) {
    return 'अनुरोधित संसाधन नहीं मिला।';
  }
  if (code.includes('internal') || message.includes('internal')) {
    return 'सर्वर आंतरिक त्रुटि उत्पन्न हुई। कृपया पुनः प्रयास करें।';
  }

  return err.message || errStr || 'रीकॉन्सिलिएशन डेटा लोड करने में विफल।';
}

export class ReconciliationService {
  /**
   * Run full cross-system reconciliation.
   * Leverages client-authoritative Firestore and Firebase Storage APIs
   * to guarantee immediate, authentic data without dependency on un-deployed Cloud Functions.
   */
  async runReconciliation(): Promise<ServiceResponse<ReconciliationData>> {
    try {
      // 1. GATHER REAL STORAGE FILES
      const storageRes = await storageService.listAllFiles();
      const storageFilesList: StorageFile[] = (storageRes.success && storageRes.data)
        ? storageRes.data.map((item: StorageFileItem) => ({
            path: item.storagePath,
            name: item.name,
            contentType: item.contentType,
            sizeBytes: item.size,
            updatedAt: item.updatedAt || new Date().toISOString(),
            md5Hash: item.md5Hash,
            downloadUrl: item.downloadUrl,
          }))
        : [];

      // Create lookup set for quick path verification
      const knownStoragePaths = new Set<string>();
      for (const f of storageFilesList) {
        knownStoragePaths.add(f.path);
        knownStoragePaths.add(f.path.replace(/^\/+/, ''));
      }

      // 2. QUERY FIRESTORE COLLECTIONS
      const contentCollections = ['audio', 'books', 'stuti_vinati', 'banners'];
      const contentRecords: Array<{ collection: string; id: string; data: any }> = [];
      const mediaPathReferences: Record<string, ContentReference[]> = {};

      const addReference = (rawPathOrUrl: string | null | undefined, col: string, id: string, title: string) => {
        if (!rawPathOrUrl) return;
        const normalizedPath = getStoragePath(rawPathOrUrl);
        if (!normalizedPath) return;

        if (!mediaPathReferences[normalizedPath]) {
          mediaPathReferences[normalizedPath] = [];
        }
        if (!mediaPathReferences[normalizedPath].some(r => r.col === col && r.id === id)) {
          mediaPathReferences[normalizedPath].push({ col, id, title });
        }
      };

      for (const colName of contentCollections) {
        try {
          const snap = await getDocs(collection(db, colName));
          snap.forEach(doc => {
            const data = doc.data();
            contentRecords.push({ collection: colName, id: doc.id, data });
            const title = data.title || data.name || `अनाम (${doc.id})`;

            if (colName === 'audio') {
              addReference(data.storagePath, colName, doc.id, title);
              addReference(data.audioUrl, colName, doc.id, title);
              addReference(data.imageUrl, colName, doc.id, title);
            } else if (colName === 'books') {
              addReference(data.storagePath, colName, doc.id, title);
              addReference(data.pdfUrl, colName, doc.id, title);
              addReference(data.coverUrl, colName, doc.id, title);
            } else if (colName === 'stuti_vinati') {
              addReference(data.storagePath, colName, doc.id, title);
              addReference(data.audioUrl, colName, doc.id, title);
            } else if (colName === 'banners') {
              addReference(data.imageUrl, colName, doc.id, title);
            }
          });
        } catch (colErr) {
          console.warn(`Reconciliation: warning reading ${colName}:`, colErr);
        }
      }

      // 3. AUDIT USER SECURITY & PROFILES
      const usersAudit: ReconciliationData['users'] = [];
      let totalUsersScanned = 0;

      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        totalUsersScanned = usersSnap.docs.length;

        usersSnap.forEach(doc => {
          const u = doc.data();
          const uid = doc.id;
          const email = u.email || 'अज्ञात ईमेल';
          const displayName = u.displayName || u.name || 'उपयोगकर्ता';
          const role = u.role;
          const status = u.status || u.accountStatus || 'active';

          const validRoles = ['developer_super_admin', 'client_super_admin', 'mobile_user'];
          if (!role || !validRoles.includes(role)) {
            usersAudit.push({
              uid,
              email,
              displayName,
              type: 'ROLE_DRIFT',
              details: {
                firestoreRole: role || 'अनुपलब्ध',
                firestoreStatus: status,
                message: `अमान्य या अनुपलब्ध भूमिका: ${role || 'कोई भूमिका नहीं'}`,
              },
            });
          } else if (status === 'suspended') {
            usersAudit.push({
              uid,
              email,
              displayName,
              type: 'SUSPENDED_USER',
              details: {
                firestoreRole: role,
                firestoreStatus: status,
                message: 'खाता निलंबित (Suspended) है।',
              },
            });
          }
        });
      } catch (userErr) {
        console.warn('Reconciliation: warning reading users collection:', userErr);
      }

      // 4. AUDIT CONTENT INTEGRITY & BROKEN REFERENCES
      const contentIssues: ReconciliationData['content'] = [];
      const pathToDocsMap = new Map<string, Array<{ col: string; id: string; title: string }>>();

      for (const rec of contentRecords) {
        const d = rec.data;
        const title = d.title || d.name || d.quote || rec.id;
        const reasons: string[] = [];

        // Check required fields
        if (rec.collection === 'audio') {
          if (!d.title || typeof d.title !== 'string' || !d.title.trim()) {
            reasons.push('शीर्षक अनुपलब्ध (Missing Title)');
          }
          if (!d.category) {
            reasons.push('श्रेणी अनुपलब्ध (Missing Category)');
          }
          if (!d.duration && !d.durationSeconds) {
            reasons.push('अवधि अनुपलब्ध (Missing Duration)');
          }
          if (!d.audioUrl && !d.storagePath) {
            reasons.push('ऑडियो फ़ाइल अनुपलब्ध (Missing Audio URL/Path)');
          }
        } else if (rec.collection === 'books') {
          if (!d.title) {
            reasons.push('शीर्षक अनुपलब्ध (Missing Title)');
          }
          if (!d.pdfUrl && !d.storagePath) {
            reasons.push('PDF संचिका अनुपलब्ध (Missing PDF File)');
          }
        } else if (rec.collection === 'stuti_vinati') {
          if (!d.title) {
            reasons.push('शीर्षक अनुपलब्ध (Missing Title)');
          }
          if (!d.audioUrl && !d.storagePath) {
            reasons.push('ऑडियो फ़ाइल अनुपलब्ध (Missing Audio File)');
          }
        }

        if (reasons.length > 0) {
          contentIssues.push({
            collection: rec.collection,
            id: rec.id,
            title,
            type: 'BROKEN_CONTENT',
            details: { reasons, status: d.status },
          });
        }

        // Validate storage existence
        const verifyStorageRef = (raw: string | undefined) => {
          if (!raw) return;
          const p = getStoragePath(raw);
          if (p) {
            if (knownStoragePaths.size > 0 && !knownStoragePaths.has(p)) {
              contentIssues.push({
                collection: rec.collection,
                id: rec.id,
                title,
                type: 'MISSING_MEDIA',
                details: {
                  brokenPath: p,
                  reasons: ['स्टोरेज संचिका भौतिक रूप से उपलब्ध नहीं है।'],
                  status: d.status,
                },
              });
            } else {
              // Group for duplicate detection
              if (!pathToDocsMap.has(p)) {
                pathToDocsMap.set(p, []);
              }
              pathToDocsMap.get(p)!.push({ col: rec.collection, id: rec.id, title });
            }
          }
        };

        if (rec.collection === 'audio') {
          verifyStorageRef(d.storagePath || d.audioUrl);
        } else if (rec.collection === 'books') {
          verifyStorageRef(d.storagePath || d.pdfUrl);
        } else if (rec.collection === 'stuti_vinati') {
          verifyStorageRef(d.storagePath || d.audioUrl);
        }
      }

      // Check for duplicate content linking
      for (const [p, docs] of pathToDocsMap.entries()) {
        if (docs.length > 1) {
          for (const docInfo of docs) {
            contentIssues.push({
              collection: docInfo.col,
              id: docInfo.id,
              title: docInfo.title,
              type: 'DUPLICATE_CONTENT',
              details: {
                sharedPath: p,
                matchingDocuments: docs.filter(item => item.id !== docInfo.id),
                reasons: [`यह संचिका ${docs.length} विभिन्न रिकॉर्ड्स से लिंक है।`],
              },
            });
          }
        }
      }

      // 5. AUDIT UNMAPPED / ORPHAN MEDIA
      const mediaIssues: ReconciliationData['media'] = [];
      for (const file of storageFilesList) {
        const refs = mediaPathReferences[file.path] || [];
        if (refs.length === 0) {
          mediaIssues.push({
            path: file.path,
            name: file.name,
            contentType: file.contentType,
            sizeBytes: file.sizeBytes,
            updatedAt: file.updatedAt,
            type: 'ORPHAN_MEDIA',
            details: {
              message: 'यह संचिका किसी भी फायरस्टोर दस्तावेज़ से लिंक नहीं है।',
            },
          });
        }
      }

      const reconciliationData: ReconciliationData = {
        users: usersAudit,
        media: mediaIssues,
        content: contentIssues,
        storageFiles: storageFilesList,
        mediaPathReferences,
        metrics: {
          totalUsersScanned,
          totalStorageObjectsScanned: storageFilesList.length,
          totalContentRecordsScanned: contentRecords.length,
        },
      };

      return { success: true, data: reconciliationData };
    } catch (err: any) {
      console.error('Reconciliation Service Error:', err);
      return {
        success: false,
        error: mapFirebaseErrorToUserMessage(err),
      };
    }
  }
}

export const reconciliationService = new ReconciliationService();
export default reconciliationService;
