import * as admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp();
}

import * as authFuncs from "./auth";
import * as profileFuncs from "./profile";
import * as eventsFuncs from "./events";
import * as notificationsFuncs from "./notifications";
import * as donationsFuncs from "./donations";
import * as searchFuncs from "./search";
import * as mediaFuncs from "./media";
import * as adminFunctions from "./admin_funcs";
import * as iamFuncs from "./iam";
import * as storageTriggersFuncs from "./storage_triggers";
import * as firestoreTriggersFuncs from "./firestore_triggers";
import * as queueTriggersFuncs from "./queue_triggers";
import * as aiTriggersFuncs from "./ai_triggers";
import * as uploadPipelineFuncs from "./upload_pipeline";
import * as observabilityFuncs from "./observability";
import * as analyticsFuncs from "./analytics";
import * as userProvFuncs from "./user_provisioning";
import * as authTriggersFuncs from "./auth_triggers";
import * as reconciliationFuncs from "./reconciliation";

export const auth = authFuncs;
export const profile = profileFuncs;
export const events = eventsFuncs;
export const notifications = notificationsFuncs;
export const donations = donationsFuncs;
export const search = searchFuncs;
export const media = mediaFuncs;
export const adminApi = adminFunctions;
export const iam = iamFuncs;
export const uploadPipeline = uploadPipelineFuncs;
export const reconciliation = reconciliationFuncs;

// Agent G — Cloud Functions & Triggers
export const storageTriggers = storageTriggersFuncs;
export const firestoreTriggers = firestoreTriggersFuncs;
export const queueTriggers = queueTriggersFuncs;
export const aiTriggers = aiTriggersFuncs;
export const authTriggers = authTriggersFuncs;

// Agent I — Observability & Monitoring Platform
export const observability = observabilityFuncs;

// Platform Analytics (aggregation, summary report, telemetry logging)
export const analytics = analyticsFuncs;
export const userProv = userProvFuncs;



