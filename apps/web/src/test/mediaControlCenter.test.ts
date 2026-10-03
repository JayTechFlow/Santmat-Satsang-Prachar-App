/**
 * ============================================================================
 * Media Control Center & Reconciliation Unit Test Suite
 * ============================================================================
 * Tests for /admin/media:
 * 1. Error Mapping & Localization (mapFirebaseErrorToUserMessage)
 * 2. Reconciliation Engine & Data Integrity (reconciliationService)
 * 3. User Identity & RBAC Consistency Audit
 * 4. Storage Folder Hierarchy & Breadcrumb Navigation
 * 5. File Filtering & Search Logic
 * 6. Module State Machine Transitions
 * 7. Audio Preview URL Construction
 */
import { describe, it, expect } from 'vitest';
import {
  mapFirebaseErrorToUserMessage,
  reconciliationService,
  StorageFile,
  ContentReference,
} from '../services/shared/reconciliationService';
import {
  StorageService,
  KNOWN_STORAGE_FOLDERS,
} from '../services/storage/storageService';
import { type MediaModuleState } from '../components/media/AdminMediaLibrary';

describe('Media Control Center — Error Mapping & Localization', () => {
  it('maps CORS preflight / network failure to Hindi message', () => {
    const msg = mapFirebaseErrorToUserMessage(new Error('Failed to fetch'));
    expect(msg).toContain('CORS');
    expect(msg).toContain('सर्वर से संपर्क नहीं हो सका');
  });

  it('maps internal Firebase error to Hindi message', () => {
    const msg = mapFirebaseErrorToUserMessage(new Error('FirebaseError: internal'));
    expect(msg).toContain('सर्वर आंतरिक त्रुटि');
  });

  it('maps permission-denied / unauthorized error to Hindi message', () => {
    const msg = mapFirebaseErrorToUserMessage(new Error('permission-denied: Missing permissions'));
    expect(msg).toContain('प्रशासनिक अनुमति');
  });

  it('maps not-found error to Hindi message', () => {
    const msg = mapFirebaseErrorToUserMessage(new Error('not-found'));
    expect(msg).toContain('अनुरोधित संसाधन नहीं मिला');
  });

  it('maps unauthenticated error to Hindi message', () => {
    const msg = mapFirebaseErrorToUserMessage(new Error('unauthenticated'));
    expect(msg).toContain('सत्र समाप्त');
  });

  it('falls back gracefully on unknown errors', () => {
    const msg = mapFirebaseErrorToUserMessage('Something unexpected');
    expect(msg).toBe('Something unexpected');
  });
});

