import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { requireAdmin, requireAuth, writeAuditLog, logger, db } from './utils';

const ALLOWED_STORAGE_PREFIXES = new Set([
  "images/",
  "audio/",
  "video/",
  "videos/",
  "books/",
  "documents/",
  "events/",
  "avatars/",
  "banners/",
  "temp/",
  "trash/",
  "processing/",
  "thumbnails/",
  "prayers/",
  "public/",
]);

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/x-m4a",
  "audio/flac",
  "audio/opus",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "application/pdf",
  "application/epub+zip",
  "application/x-mobipocket-ebook",
  "text/plain",
]);

/**
 * processUploadPipeline
 * Callable endpoint to execute the full end-to-end processing pipeline on a media asset:
 * Storage -> Firestore -> Queue -> Media Processing -> AI -> Search -> Ready
 * REQUIRES: client_super_admin or developer_super_admin role
 */
export const processUploadPipeline = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const callerOrgId = context.auth!.token.organizationId as string | undefined;

  const { mediaId, storagePath, title, mimeType, sizeBytes, category } = data as {
    mediaId?: string;
    storagePath: string;
    title?: string;
    mimeType: string;
    sizeBytes: number;
    category?: string;
  };

  if (!storagePath || !mimeType) {
    throw new functions.https.HttpsError('invalid-argument', 'storagePath and mimeType are required.');
  }

  // Validate storagePath against allowed prefixes
  const isAllowedPrefix = Array.from(ALLOWED_STORAGE_PREFIXES).some(prefix => storagePath.startsWith(prefix));
  if (!isAllowedPrefix) {
    throw new functions.https.HttpsError('permission-denied', `Storage path '${storagePath}' is not within allowed prefixes`);
  }

  // Validate mimeType
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new functions.https.HttpsError('invalid-argument', `MIME type '${mimeType}' is not allowed`);
  }

  // Validate sizeBytes
  if (sizeBytes <= 0 || sizeBytes > 2 * 1024 * 1024 * 1024) { // 2GB max
    throw new functions.https.HttpsError('invalid-argument', 'Invalid file size');
  }

  // Validate mediaId format if provided
  let id = mediaId;
  if (id) {
    if (id.length > 200 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid mediaId format');
    }
  } else {
    id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  // Verify object exists in Storage and get its metadata
  let storageMeta;
  try {
    const [fileMeta] = await admin.storage().bucket().file(storagePath).getMetadata();
    storageMeta = fileMeta;
  } catch (err: any) {
    if (err.code === 404) {
      throw new functions.https.HttpsError('not-found', `Storage object not found: ${storagePath}`);
    }
    throw new functions.https.HttpsError('internal', `Failed to verify storage object: ${err.message}`);
  }

  // Verify storage object metadata matches request
  if (storageMeta.contentType !== mimeType) {
    throw new functions.https.HttpsError('invalid-argument', `MIME type mismatch: storage has '${storageMeta.contentType}', request has '${mimeType}'`);
  }
  if (parseInt(storageMeta.size || "0", 10) !== sizeBytes) {
    throw new functions.https.HttpsError('invalid-argument', `Size mismatch: storage has ${storageMeta.size}, request has ${sizeBytes}`);
  }

  const userEmail = context.auth?.token.email ?? 'unknown@santmat.org';
  const userId = context.auth!.uid;

  try {
    // 1. Initial Firestore Registration (Status: queued)
    await db.collection('media').doc(id).set(
      {
        mediaId: id,
        storagePath,
        title: title ?? storagePath.split('/').pop(),
        mimeType,
        sizeBytes: sizeBytes ?? 0,
        category: category ?? 'general',
        status: 'queued',
        progressPercentage: 15,
        uploadedBy: userId,
        uploadedByEmail: userEmail,
        organizationId: callerOrgId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await writeAuditLog('UPLOAD_PIPELINE_INITIATED', userId, {
      mediaId: id,
      storagePath,
      mimeType,
    });

    // 2. Processing Stage - NO automatic approval
    await db.collection('media').doc(id).update({
      status: 'processing',
      progressPercentage: 45,
      currentStage: 'media_processing',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 3. AI Analysis & Search Indexing - moderation is NOT auto-approved
    // In production, this would call actual AI moderation
    // For now, we set moderation to pending - actual moderation happens separately
    const aiData = {
      analyzedAt: new Date().toISOString(),
      moderation: { isSafe: null, flaggedCategories: [], confidenceScore: 0.0, status: 'pending' },
      tags: [],
    };

    await db.collection('media').doc(id).update({
      status: 'moderation_pending',
      progressPercentage: 75,
      currentStage: 'ai_moderation',
      aiResults: aiData,
      vectorIndexed: false,
      processedAt: new Date().toISOString(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await writeAuditLog('UPLOAD_PIPELINE_MODERATION_PENDING', userId, {
      mediaId: id,
      status: 'moderation_pending',
    });

    return {
      status: 'success',
      data: {
        mediaId: id,
        storagePath,
        pipelineStatus: 'moderation_pending',
        progressPercentage: 75,
        aiResults: aiData,
        vectorIndexed: false,
        message: 'Upload registered. Awaiting content moderation approval.',
      },
    };
  } catch (err: any) {
    logger.error(`Upload pipeline execution failed for mediaId ${id}`, err);

    // Rollback status update
    await db.collection('media').doc(id).set(
      {
        status: 'failed',
        progressPercentage: 100,
        error: err?.message ?? 'Pipeline execution failed',
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await writeAuditLog('UPLOAD_PIPELINE_FAILED', userId, {
      mediaId: id,
      error: err?.message,
    });

    throw new functions.https.HttpsError('internal', err?.message ?? 'Pipeline execution failed');
  }
});

/**
 * getUploadPipelineProgress
 * Query live progress updates and audit trail for an uploaded media asset.
 * Users can only access media from their own organization unless they are developer_super_admin.
 */
export const getUploadPipelineProgress = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const callerRole = context.auth!.token.role as string;
  const callerOrgId = context.auth!.token.organizationId as string | undefined;

  const { mediaId } = data as { mediaId: string };
  if (!mediaId) {
    throw new functions.https.HttpsError('invalid-argument', 'mediaId is required');
  }

  const snap = await db.collection('media').doc(mediaId).get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', `Media document not found: ${mediaId}`);
  }

  const mediaData = snap.data()!;
  
  // Tenant isolation: verify organization ownership
  if (mediaData.organizationId && callerOrgId && mediaData.organizationId !== callerOrgId) {
    if (callerRole !== "developer_super_admin") {
      throw new functions.https.HttpsError('permission-denied', 'Cross-tenant access not authorized');
    }
  }

  const auditSnap = await db
    .collection('audit_logs')
    .where('details.mediaId', '==', mediaId)
    .orderBy('timestamp', 'desc')
    .limit(20)
    .get();

  const auditLogs = auditSnap.docs.map((doc) => doc.data());

  return {
    status: 'success',
    data: {
      mediaId,
      pipelineStatus: mediaData?.status ?? 'unknown',
      progressPercentage: mediaData?.progressPercentage ?? 0,
      currentStage: mediaData?.currentStage ?? 'unknown',
      error: mediaData?.error ?? null,
      aiResults: mediaData?.aiResults ?? null,
      vectorIndexed: mediaData?.vectorIndexed ?? false,
      auditLogs,
    },
  };
});

/**
 * replayDeadLetterJob
 * Admin callable endpoint to replay a failed upload job in dead-letter status.
 * Retrieves original file from Storage for replay - NO dummy content.
 */
export const replayDeadLetterJob = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const callerUid = context.auth!.uid;
  const callerRole = context.auth!.token.role as string;
  const callerOrgId = context.auth!.token.organizationId as string | undefined;

  const { mediaId } = data as { mediaId: string };
  if (!mediaId) {
    throw new functions.https.HttpsError('invalid-argument', 'mediaId is required');
  }

  const docRef = db.collection('media').doc(mediaId);
  const snap = await docRef.get();
  if (!snap.exists) {
    throw new functions.https.HttpsError('not-found', `Media document not found: ${mediaId}`);
  }

  const mediaData = snap.data()!;

  // Tenant isolation: verify organization ownership
  if (mediaData.organizationId && callerOrgId && mediaData.organizationId !== callerOrgId) {
    if (callerRole !== "developer_super_admin") {
      throw new functions.https.HttpsError('permission-denied', 'Cross-tenant replay not authorized');
    }
  }

  // Verify the media is in a failed/dead_letter state
  const status = mediaData.status;
  if (status !== 'failed' && status !== 'dead_letter') {
    throw new functions.https.HttpsError('failed-precondition', `Cannot replay media with status: ${status}`);
  }

  // Verify original storage object exists
  const storagePath = mediaData.storagePath;
  if (!storagePath) {
    throw new functions.https.HttpsError('failed-precondition', 'Original storage path not found in media record');
  }

  try {
    await admin.storage().bucket().file(storagePath).getMetadata();
  } catch (err: any) {
    if (err.code === 404) {
      throw new functions.https.HttpsError('not-found', `Original storage object not found: ${storagePath}`);
    }
    throw new functions.https.HttpsError('internal', `Failed to verify original storage object: ${err.message}`);
  }

  await docRef.update({
    status: 'queued',
    progressPercentage: 10,
    currentStage: 'replay',
    error: null,
    retryCount: (mediaData.retryCount || 0) + 1,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await writeAuditLog('DEAD_LETTER_REPLAY_INITIATED', callerUid, {
    mediaId,
    storagePath,
    originalStatus: status,
  });

  return {
    status: 'success',
    message: `Job ${mediaId} requeued for pipeline execution using original content from ${storagePath}`,
  };
});
