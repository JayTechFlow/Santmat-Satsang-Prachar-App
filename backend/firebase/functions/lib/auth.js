"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleResolution = exports.sessionValidation = exports.validateToken = void 0;
const functions = require("firebase-functions");
const utils_1 = require("./utils");
exports.validateToken = functions.https.onCall(async (data, context) => {
    var _a;
    (0, utils_1.requireAuth)(context);
    utils_1.logger.info("Token validation requested", { uid: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid });
    return { status: "success", data: {} };
});
exports.sessionValidation = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
exports.roleResolution = functions.https.onCall(async (data, context) => {
    var _a, _b;
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: { role: ((_b = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin) ? "admin" : "user" } };
});
//# sourceMappingURL=auth.js.map