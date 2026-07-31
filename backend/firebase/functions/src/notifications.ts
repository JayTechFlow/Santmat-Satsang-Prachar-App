import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { requireAuth, requireAdmin, logger } from "./utils";

export const subscribeTopic = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const { token, topic } = data;
    if (!token || !topic) throw new functions.https.HttpsError("invalid-argument", "Token and topic required.");
    await admin.messaging().subscribeToTopic(token, topic);
    return { status: "success", data: {} };
});

export const broadcast = functions.https.onCall(async (data, context) => {
    requireAdmin(context);
    logger.info("Notification broadcast triggered", { uid: context.auth?.uid });
    // broadcast logic
    return { status: "success", data: {} };
});
