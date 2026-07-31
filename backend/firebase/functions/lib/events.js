"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendance = exports.cancel = exports.register = void 0;
const functions = require("firebase-functions");
const utils_1 = require("./utils");
exports.register = functions.https.onCall(async (data, context) => {
    var _a;
    (0, utils_1.requireAuth)(context);
    const uid = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { eventId } = data;
    if (!eventId)
        throw new functions.https.HttpsError("invalid-argument", "eventId is required.");
    // Add logic for registering
    utils_1.logger.info(`User ${uid} registering for event ${eventId}`);
    await (0, utils_1.writeAuditLog)("eventRegistration", uid, { eventId });
    return { status: "success", data: {} };
});
exports.cancel = functions.https.onCall(async (data, context) => {
    var _a;
    (0, utils_1.requireAuth)(context);
    const uid = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { eventId } = data;
    await (0, utils_1.writeAuditLog)("eventCancellation", uid, { eventId });
    return { status: "success", data: {} };
});
exports.attendance = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
//# sourceMappingURL=events.js.map