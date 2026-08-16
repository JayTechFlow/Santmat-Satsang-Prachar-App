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
import * as aiTriggers from "../lib/ai_triggers.js";

const testEnv = firebaseFunctionsTest({ projectId: "demo-test" });

describe("AI Triggers Unit Tests", () => {
  after(() => {
    testEnv.cleanup();
  });

  describe("processAITask", () => {
    it("processes CONTENT_MODERATION task and updates target Firestore doc", async () => {
      const wrapped = testEnv.wrap(aiTriggers.processAITask);

      const updates: any[] = [];
      const snap: any = {
        data: () => ({
          taskType: "CONTENT_MODERATION",
          targetCollection: "media",
          targetId: "media_50",
          content: "Welcome to Santmat satsang live stream",
          status: "pending",
        }),
        ref: {
          update: async (data: any) => {
            updates.push(data);
          },
        },
      };

      let targetUpdated = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = ((name: string) => {
        return {
          doc: () => ({
            set: async (data: any) => {
              targetUpdated = true;
              assert.strictEqual(data.moderationStatus, "approved");
            },
          }),
          add: async () => ({ id: "audit_ai1" }),
        } as any;
      }) as any;

      try {
        await wrapped(snap as any, { params: { taskId: "ai_task_1" } });

        assert.ok(updates.some((u) => u.status === "completed"));
        assert.strictEqual(targetUpdated, true);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });

    it("processes AUTO_TAGGING task and generates content tags", async () => {
      const wrapped = testEnv.wrap(aiTriggers.processAITask);

      const snap: any = {
        data: () => ({
          taskType: "AUTO_TAGGING",
          targetCollection: "media",
          targetId: "media_51",
          content: "Spiritual discourse on inner meditation and devotion",
          status: "pending",
        }),
        ref: {
          update: async () => {},
        },
      };

      let tagsUpdated = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = ((name: string) => {
        return {
          doc: () => ({
            set: async (data: any) => {
              tagsUpdated = true;
              assert.ok(Array.isArray(data.autoTags));
            },
          }),
          add: async () => ({ id: "audit_ai2" }),
        } as any;
      }) as any;

      try {
        await wrapped(snap as any, { params: { taskId: "ai_task_2" } });
        assert.strictEqual(tagsUpdated, true);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });
  });

  describe("triggerAITask HTTPS Callable", () => {
    it("rejects non-admin calls", async () => {
      const wrapped = testEnv.wrap(aiTriggers.triggerAITask);
      const authContext = {
        auth: {
          uid: "user_mobile",
          token: { role: "mobile_user", organizationId: "org_1" },
        },
      };

      await assert.rejects(async () => {
        await wrapped(
          {
            taskType: "AUTO_SUMMARY",
            content: "Test content",
          },
          authContext as any
        );
      });
    });

    it("submits AI job and returns task ID for client_super_admin", async () => {
      const wrapped = testEnv.wrap(aiTriggers.triggerAITask);
      const authContext = {
        auth: {
          uid: "user_admin",
          token: { role: "client_super_admin", organizationId: "org_1" },
        },
      };

      let addCalled = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async () => {
          addCalled = true;
          return { id: "ai_submitted_1" };
        },
      })) as any;

      try {
        const res = await wrapped(
          {
            taskType: "AUTO_SUMMARY",
            content: "Long spiritual text content for summary testing.",
          },
          authContext as any
        );

        assert.strictEqual(res.status, "success");
        assert.strictEqual(res.data.taskId, "ai_submitted_1");
        assert.strictEqual(addCalled, true);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });

    it("submits AI job for developer_super_admin", async () => {
      const wrapped = testEnv.wrap(aiTriggers.triggerAITask);
      const authContext = {
        auth: {
          uid: "dev_admin",
          token: { role: "developer_super_admin", organizationId: "org_santmat_global" },
        },
      };

      let addCalled = false;
      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async () => {
          addCalled = true;
          return { id: "ai_submitted_2" };
        },
      })) as any;

      try {
        const res = await wrapped(
          {
            taskType: "AUTO_TAGGING",
            content: "Test content for tagging",
          },
          authContext as any
        );

        assert.strictEqual(res.status, "success");
        assert.strictEqual(res.data.taskId, "ai_submitted_2");
        assert.strictEqual(addCalled, true);
      } finally {
        admin.firestore().collection = originalCollection;
      }
    });

    it("rejects AI task targeting protected collection", async () => {
      const wrapped = testEnv.wrap(aiTriggers.triggerAITask);
      const authContext = {
        auth: {
          uid: "user_admin",
          token: { role: "client_super_admin", organizationId: "org_1" },
        },
      };

      await assert.rejects(async () => {
        await wrapped(
          {
            taskType: "AUTO_SUMMARY",
            content: "Test content",
            targetCollection: "users",
            targetId: "user_123",
          },
          authContext as any
        );
      });
    });

    it("rejects AI task targeting invalid collection", async () => {
      const wrapped = testEnv.wrap(aiTriggers.triggerAITask);
      const authContext = {
        auth: {
          uid: "user_admin",
          token: { role: "client_super_admin", organizationId: "org_1" },
        },
      };

      await assert.rejects(async () => {
        await wrapped(
          {
            taskType: "AUTO_SUMMARY",
            content: "Test content",
            targetCollection: "invalid_collection",
            targetId: "doc_123",
          },
          authContext as any
        );
      });
    });
  });
});
