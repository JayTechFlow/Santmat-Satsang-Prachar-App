"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReceipt = exports.verifyPayment = exports.createPaymentIntent = void 0;
const functions = require("firebase-functions");
const utils_1 = require("./utils");
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
exports.verifyPayment = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
exports.generateReceipt = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
//# sourceMappingURL=donations.js.map