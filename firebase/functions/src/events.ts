import * as functions from "firebase-functions";
import { requireAuth, logger, writeAuditLog } from "./utils";

export const register = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const uid = context.auth?.uid;
    const { eventId } = data;
    if (!eventId) throw new functions.https.HttpsError("invalid-argument", "eventId is required.");
    
    // Add logic for registering
    logger.info(`User ${uid} registering for event ${eventId}`);
    await writeAuditLog("eventRegistration", uid!, { eventId });
    return { status: "success", data: {} };
});

export const cancel = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const uid = context.auth?.uid;
    const { eventId } = data;
    await writeAuditLog("eventCancellation", uid!, { eventId });
    return { status: "success", data: {} };
});

export const attendance = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    return { status: "success", data: {} };
});
