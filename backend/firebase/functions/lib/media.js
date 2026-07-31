"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUploadUrl = exports.generateSignedUrl = void 0;
const functions = require("firebase-functions");
const utils_1 = require("./utils");
exports.generateSignedUrl = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
exports.generateUploadUrl = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
//# sourceMappingURL=media.js.map