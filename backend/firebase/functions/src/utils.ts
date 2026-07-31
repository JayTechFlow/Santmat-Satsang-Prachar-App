import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const logger = functions.logger;

export const requireAuth = (context: functions.https.CallableContext) => {
    if (!context.auth) {
        logger.warn("Unauthenticated function call attempt", { app: context.app?.appId });
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    
    // Enterprise Best Practice: Audit App Check before enforcement
    if (context.app == undefined) {
        logger.warn("Request missing App Check token", { uid: context.auth.uid });
    }
};

export const requireAdmin = (context: functions.https.CallableContext) => {
    requireAuth(context);
    if (context.auth?.token?.admin !== true) {
        logger.warn(`Unauthorized admin call attempt by ${context.auth?.uid}`);
        throw new functions.https.HttpsError("permission-denied", "Admin privileges required.");
    }
};

export const db = admin.firestore();

// Enterprise Security: Basic XSS Sanitizer for input strings
export const sanitizeInput = (input: string): string => {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// Enterprise Observability: Write to an Audit collection
export const writeAuditLog = async (action: string, uid: string, details: any) => {
    try {
        await db.collection("audit_logs").add({
            action,
            uid,
            details,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        logger.error("Failed to write audit log", { action, uid, error });
    }
};

// Enterprise Optimization: Safely chunk massive batched writes (Firestore limit is 500)
export const chunkedBatchCommit = async (
    items: any[],
    operation: (batch: admin.firestore.WriteBatch, item: any) => void
) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += 450) {
        chunks.push(items.slice(i, i + 450));
    }
    
    for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach(item => operation(batch, item));
        await batch.commit();
    }
};
