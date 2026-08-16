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
import * as queueTriggers from "../lib/queue_triggers.js";

const testEnv = firebaseFunctionsTest({ projectId: "demo-test" });

describe("Queue Triggers Unit Tests", () => {
  after(() => {
    testEnv.cleanup();
  });

  describe("processQueueTask", () => {
    it("processes BULK_NOTIFICATION task and marks status completed", async () => {
      const wrapped = testEnv.wrap(queueTriggers.processQueueTask);

      const updates: any[] = [];
      const snap: any = {
        data: () => ({
          taskType: "BULK_NOTIFICATION",
          payload: {
            topic: "all_users",
            title: "Broadcast Title",
            body: "Broadcast Content",
          },
          status: "pending",
        }),
        ref: {
          update: async (data: any) => {
            updates.push(data);
          },
        },
      };

      const originalSend = admin.messaging().send;
      admin.messaging().send = (async () => "msg_broadcast_1") as any;

      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async () => ({ id: "audit_q1" }),
      })) as any;

      try {
        await wrapped(snap as any, { params: { taskId: "task_1" } });

        assert.ok(updates.some((u) => u.status === "processing"));
        assert.ok(updates.some((u) => u.status === "completed"));
      } finally {
        admin.messaging().send = originalSend;
        admin.firestore().collection = originalCollection;
      }
    });

    it("processes MEDIA_THUMBNAIL_GENERATION task", async () => {
      const wrapped = testEnv.wrap(queueTriggers.processQueueTask);

      const snap: any = {
        data: () => ({
          taskType: "MEDIA_THUMBNAIL_GENERATION",
          targetId: "media_100",
          storagePath: "images/poster.png",
          status: "pending",
        }),
        ref: {
          update: async () => {},
        },
      };

      let thumbnailSet = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = ((name: string) => {
        return {
          doc: () => ({
            set: async (data: any) => {
              thumbnailSet = true;
              assert.strictEqual(data.thumbnailPath, "images/thumbnails/thumb_poster.png");
            },
          }),
          add: async () => ({ id: "audit_q2" }),
        } as any;
      }) as any;

      try {
        await wrapped(snap as any, { params: { taskId: "task_2" } });
        assert.strictEqual(thumbnailSet, true);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });
  });

  describe("enqueueTask HTTPS Callable", () => {
    it("throws unauthenticated error when called without auth context", async () => {
      const wrapped = testEnv.wrap(queueTriggers.enqueueTask);
      await assert.rejects(async () => {
        await wrapped({ taskType: "BULK_NOTIFICATION" }, {} as any);
      });
    });

    it("throws permission denied when called by mobile_user", async () => {
      const wrapped = testEnv.wrap(queueTriggers.enqueueTask);
      const authContext = {
        auth: {
          uid: "user_mobile",
          token: { role: "mobile_user", organizationId: "org_1" },
        },
      };

      await assert.rejects(async () => {
        await wrapped(
          {
            taskType: "METADATA_SYNC",
            targetCollection: "media",
          },
          authContext as any
        );
      });
    });

    it("enqueues task when client_super_admin caller provides valid arguments", async () => {
      const wrapped = testEnv.wrap(queueTriggers.enqueueTask);
      const authContext = {
        auth: {
          uid: "user_admin",
          token: { role: "client_super_admin", organizationId: "org_1" },
        },
      };

      let addCalled = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async (data: any) => {
          addCalled = true;
          return { id: "task_new_99" };
        },
      })) as any;

      try {
        const res = await wrapped(
          {
            taskType: "METADATA_SYNC",
            targetCollection: "media",
          },
          authContext as any
        );

        assert.strictEqual(res.status, "success");
        assert.strictEqual(res.data.taskId, "task_new_99");
        assert.strictEqual(addCalled, true);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });

    it("rejects TRASH_CLEANUP with invalid targetCollection", async () => {
      const wrapped = testEnv.wrap(queueTriggers.enqueueTask);
      const authContext = {
        auth: {
          uid: "user_admin",
          token: { role: "client_super_admin", organizationId: "org_1" },
        },
      };

      await assert.rejects(async () => {
        await wrapped(
          {
            taskType: "TRASH_CLEANUP",
            targetCollection: "users",
            targetId: "user_123",
          },
          authContext as any
        );
      });
    });
  });
});
