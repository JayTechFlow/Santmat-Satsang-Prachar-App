import * as functions from "firebase-functions";
import { requireAuth, logger, db } from "./utils";

export const validateToken = functions.https.onCall(async (data, context) => {
    requireAuth(context);

    const uid = context.auth?.uid;
    let role: string = 'mobile_user';
    let email = '';
    let displayName = '';

    try {
      const token = context.auth?.token;
      if (token) {
        role = token.role || 'mobile_user';
        email = token.email || '';
        displayName = token.name || '';
      }
    } catch (e) {
      logger.warn("Failed to read auth token", { error: e });
    }

    // Also fetch Firestore user profile for additional fields
    let profileEmail = '';
    let profileDisplayName = '';
    try {
      const userDocRef = db.doc('users', uid || '');
      const userSnap = await userDocRef.get();
      if (userSnap.exists()) {
        const up = userSnap.data() as any;
        profileEmail = up.email || '';
        profileDisplayName = up.displayName || '';
      }
    } catch (e) {
      logger.warn("Failed to fetch user profile from Firestore", { error: e });
    }

    return {
      status: "success",
      data: {
        uid,
        role,
        email: email || profileEmail,
        displayName: displayName || profileDisplayName,
        emailVerified: context.auth?.token?.emailVerified || false
      }
    };
  });

export const sessionValidation = functions.https.onCall(async (data, context) => {
    requireAuth(context);

    const uid = context.auth?.uid;

    try {
      const token = context.auth?.token;
      const role = token?.role || 'mobile_user';
      const email = token?.email || '';

      return {
        status: "success",
        data: {
          uid,
          role,
          email,
          authenticatedAt: new Date().toISOString()
        }
      };
    } catch (e) {
      logger.warn("Session validation failed", { error: e });
      return {
        status: "error",
        data: { error: "Session validation failed" }
      };
    }
  });