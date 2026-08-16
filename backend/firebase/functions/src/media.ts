// Enterprise Media Platform — Cloud Functions
// Sprint M1 Foundation

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { requireAdmin } from './utils';

const getStorage = () => {
  if (!admin.apps.length) admin.initializeApp();
  return admin.storage();
};

/**
 * generateSignedUrl — Generate a time-limited signed read URL for a private media asset.
 * Required Role: authenticated user (owns asset OR is admin).
 */
export const generateSignedUrl = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const { storagePath, expiresInSeconds = 3600 } = data as {
    storagePath: string;
    expiresInSeconds?: number;
  };

  if (!storagePath || typeof storagePath !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'storagePath is required');
  }

  if (expiresInSeconds < 60 || expiresInSeconds > 604800) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'expiresInSeconds must be between 60 and 604800 (7 days)'
    );
  }

  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(storagePath);

    const [exists] = await file.exists();
    if (!exists) {
      throw new functions.https.HttpsError('not-found', `File not found at path: ${storagePath}`);
    }

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresInSeconds * 1000,
    });

    return {
      status: 'success',
      data: {
        signedUrl,
        storagePath,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
      },
    };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error?.message ?? 'Failed to generate signed URL');
  }
});

/**
 * generateUploadUrl — Generate a signed upload URL for direct browser-to-storage uploads.
 * Required Role: admin.
 */
export const generateUploadUrl = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const { storagePath, contentType, expiresInSeconds = 900 } = data as {
    storagePath: string;
    contentType: string;
    expiresInSeconds?: number;
  };

  if (!storagePath || typeof storagePath !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'storagePath is required');
  }
  if (!contentType || typeof contentType !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'contentType is required');
  }

  // Security: restrict content types to allowed types only
  const ALLOWED_CONTENT_TYPES = [
    'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'video/mp4', 'video/webm', 'video/quicktime',
  ];

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Content type not allowed: ${contentType}`
    );
  }

  // Security: restrict storage paths to allowed folders
  const ALLOWED_FOLDERS = [
    'audio/', 'books/', 'banners/', 'images/', 'videos/',
    'avatars/', 'documents/', 'events/', 'exports/', 'temp/',
  ];
  const isAllowedPath = ALLOWED_FOLDERS.some(folder => storagePath.startsWith(folder));
  if (!isAllowedPath) {
    throw new functions.https.HttpsError(
      'permission-denied',
      `Storage path not allowed: ${storagePath}. Must be under an allowed folder.`
    );
  }

  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(storagePath);

    const [signedUrl] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + expiresInSeconds * 1000,
      contentType,
    });

    return {
      status: 'success',
      data: {
        signedUrl,
        storagePath,
        contentType,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
      },
    };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', error?.message ?? 'Failed to generate upload URL');
  }
});

/**
 * onMediaDeleted — Firestore trigger: clean up Storage when a media document is hard-deleted.
 */
export const onMediaDocumentDeleted = functions.firestore
  .document('media/{mediaId}')
  .onDelete(async (snap) => {
    const data = snap.data();
    if (!data) return;

    const storagePaths: string[] = [];
    if (data.storagePath) storagePaths.push(data.storagePath);
    if (data.thumbnailPath) storagePaths.push(data.thumbnailPath);

    const bucket = getStorage().bucket();
    await Promise.allSettled(
      storagePaths.map(async (path) => {
        try {
          await bucket.file(path).delete();
        } catch {
          // File may not exist — non-fatal
        }
      })
    );
  });

/**
 * onMediaCreated — Firestore trigger: write audit log when a media asset is created.
 */
export const onMediaDocumentCreated = functions.firestore
  .document('media/{mediaId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data) return;

    await admin.firestore().collection('media_audit').add({
      mediaId: snap.id,
      action: 'uploaded',
      performedBy: data.uploadedBy ?? 'system',
      performedByEmail: data.uploadedByEmail ?? null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        type: data.type ?? data.mimeType ?? 'unknown',
        category: data.category ?? null,
        folder: data.folder ?? null,
        sizeBytes: data.metadata?.sizeBytes ?? data.sizeBytes ?? 0,
      },
    });
  });
