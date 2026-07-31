import * as functions from "firebase-functions";
import { requireAuth } from "./utils";

export const generateSignedUrl = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    return { status: "success", data: {} };
});

export const generateUploadUrl = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    return { status: "success", data: {} };
});
