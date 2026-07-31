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

export const auth = authFuncs;
export const profile = profileFuncs;
export const events = eventsFuncs;
export const notifications = notificationsFuncs;
export const donations = donationsFuncs;
export const search = searchFuncs;
export const media = mediaFuncs;
export const adminApi = adminFunctions;
