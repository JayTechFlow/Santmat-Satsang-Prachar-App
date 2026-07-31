"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkedBatchCommit = exports.writeAuditLog = exports.sanitizeInput = exports.db = exports.requireAdmin = exports.requireAuth = exports.logger = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
exports.logger = functions.logger;
const requireAuth = (context) => {
    var _a;
    if (!context.auth) {
        exports.logger.warn("Unauthenticated function call attempt", { app: (_a = context.app) === null || _a === void 0 ? void 0 : _a.appId });
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }
    // Enterprise Best Practice: Audit App Check before enforcement
    if (context.app == undefined) {
        exports.logger.warn("Request missing App Check token", { uid: context.auth.uid });
    }
};
exports.requireAuth = requireAuth;
const requireAdmin = (context) => {
    var _a, _b, _c;
    (0, exports.requireAuth)(context);
    if (((_b = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin) !== true) {
        exports.logger.warn(`Unauthorized admin call attempt by ${(_c = context.auth) === null || _c === void 0 ? void 0 : _c.uid}`);
        throw new functions.https.HttpsError("permission-denied", "Admin privileges required.");
    }
};
exports.requireAdmin = requireAdmin;
exports.db = admin.firestore();
// Enterprise Security: Basic XSS Sanitizer for input strings
const sanitizeInput = (input) => {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
exports.sanitizeInput = sanitizeInput;
// Enterprise Observability: Write to an Audit collection
const writeAuditLog = async (action, uid, details) => {
    try {
        await exports.db.collection("audit_logs").add({
            action,
            uid,
            details,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (error) {
        exports.logger.error("Failed to write audit log", { action, uid, error });
    }
};
exports.writeAuditLog = writeAuditLog;
// Enterprise Optimization: Safely chunk massive batched writes (Firestore limit is 500)
const chunkedBatchCommit = async (items, operation) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += 450) {
        chunks.push(items.slice(i, i + 450));
    }
    for (const chunk of chunks) {
        const batch = exports.db.batch();
        chunk.forEach(item => operation(batch, item));
        await batch.commit();
    }
};
exports.chunkedBatchCommit = chunkedBatchCommit;
//# sourceMappingURL=utils.js.map