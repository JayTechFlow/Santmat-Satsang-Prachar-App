import { describe, it, after } from "node:test";
import assert from "node:assert";
import admin from "firebase-admin";

process.env.FIREBASE_CONFIG = JSON.stringify({
  projectId: "demo-test",
  storageBucket: "demo-test.appspot.com",
});

const adminLib = (admin as any)?.default || admin;
const adminApps = adminLib.apps || [];
if (!adminApps.length) {
  adminLib.initializeApp({ projectId: "demo-test", storageBucket: "demo-test.appspot.com" });
}

import firebaseFunctionsTest from "firebase-functions-test";
import * as authTriggers from "../lib/auth_triggers.js";

const testEnv = firebaseFunctionsTest({ projectId: "demo-test" });

describe("Auth Triggers Unit Tests", () => {
  after(() => {
    testEnv.cleanup();
  });

  describe("onAuthUserDeleted", () => {
    it("handles auth user deletion, audit logging, storage cleanup, and Firestore profile recursion", async () => {
      const wrapped = testEnv.wrap(authTriggers.onAuthUserDeleted);

      let storageDeleted = false;
      let firestoreDeleted = false;
      let auditLogged = false;

      // 1. Mock Storage
      const storageInstance = admin.storage();
      const originalBucket = storageInstance.bucket;
      storageInstance.bucket = (() => ({
        deleteFiles: async (options: any) => {
          console.log("Mock Storage deleteFiles called with prefix:", options?.prefix);
          if (options?.prefix?.includes("user_to_delete")) {
            storageDeleted = true;
          }
        }
      })) as any;

      // 2. Mock Firestore
      const db = admin.firestore();
      const originalCollection = db.collection;
      const originalRecursiveDelete = db.recursiveDelete;

      db.collection = ((name: string) => {
        console.log("Mock Firestore collection called for name:", name);
        if (name === "audit_logs") {
          return {
            add: async (data: any) => {
              console.log("Mock Firestore audit log added:", data);
              auditLogged = true;
              return { id: "audit_1" };
            }
          };
        }
        return {
          doc: (id: string) => ({
            delete: async () => {},
          })
        };
      }) as any;

      db.recursiveDelete = (async (docRef: any) => {
        console.log("Mock Firestore recursiveDelete called");
        firestoreDeleted = true;
      }) as any;

      try {
        await wrapped({
          uid: "user_to_delete",
          email: "delete_test@santmat.org",
        });

        assert.strictEqual(storageDeleted, true, "Storage files should be deleted");
        assert.strictEqual(firestoreDeleted, true, "Firestore document and subcollections should be recursively deleted");
        assert.strictEqual(auditLogged, true, "Audit logs should be created");
      } finally {
        // Restore
        storageInstance.bucket = originalBucket;
        db.collection = originalCollection;
        db.recursiveDelete = originalRecursiveDelete;
      }
    });
  });
});
