import * as functions from "firebase-functions";
import { requireAdmin, writeAuditLog, sanitizeInput } from "./utils";

export const getDashboardStats = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    return { status: "success", data: {} };
});

export const contentModeration = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    const { action, contentId, reason } = data;
    const uid = context.auth?.uid;
    const cleanReason = reason ? sanitizeInput(reason) : "";

    // Actual moderation logic would go here

    await writeAuditLog("contentModeration", uid!, { action, contentId, reason: cleanReason });
    return { status: "success", data: {} };
});
