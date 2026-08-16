import * as functions from "firebase-functions";
import { requireAuth, db } from "./utils";

export const getProfile = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const uid = context.auth?.uid;
    const doc = await db.collection("users").doc(uid!).get();
    if (!doc.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found.");
    }
    return { status: "success", data: doc.data() };
});
