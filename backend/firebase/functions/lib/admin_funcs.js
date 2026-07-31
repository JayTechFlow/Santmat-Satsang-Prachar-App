"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentModeration = exports.getDashboardStats = void 0;
const functions = require("firebase-functions");
const utils_1 = require("./utils");
exports.getDashboardStats = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAdmin)(context);
    return { status: "success", data: {} };
});
exports.contentModeration = functions.https.onCall(async (data, context) => {
    var _a;
    (0, utils_1.requireAdmin)(context);
    const { action, contentId, reason } = data;
    const uid = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const cleanReason = reason ? (0, utils_1.sanitizeInput)(reason) : "";
    // Actual moderation logic would go here
    await (0, utils_1.writeAuditLog)("contentModeration", uid, { action, contentId, reason: cleanReason });
    return { status: "success", data: {} };
});
//# sourceMappingURL=admin_funcs.js.map