"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminApi = exports.media = exports.search = exports.donations = exports.notifications = exports.events = exports.profile = exports.auth = void 0;
const admin = require("firebase-admin");
if (!admin.apps.length) {
    admin.initializeApp();
}
const authFuncs = require("./auth");
const profileFuncs = require("./profile");
const eventsFuncs = require("./events");
const notificationsFuncs = require("./notifications");
const donationsFuncs = require("./donations");
const searchFuncs = require("./search");
const mediaFuncs = require("./media");
const adminFunctions = require("./admin_funcs");
exports.auth = authFuncs;
exports.profile = profileFuncs;
exports.events = eventsFuncs;
exports.notifications = notificationsFuncs;
exports.donations = donationsFuncs;
exports.search = searchFuncs;
exports.media = mediaFuncs;
exports.adminApi = adminFunctions;
//# sourceMappingURL=index.js.map