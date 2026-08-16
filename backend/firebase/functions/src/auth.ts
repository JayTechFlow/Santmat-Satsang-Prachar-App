import * as functions from "firebase-functions";
import { requireAuth, logger } from "./utils";

export const validateToken = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    logger.info("Token validation requested", { uid: context.auth?.uid });
    return { status: "success", data: {} };
});

export const sessionValidation = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    return { status: "success", data: {} };
});

export const roleResolution = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const token = context.auth?.token;
    const role = token?.role || 'mobile_user';
    return { status: "success", data: { role } };
});