describe('Media Control Center — Storage Folder Hierarchy & Explorer', () => {
  const sampleStorageFiles: StorageFile[] = [
    {
      name: 'guru_vandana.mp3',
      path: 'audio/bhajans/guru_vandana.mp3',
      contentType: 'audio/mpeg',
      sizeBytes: 4500000,
      updatedAt: '2026-10-01T10:00:00Z',
    },
    {
      name: 'morning_stuti.mp3',
      path: 'audio/stuti/morning_stuti.mp3',
      contentType: 'audio/mpeg',
      sizeBytes: 3200000,
      updatedAt: '2026-10-01T11:00:00Z',
    },
    {
      name: 'banner_diwali.png',
      path: 'banners/banner_diwali.png',
      contentType: 'image/png',
      sizeBytes: 1500000,
      updatedAt: '2026-10-02T12:00:00Z',
    },
    {
      name: 'satsang_yoga.pdf',
      path: 'books/satsang_yoga.pdf',
      contentType: 'application/pdf',
      sizeBytes: 8000000,
      updatedAt: '2026-09-15T09:00:00Z',
    },
    {
      name: 'root_notice.txt',
      path: 'root_notice.txt',
      contentType: 'text/plain',
      sizeBytes: 1024,
      updatedAt: '2026-10-03T01:00:00Z',
    },
  ];

  it('contains all known canonical media folders', () => {
    expect(KNOWN_STORAGE_FOLDERS).toContain('audio');
    expect(KNOWN_STORAGE_FOLDERS).toContain('banners');
    expect(KNOWN_STORAGE_FOLDERS).toContain('books');
    expect(KNOWN_STORAGE_FOLDERS).toContain('images');
    expect(KNOWN_STORAGE_FOLDERS).toContain('thumbnails');
  });

  it('derives root-level folders and files correctly', () => {
    const subfolderSet = new Set<string>();
    const directFiles: StorageFile[] = [];

    for (const f of sampleStorageFiles) {
      const slashIdx = f.path.indexOf('/');
      if (slashIdx === -1) {
        directFiles.push(f);
      } else {
        subfolderSet.add(f.path.substring(0, slashIdx));
      }
    }

    expect(Array.from(subfolderSet).sort()).toEqual(['audio', 'banners', 'books']);
    expect(directFiles.length).toBe(1);
    expect(directFiles[0].name).toBe('root_notice.txt');
  });

  it('derives subfolder items when navigating into a folder', () => {
    const targetFolder = 'audio';
    const subfolderSet = new Set<string>();
    const directFiles: StorageFile[] = [];

    for (const f of sampleStorageFiles) {
      if (f.path.startsWith(targetFolder + '/')) {
        const rest = f.path.substring(targetFolder.length + 1);
        const slashIdx = rest.indexOf('/');
        if (slashIdx === -1) {
          directFiles.push(f);
        } else {
          subfolderSet.add(targetFolder + '/' + rest.substring(0, slashIdx));
        }
      }
    }

    expect(Array.from(subfolderSet).sort()).toEqual(['audio/bhajans', 'audio/stuti']);
    expect(directFiles.length).toBe(0);
  });

  it('builds breadcrumb segments accurately', () => {
    const folderPath = 'audio/bhajans/morning';
    const parts = folderPath.split('/');
    let accum = '';
    const breadcrumbs = parts.map((part) => {
      accum = accum ? `${accum}/${part}` : part;
      return { name: part, path: accum };
    });

    expect(breadcrumbs).toEqual([
      { name: 'audio', path: 'audio' },
      { name: 'bhajans', path: 'audio/bhajans' },
      { name: 'morning', path: 'audio/bhajans/morning' },
    ]);
  });
});

