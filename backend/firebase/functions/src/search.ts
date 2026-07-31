import * as functions from "firebase-functions";
import { requireAuth } from "./utils";

export const globalSearch = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    return { status: "success", data: {} };
});

export const autocomplete = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    return { status: "success", data: {} };
});

export const trendingSearches = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    return { status: "success", data: {} };
});
