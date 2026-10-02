import { describe, it, after } from "node:test";
import assert from "node:assert";
import admin from "firebase-admin";

const adminLib = (admin as any)?.default || admin;
const adminApps = adminLib.apps || [];
if (!adminApps.length) {
  adminLib.initializeApp({ projectId: "demo-test" });
}

import firebaseFunctionsTest from "firebase-functions-test";
import * as notificationsFuncs from "../lib/notifications.js";

const testEnv = firebaseFunctionsTest({ projectId: "demo-test" });

describe("Push Notifications Callable Functions Unit Tests", () => {
  after(() => {
    testEnv.cleanup();
  });

  describe("subscribeTopic", () => {
    it("subscribes user device token to topic", async () => {
      const wrapped = testEnv.wrap(notificationsFuncs.subscribeTopic);

      let subscribed = false;
      const originalSubscribe = admin.messaging().subscribeToTopic;
      admin.messaging().subscribeToTopic = (async (token: string, topic: string) => {
        subscribed = true;
        assert.strictEqual(token, "device_token_123");
        assert.strictEqual(topic, "satsangs");
        return {} as any;
      }) as any;

      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async () => ({ id: "audit_n1" }),
      })) as any;

      try {
        const res = await wrapped(
          { token: "device_token_123", topic: "satsangs" },
          { auth: { uid: "admin_1", token: { role: "client_super_admin" } } } as any
        );

        assert.strictEqual(res.status, "success");
        assert.strictEqual(subscribed, true);
      } finally {
        admin.messaging().subscribeToTopic = originalSubscribe;
        admin.firestore().collection = originalCollection;
      }
    });
  });

  describe("unsubscribeTopic", () => {
    it("unsubscribes user device token from topic", async () => {
      const wrapped = testEnv.wrap(notificationsFuncs.unsubscribeTopic);

      let unsubscribed = false;
      const originalUnsubscribe = admin.messaging().unsubscribeFromTopic;
      admin.messaging().unsubscribeFromTopic = (async (token: string, topic: string) => {
        unsubscribed = true;
        assert.strictEqual(token, "device_token_123");
        assert.strictEqual(topic, "satsangs");
        return {} as any;
      }) as any;

      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async () => ({ id: "audit_n2" }),
      })) as any;

      try {
        const res = await wrapped(
          { token: "device_token_123", topic: "satsangs" },
          { auth: { uid: "admin_1", token: { role: "client_super_admin" } } } as any
        );

        assert.strictEqual(res.status, "success");
        assert.strictEqual(unsubscribed, true);
      } finally {
        admin.messaging().unsubscribeFromTopic = originalUnsubscribe;
        admin.firestore().collection = originalCollection;
      }
    });
  });

  describe("broadcast", () => {
    it("rejects non-admin calls", async () => {
      const wrapped = testEnv.wrap(notificationsFuncs.broadcast);
      await assert.rejects(async () => {
        await wrapped(
          { title: "Hi", body: "Hello" },
          { auth: { uid: "user_1", token: { role: "mobile_user" } } } as any
        );
      });
    });

    it("sends broadcast notification when called by client_super_admin", async () => {
      const wrapped = testEnv.wrap(notificationsFuncs.broadcast);

      let sent = false;
      const originalSend = admin.messaging().send;
      admin.messaging().send = (async (msg: any) => {
        sent = true;
        assert.strictEqual(msg.topic, "all_users");
        assert.strictEqual(msg.notification.title, "Global Announcement");
        return "msg_broadcast_99";
      }) as any;

      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async () => ({ id: "audit_n3" }),
      })) as any;

      try {
        const res = await wrapped(
          { title: "Global Announcement", body: "Satsang starts now" },
          { auth: { uid: "admin_1", token: { role: "client_super_admin", organizationId: "org_1" } } } as any
        );

        assert.strictEqual(res.status, "success");
        assert.strictEqual(sent, true);
      } finally {
        admin.messaging().send = originalSend;
        admin.firestore().collection = originalCollection;
      }
    });

    it("sends broadcast notification when called by developer_super_admin", async () => {
      const wrapped = testEnv.wrap(notificationsFuncs.broadcast);

      let sent = false;
      const originalSend = admin.messaging().send;
      admin.messaging().send = (async (msg: any) => {
        sent = true;
        assert.strictEqual(msg.topic, "all_users");
        assert.strictEqual(msg.notification.title, "Global Announcement");
        return "msg_broadcast_99";
      }) as any;

      const originalCollection = admin.firestore().collection;
      admin.firestore().collection = (() => ({
        add: async () => ({ id: "audit_n4" }),
      })) as any;

      try {
        const res = await wrapped(
          { title: "Global Announcement", body: "Satsang starts now" },
          { auth: { uid: "dev_admin_1", token: { role: "developer_super_admin", organizationId: "org_santmat_global" } } } as any
        );

        assert.strictEqual(res.status, "success");
        assert.strictEqual(sent, true);
      } finally {
        admin.messaging().send = originalSend;
        admin.firestore().collection = originalCollection;
      }
    });
  });
});
