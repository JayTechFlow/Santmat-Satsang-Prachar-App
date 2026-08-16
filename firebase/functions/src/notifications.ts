import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { requireAuth, requireAdmin, logger, writeAuditLog } from "./utils";

export const subscribeTopic = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const { token, topic } = data;
  if (!token || !topic) {
    throw new functions.https.HttpsError("invalid-argument", "Token and topic required.");
  }
  await admin.messaging().subscribeToTopic(token, topic);
  await writeAuditLog("SUBSCRIBE_TOPIC", context.auth!.uid, { topic });
  return { status: "success", data: { subscribed: true, topic } };
});

export const unsubscribeTopic = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const { token, topic } = data;
  if (!token || !topic) {
    throw new functions.https.HttpsError("invalid-argument", "Token and topic required.");
  }
  await admin.messaging().unsubscribeFromTopic(token, topic);
  await writeAuditLog("UNSUBSCRIBE_TOPIC", context.auth!.uid, { topic });
  return { status: "success", data: { unsubscribed: true, topic } };
});

export const broadcast = functions.https.onCall(async (data, context) => {
  requireAdmin(context);
  const uid = context.auth!.uid;
  const { title, body, topic = "all_users", payload } = data;

  if (!title || !body) {
    throw new functions.https.HttpsError("invalid-argument", "Title and body are required for broadcast.");
  }

  logger.info("Notification broadcast triggered", { uid, topic, title });

  const message: admin.messaging.Message = {
    topic,
    notification: {
      title,
      body,
    },
    data: payload || {},
  };

  const messageId = await admin.messaging().send(message);

  await writeAuditLog("NOTIFICATION_BROADCAST", uid, {
    messageId,
    topic,
    title,
    body,
  });

  return { status: "success", data: { messageId, topic } };
});

export const sendDirectNotification = functions.https.onCall(async (data, context) => {
  requireAdmin(context);
  const uid = context.auth!.uid;
  const { targetToken, targetTokens, title, body, payload } = data;

  if (!title || !body || (!targetToken && (!targetTokens || targetTokens.length === 0))) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Title, body, and targetToken or targetTokens are required."
    );
  }

  if (targetToken) {
    const messageId = await admin.messaging().send({
      token: targetToken,
      notification: { title, body },
      data: payload || {},
    });

    await writeAuditLog("NOTIFICATION_DIRECT_SENT", uid, { messageId, targetToken });
    return { status: "success", data: { messageId } };
  } else {
    const multicastResult = await admin.messaging().sendMulticast({
      tokens: targetTokens,
      notification: { title, body },
      data: payload || {},
    });

    await writeAuditLog("NOTIFICATION_MULTICAST_SENT", uid, {
      successCount: multicastResult.successCount,
      failureCount: multicastResult.failureCount,
    });

    return {
      status: "success",
      data: {
        successCount: multicastResult.successCount,
        failureCount: multicastResult.failureCount,
      },
    };
  }
});
