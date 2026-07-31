"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = exports.subscribeTopic = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const utils_1 = require("./utils");
exports.subscribeTopic = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    const { token, topic } = data;
    if (!token || !topic)
        throw new functions.https.HttpsError("invalid-argument", "Token and topic required.");
    await admin.messaging().subscribeToTopic(token, topic);
    return { status: "success", data: {} };
});
exports.broadcast = functions.https.onCall(async (data, context) => {
    var _a;
    (0, utils_1.requireAdmin)(context);
    utils_1.logger.info("Notification broadcast triggered", { uid: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid });
    // broadcast logic
    return { status: "success", data: {} };
});
//# sourceMappingURL=notifications.js.map