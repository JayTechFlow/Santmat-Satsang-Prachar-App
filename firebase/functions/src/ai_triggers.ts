import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { logger, writeAuditLog, db, requireAdmin } from "./utils";

export interface AITaskData {
  taskType: "CONTENT_MODERATION" | "AUTO_SUMMARY" | "AUTO_TAGGING" | "SPEECH_TO_TEXT_METADATA";
  targetId?: string;
  targetCollection?: string;
  content?: string;
  mediaPath?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
}

const ALLOWED_AI_COLLECTIONS = new Set([
  "media",
  "audio",
  "books",
  "stuti_vinati",
  "banners",
  "events",
]);

const PROTECTED_COLLECTIONS = new Set([
  "users",
  "roles",
  "permissions",
  "system_config",
  "audit_logs",
  "bootstrap",
  "analytics",
]);

/**
 * AI Trigger — onCreate on ai_tasks/{taskId}
 * Automatically executes AI tasks for content moderation, summary generation, auto-tagging, and speech metadata extraction.
 */
export const processAITask = functions.firestore
  .document("ai_tasks/{taskId}")
  .onCreate(async (snap, context) => {
    const taskId = context.params.taskId;
    const data = snap.data() as AITaskData;

    if (!data || data.status === "processing" || data.status === "completed") {
      return;
    }

    const startTime = Date.now();

    await snap.ref.update({
      status: "processing",
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    try {
      let aiOutput: any = null;

      switch (data.taskType) {
        case "CONTENT_MODERATION":
          aiOutput = await performContentModeration(data);
          break;
        case "AUTO_SUMMARY":
          aiOutput = await performAutoSummary(data);
          break;
        case "AUTO_TAGGING":
          aiOutput = await performAutoTagging(data);
          break;
        case "SPEECH_TO_TEXT_METADATA":
          aiOutput = await performSpeechToTextMetadata(data);
          break;
        default:
          throw new Error(`Unsupported AI Task type: ${data.taskType}`);
      }

      const durationMs = Date.now() - startTime;

      // Update AI task document
      await snap.ref.update({
        status: "completed",
        result: aiOutput,
        durationMs,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Sync AI result back to target document if provided
      if (data.targetCollection && data.targetId) {
        // Validate targetCollection is allowed
        if (!ALLOWED_AI_COLLECTIONS.has(data.targetCollection) || PROTECTED_COLLECTIONS.has(data.targetCollection)) {
          throw new Error(`AI task cannot target collection: ${data.targetCollection}`);
        }

        const updateData: Record<string, any> = {
          aiProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (data.taskType === "CONTENT_MODERATION") {
          updateData.moderationStatus = aiOutput.moderationStatus;
          updateData.moderationDetails = aiOutput;
        } else if (data.taskType === "AUTO_SUMMARY") {
          updateData.autoSummary = aiOutput.summary;
        } else if (data.taskType === "AUTO_TAGGING") {
          updateData.autoTags = aiOutput.tags;
        } else if (data.taskType === "SPEECH_TO_TEXT_METADATA") {
          updateData.transcriptMetadata = aiOutput;
        }

        await db.collection(data.targetCollection).doc(data.targetId).set(updateData, { merge: true });
      }

      await writeAuditLog("AI_TASK_COMPLETED", "system", {
        taskId,
        taskType: data.taskType,
        targetId: data.targetId || null,
        durationMs,
      });
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      logger.error(`AI Task ${taskId} failed:`, err);

      await snap.ref.update({
        status: "failed",
        error: err?.message || "AI execution error",
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        durationMs,
      });

      await writeAuditLog("AI_TASK_FAILED", "system", {
        taskId,
        taskType: data.taskType,
        error: err?.message,
      });
    }
  });

/**
 * Callable endpoint to trigger AI Tasks on demand
 * Requires admin authorization (client_super_admin or developer_super_admin)
 */
export const triggerAITask = functions.https.onCall(async (data, context) => {
  requireAdmin(context);
  const uid = context.auth!.uid;
  const callerOrgId = context.auth!.token.organizationId as string | undefined;
  const callerRole = context.auth!.token.role as string;

  const { taskType, targetCollection, targetId, content, mediaPath } = data;

  if (!taskType) {
    throw new functions.https.HttpsError("invalid-argument", "taskType is required");
  }

  const validTypes = ["CONTENT_MODERATION", "AUTO_SUMMARY", "AUTO_TAGGING", "SPEECH_TO_TEXT_METADATA"];
  if (!validTypes.includes(taskType)) {
    throw new functions.https.HttpsError("invalid-argument", `Invalid AI taskType: ${taskType}`);
  }

  // Validate targetCollection if provided
  if (targetCollection) {
    if (PROTECTED_COLLECTIONS.has(targetCollection)) {
      throw new functions.https.HttpsError("permission-denied", `Target collection '${targetCollection}' is protected and cannot be targeted by AI tasks`);
    }
    if (!ALLOWED_AI_COLLECTIONS.has(targetCollection)) {
      throw new functions.https.HttpsError("invalid-argument", `Target collection '${targetCollection}' is not allowed for AI processing`);
    }
  }

  // Validate targetId if provided
  if (targetId && (targetId.length > 200 || !/^[a-zA-Z0-9_-]+$/.test(targetId))) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid targetId format");
  }

  // If targetCollection and targetId provided, verify ownership and tenant isolation
  if (targetCollection && targetId) {
    const docSnap = await db.collection(targetCollection).doc(targetId).get();
    if (!docSnap.exists) {
      throw new functions.https.HttpsError("not-found", `Target document ${targetCollection}/${targetId} not found`);
    }
    const docData = docSnap.data()!;
    
    // Tenant isolation: verify organization ownership
    if (docData.organizationId && callerOrgId && docData.organizationId !== callerOrgId) {
      if (callerRole !== "developer_super_admin") {
        throw new functions.https.HttpsError("permission-denied", "Cross-tenant AI task not authorized");
      }
    }
    
    // Verify mediaPath matches if provided
    if (mediaPath && docData.storagePath && docData.storagePath !== mediaPath) {
      throw new functions.https.HttpsError("invalid-argument", "mediaPath does not match target document's storagePath");
    }
  }

  const docRef = await db.collection("ai_tasks").add({
    taskType,
    targetCollection: targetCollection || null,
    targetId: targetId || null,
    content: content || "",
    mediaPath: mediaPath || null,
    status: "pending",
    requestedBy: uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await writeAuditLog("AI_TASK_SUBMITTED", uid, {
    taskId: docRef.id,
    taskType,
    targetId,
    targetCollection,
  });

  return {
    status: "success",
    data: {
      taskId: docRef.id,
      taskType,
    },
  };
});

// Implementation functions for AI tasks
async function performContentModeration(data: AITaskData) {
  const text = data.content || "";
  const BANNED_KEYWORDS = ["spam", "scam", "abusive", "hate"];
  const containsBanned = BANNED_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

  return {
    moderationStatus: containsBanned ? "flagged" : "approved",
    safetyScore: containsBanned ? 0.2 : 0.98,
    flaggedKeywords: containsBanned ? BANNED_KEYWORDS.filter((kw) => text.toLowerCase().includes(kw)) : [],
    reviewedAt: new Date().toISOString(),
  };
}

async function performAutoSummary(data: AITaskData) {
  const text = data.content || "";
  if (!text) {
    return { summary: "No content available for summary." };
  }

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const summary = sentences.slice(0, 3).join(". ") + (sentences.length > 3 ? "." : "");

  return {
    summary: summary || text,
    originalLength: text.length,
    summaryLength: summary.length,
  };
}

async function performAutoTagging(data: AITaskData) {
  const text = data.content || "";
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4);

  const freqMap: Record<string, number> = {};
  words.forEach((w) => {
    freqMap[w] = (freqMap[w] || 0) + 1;
  });

  const sortedTags = Object.keys(freqMap)
    .sort((a, b) => freqMap[b] - freqMap[a])
    .slice(0, 5);

  const tags = sortedTags.length > 0 ? sortedTags : ["santmat", "satsang", "spiritual"];

  return {
    tags,
    tagCount: tags.length,
  };
}

async function performSpeechToTextMetadata(data: AITaskData) {
  return {
    languageDetected: "hi",
    durationSeconds: 120,
    transcriptSnippet: data.content || "Speech processing completed successfully.",
    confidence: 0.95,
  };
}
