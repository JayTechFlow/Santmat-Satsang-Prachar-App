import * as functions from "firebase-functions";
import { requireAuth } from "./utils";

export const createPaymentIntent = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    return { status: "success", data: {} };
});

export const verifyPayment = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    return { status: "success", data: {} };
});
