"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = void 0;
const functions = require("firebase-functions");
const utils_1 = require("./utils");
exports.getProfile = functions.https.onCall(async (data, context) => {
    var _a;
    (0, utils_1.requireAuth)(context);
    const uid = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const doc = await utils_1.db.collection("users").doc(uid).get();
    if (!doc.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found.");
    }
    return { status: "success", data: doc.data() };
});
//# sourceMappingURL=profile.js.map