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
import * as firestoreTriggers from "../lib/firestore_triggers.js";

const testEnv = firebaseFunctionsTest({ projectId: "demo-test" });

function createMockSnap(data: any, exists = true) {
  const snap: any = {
    exists,
    data: () => data,
    ref: {
      update: async () => {},
    },
  };
  return snap;
}

describe("Firestore Triggers Unit Tests", () => {
  after(() => {
    testEnv.cleanup();
  });

  describe("onMediaDocumentWrite", () => {
    it("handles media creation, audit log, and category stats recalculation", async () => {
      const wrapped = testEnv.wrap(firestoreTriggers.onMediaDocumentWrite);

      const beforeSnap = createMockSnap(null, false);
      const afterSnap = createMockSnap({
        title: "Satsang Audio 1",
        category: "audio",
        type: "audio",
        status: "draft",
        uploadedBy: "user_1",
      });

      const change = { before: beforeSnap, after: afterSnap };

      let auditLogged = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = ((name: string) => {
        return {
          add: async (data: any) => {
            auditLogged = true;
            return { id: "audit_1" };
          },
          doc: () => ({ set: async () => ({}) }),
          where: () => ({
            where: () => ({
              get: async () => ({ docs: [afterSnap] }),
            }),
          }),
        } as any;
      }) as any;

      try {
        await wrapped(change as any, { params: { mediaId: "media_1" } });
        assert.strictEqual(auditLogged, true);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });

    it("dispatches push notification when status transitions to published", async () => {
      const wrapped = testEnv.wrap(firestoreTriggers.onMediaDocumentWrite);

      const beforeSnap = createMockSnap({ status: "draft", title: "Draft Satsang" });
      const afterSnap = createMockSnap({
        status: "published",
        title: "Published Satsang",
        category: "bhajans",
        notificationTopic: "bhajans_topic",
      });

      const change = { before: beforeSnap, after: afterSnap };

      let notificationSent = false;
      const originalSend = admin.messaging().send;
      admin.messaging().send = (async (msg: any) => {
        notificationSent = true;
        assert.strictEqual(msg.topic, "bhajans_topic");
        return "msg_123";
      }) as any;

      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async () => ({ id: "audit_2" }),
        doc: () => ({ set: async () => ({}) }),
        where: () => ({
          where: () => ({
            get: async () => ({ docs: [] }),
          }),
        }),
      })) as any;

      try {
        await wrapped(change as any, { params: { mediaId: "media_2" } });
        assert.strictEqual(notificationSent, true);
      } finally {
        admin.messaging().send = originalSend;
        admin.firestore().collection = originalCollection;
      }
    });

    it("enqueues TRASH_CLEANUP task when media status is set to trash", async () => {
      const wrapped = testEnv.wrap(firestoreTriggers.onMediaDocumentWrite);

      const beforeSnap = createMockSnap({ status: "published" });
      const afterSnap = createMockSnap({ status: "trash", storagePath: "audio/old.mp3" });

      const change = { before: beforeSnap, after: afterSnap };

      let taskEnqueued = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = ((collName: string) => {
        return {
          add: async (data: any) => {
            if (collName === "queue_tasks" || data.taskType === "TRASH_CLEANUP") {
              taskEnqueued = true;
              assert.strictEqual(data.taskType, "TRASH_CLEANUP");
              assert.strictEqual(data.targetId, "media_trash");
            }
            return { id: "queue_1" };
          },
          doc: () => ({ set: async () => ({}) }),
          where: () => ({
            where: () => ({
              get: async () => ({ docs: [] }),
            }),
          }),
        } as any;
      }) as any;

      try {
        await wrapped(change as any, { params: { mediaId: "media_trash" } });
        assert.strictEqual(taskEnqueued, true);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });
  });

  describe("onNotificationQueueCreated", () => {
    it("processes and sends multicast push notification from queue", async () => {
      const wrapped = testEnv.wrap(firestoreTriggers.onNotificationQueueCreated);

      let updateCalled = false;
      const snap = {
        data: () => ({
          title: "Announcement",
          body: "Satsang starts at 5 PM",
          tokens: ["token_1", "token_2"],
        }),
        ref: {
          update: async (data: any) => {
            updateCalled = true;
            assert.strictEqual(data.status, "sent");
          },
        },
      };

      let multicastSent = false;
      const originalMulticast = admin.messaging().sendMulticast;
      admin.messaging().sendMulticast = (async (msg: any) => {
        multicastSent = true;
        assert.strictEqual(msg.tokens.length, 2);
        return { successCount: 2, failureCount: 0, responses: [] };
      }) as any;

      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async () => ({ id: "audit_3" }),
      })) as any;

      try {
        await wrapped(snap as any, { params: { queueId: "queue_1" } });
        assert.strictEqual(multicastSent, true);
        assert.strictEqual(updateCalled, true);
      } finally {
        admin.messaging().sendMulticast = originalMulticast;
        admin.firestore().collection = originalCollection;
      }
    });
  });
});