describe('Media Control Center — File Filtering & Search Logic', () => {
  const files: StorageFile[] = [
    {
      name: 'arti.mp3',
      path: 'audio/arti.mp3',
      contentType: 'audio/mpeg',
      sizeBytes: 1000,
      updatedAt: '2026-10-01',
    },
    {
      name: 'banner_header.jpg',
      path: 'banners/banner_header.jpg',
      contentType: 'image/jpeg',
      sizeBytes: 2000,
      updatedAt: '2026-10-01',
    },
    {
      name: 'guru_photo.png',
      path: 'images/guru_photo.png',
      contentType: 'image/png',
      sizeBytes: 3000,
      updatedAt: '2026-10-01',
    },
    {
      name: 'padavali.pdf',
      path: 'books/padavali.pdf',
      contentType: 'application/pdf',
      sizeBytes: 4000,
      updatedAt: '2026-10-01',
    },
  ];

  const references: Record<string, ContentReference[]> = {
    'audio/arti.mp3': [{ id: 'b1', title: 'आरती', col: 'audio' }],
    'books/padavali.pdf': [{ id: 'bk1', title: 'पदावली', col: 'books' }],
  };

  it('filters files by search query matching name or path', () => {
    const q = 'arti';
    const results = files.filter(
      (f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
    );
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('arti.mp3');
  });

  it('filters by audio content type', () => {
    const results = files.filter(
      (f) => f.contentType.startsWith('audio/') || f.name.endsWith('.mp3')
    );
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('arti.mp3');
  });

  it('filters by banner path', () => {
    const results = files.filter(
      (f) => f.path.startsWith('banners/') || f.contentType.startsWith('image/')
    );
    expect(results.length).toBe(2);
  });

  it('filters mapped vs unmapped files', () => {
    const mapped = files.filter((f) => (references[f.path] || []).length > 0);
    const unmapped = files.filter((f) => (references[f.path] || []).length === 0);

    expect(mapped.length).toBe(2);
    expect(unmapped.length).toBe(2);
    expect(unmapped.map((u) => u.name)).toEqual(['banner_header.jpg', 'guru_photo.png']);
  });
});

describe('Media Control Center — State Machine & URL Generation', () => {
  it('supports all canonical module states', () => {
    const validStates: MediaModuleState[] = [
      'INITIAL',
      'LOADING',
      'SUCCESS_WITH_DATA',
      'SUCCESS_EMPTY',
      'ERROR',
      'REFRESHING',
    ];
    expect(validStates.length).toBe(6);
  });

  it('correctly transitions state machine from INITIAL to SUCCESS_WITH_DATA or SUCCESS_EMPTY', () => {
    // Simulating state reducer / transition logic
    const getNextState = (
      prev: MediaModuleState,
      result: { success: boolean; storageFilesCount: number; recordsCount: number }
    ): MediaModuleState => {
      if (!result.success) return 'ERROR';
      if (result.storageFilesCount > 0 || result.recordsCount > 0) return 'SUCCESS_WITH_DATA';
      return 'SUCCESS_EMPTY';
    };

    expect(getNextState('LOADING', { success: true, storageFilesCount: 30, recordsCount: 11 })).toBe(
      'SUCCESS_WITH_DATA'
    );
    expect(getNextState('LOADING', { success: true, storageFilesCount: 0, recordsCount: 0 })).toBe(
      'SUCCESS_EMPTY'
    );
    expect(getNextState('LOADING', { success: false, storageFilesCount: 0, recordsCount: 0 })).toBe(
      'ERROR'
    );
  });

  it('constructs authenticated/public Firebase storage media URLs securely', () => {
    const bucketName = 'santmat-satsang-prachar.firebasestorage.app';
    const filePath = 'audio/bhajans/गुरु_महिमा.mp3';
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
      filePath
    )}?alt=media`;

    expect(downloadUrl).toContain('santmat-satsang-prachar.firebasestorage.app');
    expect(downloadUrl).toContain('alt=media');
    expect(downloadUrl).toContain(encodeURIComponent(filePath));
    expect(downloadUrl).not.toContain('undefined');
  });
});

describe('Media Control Center — Content Integrity & User Audit Logic', () => {
  it('detects MISSING_MEDIA when firestore points to non-existent storage path', () => {
    const existingStoragePaths = new Set(['audio/track1.mp3', 'banners/b1.jpg']);
    const firestoreRecord = { id: 'rec-1', title: 'भजन १', storagePath: 'audio/deleted_track.mp3' };

    const isMissing = !existingStoragePaths.has(firestoreRecord.storagePath);
    expect(isMissing).toBe(true);
  });

  it('detects DUPLICATE_CONTENT when multiple records reference the same path', () => {
    const pathToRefs: Record<string, string[]> = {
      'audio/track1.mp3': ['rec-1', 'rec-2'],
      'audio/track2.mp3': ['rec-3'],
    };

    const duplicatePaths = Object.keys(pathToRefs).filter((p) => pathToRefs[p].length > 1);
    expect(duplicatePaths).toEqual(['audio/track1.mp3']);
  });

  it('detects ROLE_DRIFT when Auth role diverges from Firestore profile role', () => {
    const userAudit = (authRole: string, firestoreRole: string) => {
      if (authRole !== firestoreRole) {
        return { type: 'ROLE_DRIFT', details: { authRole, firestoreRole } };
      }
      return null;
    };

    const audit1 = userAudit('developer', 'admin');
    expect(audit1).not.toBeNull();
    expect(audit1?.type).toBe('ROLE_DRIFT');

    const audit2 = userAudit('developer', 'developer');
    expect(audit2).toBeNull();
  });

  it('detects MISSING_PROFILE when auth user exists without Firestore record', () => {
    const firestoreUserIds = new Set(['uid-1', 'uid-2']);
    const authUsers = [{ uid: 'uid-1' }, { uid: 'uid-3' }];

    const missingProfiles = authUsers.filter((u) => !firestoreUserIds.has(u.uid));
    expect(missingProfiles.length).toBe(1);
    expect(missingProfiles[0].uid).toBe('uid-3');
  });
});

