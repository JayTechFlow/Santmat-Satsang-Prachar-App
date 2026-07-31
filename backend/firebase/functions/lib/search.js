"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trendingSearches = exports.autocomplete = exports.globalSearch = void 0;
const functions = require("firebase-functions");
const utils_1 = require("./utils");
exports.globalSearch = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
exports.autocomplete = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
exports.trendingSearches = functions.https.onCall(async (data, context) => {
    (0, utils_1.requireAuth)(context);
    return { status: "success", data: {} };
});
//# sourceMappingURL=search.js.map