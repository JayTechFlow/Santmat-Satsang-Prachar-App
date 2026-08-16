import * as admin from "firebase-admin";

// Ensure Firebase Admin is initialized securely for both Cloud and Local execution
// Uses GOOGLE_APPLICATION_CREDENTIALS or Application Default Credentials (ADC)
// DO NOT generate ADC files with hardcoded credentials - use gcloud auth application-default login
if (!admin.apps.length) {
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.FIREBASE_PROJECT_ID ||
    "santmat-satsang-prachar";

  process.env.GOOGLE_CLOUD_PROJECT = projectId;
  process.env.GCLOUD_PROJECT = projectId;

  // Require GOOGLE_APPLICATION_CREDENTIALS to be set externally
  // This script does NOT generate or write credential files
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
    console.error("Please run: gcloud auth application-default login");
    console.error("Or set GOOGLE_APPLICATION_CREDENTIALS to a service account key file.");
    process.exit(1);
  }

  admin.initializeApp({
    projectId,
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

/**
 * Enterprise Option D — Offline Admin SDK Script Ceremony
 * Direct, zero-HTTP-attack-surface bootstrap execution using service account / GOOGLE_APPLICATION_CREDENTIALS.
 */
export async function runDeveloperBootstrap(targetEmail: string) {
  const startTime = Date.now();
  console.log(`Starting Enterprise Developer Super Admin Bootstrap Ceremony for: ${targetEmail}`);

  if (!targetEmail || !targetEmail.includes("@")) {
    throw new Error("Invalid target email address specified.");
  }

  // Find User by Email in Firebase Auth
  let userRecord: admin.auth.UserRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(targetEmail);
  } catch (error) {
    throw new Error(`Target user with email ${targetEmail} not found in Firebase Auth: ${(error as Error).message}`);
  }

  const callerUid = userRecord.uid;
  const bootstrapRef = db.collection("system_config").doc("bootstrap");
  const userRef = db.collection("users").doc(callerUid);

  // Execute Atomic Transaction
  await db.runTransaction(async (transaction) => {
    const bootstrapDoc = await transaction.get(bootstrapRef);
    if (bootstrapDoc.exists && bootstrapDoc.data()?.bootstrapped === true) {
      throw new Error("Developer Super Admin has already been bootstrapped. Ceremony permanently locked.");
    }

    const devQuery = await db
      .collection("users")
      .where("role", "==", "developer_super_admin")
      .limit(1)
      .get();

    if (!devQuery.empty) {
      throw new Error("A Developer Super Admin document already exists in Firestore. Ceremony forbidden.");
    }

    // Permanently lock bootstrap
    transaction.set(bootstrapRef, {
      bootstrapped: true,
      developerUid: callerUid,
      developerEmail: targetEmail,
      bootstrappedAt: admin.firestore.FieldValue.serverTimestamp(),
      environment: process.env.NODE_ENV || "production",
      bootstrapMethod: "ADMIN_SDK_CLI_SCRIPT",
    });

    // Write Developer User Document
    transaction.set(
      userRef,
      {
        email: targetEmail,
        role: "developer_super_admin",
        roleIds: ["developer_super_admin"],
        status: "active",
        organizationId: "org_santmat_global",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        auditMetadata: {
          bootstrappedViaCeremony: true,
          method: "ADMIN_SDK_CLI_SCRIPT",
          bootstrappedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );
  });

  // Set Firebase Auth Custom Claims
  const developerClaims = {
    admin: true,
    role: "developer_super_admin",
    organizationId: "org_santmat_global",
    accountStatus: "active",
  };

  await admin.auth().setCustomUserClaims(callerUid, developerClaims);

  const durationMs = Date.now() - startTime;

  // Write Audit Log
  await db.collection("audit_logs").add({
    action: "BOOTSTRAP_DEVELOPER_SUPER_ADMIN_CLI_CEREMONY",
    uid: callerUid,
    details: {
      targetEmail,
      durationMs,
      result: "SUCCESS",
      method: "ADMIN_SDK_CLI_SCRIPT",
    },
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ Developer Super Admin Ceremony SUCCESSful in ${durationMs}ms`);
  console.log(`Developer UID: ${callerUid}`);
  console.log(`Claims Applied:`, developerClaims);
}

// CLI Execution Entry Point
if (require.main === module) {
  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error("Usage: npm run bootstrap:dev -- <developer_email>");
    process.exit(1);
  }

  runDeveloperBootstrap(emailArg)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Ceremony FAILED:", err.message);
      process.exit(1);
    });
}
