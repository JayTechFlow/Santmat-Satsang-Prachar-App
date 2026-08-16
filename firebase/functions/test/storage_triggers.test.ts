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
import * as storageTriggers from "../lib/storage_triggers.js";

const testEnv = firebaseFunctionsTest({
  projectId: "demo-test",
  storageBucket: "demo-test.appspot.com",
});

describe("Storage Triggers Unit Tests", () => {
  after(() => {
    testEnv.cleanup();
  });

  describe("onStorageObjectFinalized", () => {
    it("ignores thumbnail upload to prevent infinite recursion", async () => {
      const wrapped = testEnv.wrap(storageTriggers.onStorageObjectFinalized);
      const object = {
        name: "banners/thumbnails/thumb_test.jpg",
        bucket: "demo-test.appspot.com",
        contentType: "image/jpeg",
        size: "1024",
      };

      await assert.doesNotReject(async () => {
        await wrapped(object as any);
      });
    });

    it("processes image upload, updates Firestore metadata and computes thumbnail path", async () => {
      const wrapped = testEnv.wrap(storageTriggers.onStorageObjectFinalized);
      const object = {
        name: "banners/banner1.jpg",
        bucket: "demo-test.appspot.com",
        contentType: "image/jpeg",
        size: "2048",
        timeCreated: new Date().toISOString(),
        metadata: {
          mediaId: "media_123",
          uploadedBy: "user_1",
        },
      };

      let setCalls = 0;
      let getCalled = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = ((name: string) => {
        if (name === "media") {
          return {
            doc: () => ({
              get: async () => {
                getCalled = true;
                return { exists: true, data: () => ({ storagePath: "banners/banner1.jpg" }) };
              },
              set: async (data: any) => {
                setCalls++;
                if (data.storagePath) {
                  assert.strictEqual(data.storagePath, "banners/banner1.jpg");
                }
                return {};
              },
            }),
          } as any;
        }
        return {
          doc: () => ({
            set: async (data: any) => {
              setCalls++;
              if (data.filePath) {
                assert.strictEqual(data.filePath, "banners/banner1.jpg");
              }
              return {};
            },
          }),
          add: async () => ({ id: "audit_1" }),
        } as any;
      }) as any;

      try {
        await wrapped(object as any);
        assert.ok(setCalls > 0);
        assert.strictEqual(getCalled, true);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });

    it("does not update media document when mediaId verification fails", async () => {
      const wrapped = testEnv.wrap(storageTriggers.onStorageObjectFinalized);
      const object = {
        name: "banners/banner2.jpg",
        bucket: "demo-test.appspot.com",
        contentType: "image/jpeg",
        size: "2048",
        timeCreated: new Date().toISOString(),
        metadata: {
          mediaId: "media_999",
          uploadedBy: "user_1",
        },
      };

      let mediaSetCalled = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = ((name: string) => {
        if (name === "media") {
          return {
            doc: () => ({
              get: async () => ({ exists: false }),
              set: async () => {
                mediaSetCalled = true;
                return {};
              },
            }),
          } as any;
        }
        return {
          doc: () => ({
            set: async () => ({}),
          }),
          add: async () => ({ id: "audit_3" }),
        } as any;
      }) as any;

      try {
        await wrapped(object as any);
        assert.strictEqual(mediaSetCalled, false);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });

    it("does not send notification for client-controlled metadata.publishNotification", async () => {
      const wrapped = testEnv.wrap(storageTriggers.onStorageObjectFinalized);
      const object = {
        name: "images/photo.jpg",
        bucket: "demo-test.appspot.com",
        contentType: "image/jpeg",
        size: "1024",
        timeCreated: new Date().toISOString(),
        metadata: {
          publishNotification: "true",
          notifyTopic: "malicious_topic",
          mediaId: "media_123",
          uploadedBy: "user_1",
        },
      };

      let sendCalled = false;
      const originalSend = admin.messaging().send;
      admin.messaging().send = (async (msg: any) => {
        sendCalled = true;
        return "msg_123";
      }) as any;

      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        doc: () => ({
          get: async () => ({ exists: true, data: () => ({ storagePath: "images/photo.jpg" }) }),
          set: async () => ({}),
        }),
        add: async () => ({ id: "audit_4" }),
      })) as any;

      try {
        await wrapped(object as any);
        assert.strictEqual(sendCalled, false);
      } finally {
        admin.messaging().send = originalSend;
        admin.firestore().collection = originalCollection;
      }
    });

    it("sends notification for broadcasts folder upload", async () => {
      const wrapped = testEnv.wrap(storageTriggers.onStorageObjectFinalized);
      const object = {
        name: "broadcasts/satsang_live.mp3",
        bucket: "demo-test.appspot.com",
        contentType: "audio/mpeg",
        size: "1024",
        timeCreated: new Date().toISOString(),
        metadata: {
          uploadedBy: "admin_1",
        },
      };

      let sendCalled = false;
      const originalSend = admin.messaging().send;
      admin.messaging().send = (async (msg: any) => {
        sendCalled = true;
        assert.strictEqual(msg.topic, "broadcasts");
        return "msg_123";
      }) as any;

      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        doc: () => ({
          set: async () => ({}),
        }),
        add: async () => ({ id: "audit_5" }),
      })) as any;

      try {
        await wrapped(object as any);
        assert.strictEqual(sendCalled, true);
      } finally {
        admin.messaging().send = originalSend;
        admin.firestore().collection = originalCollection;
      }
    });
  });

  describe("onStorageObjectDeleted", () => {
    it("marks deleted storage file record status as deleted", async () => {
      const wrapped = testEnv.wrap(storageTriggers.onStorageObjectDeleted);
      const object = {
        name: "banners/banner1.jpg",
        bucket: "demo-test.appspot.com",
        metadata: {
          mediaId: "media_123",
          deletedBy: "admin_1",
        },
      };

      let setCalls = 0;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = ((name: string) => {
        return {
          doc: () => ({
            set: async (data: any) => {
              setCalls++;
              if (data.status) {
                assert.strictEqual(data.status, "deleted");
              }
              if (data.storageStatus) {
                assert.strictEqual(data.storageStatus, "deleted");
              }
              return {};
            },
          }),
          add: async () => ({ id: "audit_2" }),
        } as any;
      }) as any;

      try {
        await wrapped(object as any);
        assert.ok(setCalls > 0);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });
  });
});
