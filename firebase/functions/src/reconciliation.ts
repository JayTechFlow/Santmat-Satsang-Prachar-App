import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { requireAdmin, writeAuditLog, db } from "./utils";

function getStorage() {
  if (!admin.apps.length) admin.initializeApp();
  return admin.storage();
}

/**
 * Extracts a storage path from a Firebase Storage URL.
 * e.g., https://firebasestorage.googleapis.com/v0/b/bucket/o/audio%2Fbhajans%2Fsong.mp3?alt=media
 */
function getStoragePathFromUrl(url: string | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  if (url.includes("firebasestorage.googleapis.com")) {
    try {
      const parts = url.split("/o/");
      if (parts.length > 1) {
        const pathPart = parts[1].split("?")[0];
        return decodeURIComponent(pathPart);
      }
    } catch (err) {
      // Ignored
    }
  }
  return null;
}

export const reconcileSystem = functions.https.onCall(async (data, context) => {
  requireAdmin(context);

  const callerUid = context.auth?.uid ?? "system";

  try {
    // ---------------------------------------------------------
    // 1. IDENTITY RECONCILIATION
    // ---------------------------------------------------------
    const firestoreUsersSnap = await db.collection("users").get();
    const firestoreUsersMap = new Map<string, any>();
    firestoreUsersSnap.forEach((doc) => {
      firestoreUsersMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    const authUsers: admin.auth.UserRecord[] = [];
    let pageToken: string | undefined = undefined;
    do {
      const result = await admin.auth().listUsers(1000, pageToken);
      authUsers.push(...result.users);
      pageToken = result.pageToken;
    } while (pageToken);

    const authUsersMap = new Map<string, admin.auth.UserRecord>();
    authUsers.forEach((user) => {
      authUsersMap.set(user.uid, user);
    });

    const userMismatches: any[] = [];
    const allUids = new Set([...firestoreUsersMap.keys(), ...authUsersMap.keys()]);

    for (const uid of allUids) {
      const authUser = authUsersMap.get(uid);
      const firestoreUser = firestoreUsersMap.get(uid);

      if (authUser && !firestoreUser) {
        userMismatches.push({
          uid,
          email: authUser.email || "unknown@santmat.org",
          displayName: authUser.displayName || "Auth User",
          type: "MISSING_PROFILE",
          details: {
            authRole: authUser.customClaims?.role || "mobile_user",
            authStatus: authUser.customClaims?.accountStatus || (authUser.disabled ? "suspended" : "active"),
          },
        });
      } else if (!authUser && firestoreUser) {
        userMismatches.push({
          uid,
          email: firestoreUser.email || "unknown@santmat.org",
          displayName: firestoreUser.displayName || firestoreUser.name || "Firestore Profile",
          type: "ORPHAN_PROFILE",
          details: {
            firestoreRole: firestoreUser.role || "mobile_user",
            firestoreStatus: firestoreUser.status || firestoreUser.accountStatus || "active",
          },
        });
      } else if (authUser && firestoreUser) {
        const authRole = authUser.customClaims?.role;
        const firestoreRole = firestoreUser.role;
        const authStatus = authUser.customClaims?.accountStatus;
        const firestoreStatus = firestoreUser.status || firestoreUser.accountStatus;

        if (authRole !== firestoreRole || authStatus !== firestoreStatus) {
          userMismatches.push({
            uid,
            email: authUser.email || firestoreUser.email || "unknown@santmat.org",
            displayName: authUser.displayName || firestoreUser.displayName || "User",
            type: "ROLE_DRIFT",
            details: {
              authRole: authRole || "none",
              firestoreRole: firestoreRole || "none",
              authStatus: authStatus || "none",
              firestoreStatus: firestoreStatus || "none",
            },
          });
        }
      }
    }

    // ---------------------------------------------------------
    // 2. STORAGE OBJECTS INVENTORY
    // ---------------------------------------------------------
    const storageFilesMap = new Map<string, {
      path: string;
      name: string;
      contentType: string;
      sizeBytes: number;
      updatedAt: string;
      md5Hash?: string;
    }>();

    // A. Query storage_files metadata collection (synced via onFinalize trigger)
    try {
      const storageFilesSnap = await db.collection("storage_files").get();
      storageFilesSnap.forEach((doc) => {
        const fileData = doc.data();
        if (fileData && fileData.filePath && fileData.status !== "deleted") {
          storageFilesMap.set(fileData.filePath, {
            path: fileData.filePath,
            name: fileData.filePath.split("/").pop() || "",
            contentType: fileData.contentType || "application/octet-stream",
            sizeBytes: fileData.sizeBytes || 0,
            updatedAt: fileData.updatedAt?.toDate ? fileData.updatedAt.toDate().toISOString() : fileData.createdAt || "",
            md5Hash: fileData.md5Hash || "",
          });
        }
      });
    } catch (err: any) {
      functions.logger.warn("Failed to query storage_files collection", err);
    }

    // B. List actual files in Storage bucket (direct source of truth)
    try {
      const bucket = getStorage().bucket();
      const [files] = await bucket.getFiles();
      for (const file of files) {
        // Exclude thumbnails
        if (file.name.includes("thumbnails/") || file.name.includes("_thumb.")) {
          continue;
        }
        storageFilesMap.set(file.name, {
          path: file.name,
          name: file.name.split("/").pop() || "",
          contentType: file.metadata?.contentType || "application/octet-stream",
          sizeBytes: parseInt(file.metadata?.size || "0", 10),
          updatedAt: file.metadata?.updated || file.metadata?.timeCreated || "",
          md5Hash: file.metadata?.md5Hash || "",
        });
      }
    } catch (err: any) {
      functions.logger.warn("Failed to list files from storage bucket", err);
    }

    // ---------------------------------------------------------
    // 3. FETCH DOMAIN CONTENT RECORDS
    // ---------------------------------------------------------
    const contentCollections = ["audio", "stuti_vinati", "books", "banners"];
    const contentRecords: any[] = [];
    const mediaPathReferences = new Map<string, Array<{ col: string; id: string; title: string }>>();

    const addReference = (path: string | null | undefined, col: string, id: string, title: string) => {
      if (!path) return;
      const cleanPath = path.trim();
      if (!cleanPath) return;

      if (!mediaPathReferences.has(cleanPath)) {
        mediaPathReferences.set(cleanPath, []);
      }
      mediaPathReferences.get(cleanPath)!.push({ col, id, title });
    };

    for (const colName of contentCollections) {
      const snap = await db.collection(colName).get();
      snap.forEach((doc) => {
        const record = doc.data();
        contentRecords.push({
          collection: colName,
          id: doc.id,
          data: record,
        });

        const title = record.title || record.name || `Unnamed (${doc.id})`;

        // Extract references
        if (colName === "audio") {
          addReference(record.storagePath, colName, doc.id, title);
          addReference(getStoragePathFromUrl(record.audioUrl), colName, doc.id, title);
        } else if (colName === "stuti_vinati") {
          addReference(record.storagePath, colName, doc.id, title);
          addReference(getStoragePathFromUrl(record.audioUrl), colName, doc.id, title);
        } else if (colName === "books") {
          addReference(record.storagePath, colName, doc.id, title);
          addReference(getStoragePathFromUrl(record.pdfUrl), colName, doc.id, title);
          addReference(getStoragePathFromUrl(record.coverUrl), colName, doc.id, title);
        } else if (colName === "banners") {
          addReference(getStoragePathFromUrl(record.imageUrl), colName, doc.id, title);
        }
      });
    }

    // ---------------------------------------------------------
    // 4. PERFORM RECONCILIATION
    // ---------------------------------------------------------
    const mediaMismatches: any[] = [];
    const contentMismatches: any[] = [];

    // A. Detect Orphan Storage Media & Duplicate Storage Media
    const md5Map = new Map<string, string[]>();
    const nameMap = new Map<string, string[]>();

    for (const [filePath, fileInfo] of storageFilesMap.entries()) {
      // Orphan check
      const refs = mediaPathReferences.get(filePath);
      if (!refs || refs.length === 0) {
        mediaMismatches.push({
          path: filePath,
          name: fileInfo.name,
          contentType: fileInfo.contentType,
          sizeBytes: fileInfo.sizeBytes,
          updatedAt: fileInfo.updatedAt,
          type: "ORPHAN_MEDIA",
          details: {
            message: "Real storage asset exists but is not linked to any domain content document.",
          },
        });
      }

      // Duplicate MD5 check
      if (fileInfo.md5Hash) {
        if (!md5Map.has(fileInfo.md5Hash)) {
          md5Map.set(fileInfo.md5Hash, []);
        }
        md5Map.get(fileInfo.md5Hash)!.push(filePath);
      }

      // Duplicate Name check
      if (fileInfo.name) {
        if (!nameMap.has(fileInfo.name)) {
          nameMap.set(fileInfo.name, []);
        }
        nameMap.get(fileInfo.name)!.push(filePath);
      }
    }

    // Record MD5 duplicates
    for (const [hash, paths] of md5Map.entries()) {
      if (paths.length > 1) {
        paths.forEach((path) => {
          mediaMismatches.push({
            path,
            name: path.split("/").pop() || "",
            type: "DUPLICATE_MEDIA",
            details: {
              duplicateReason: "MD5 checksum hash collision",
              hash,
              matchingPaths: paths.filter((p) => p !== path),
            },
          });
        });
      }
    }

    // B. Detect Missing Media References, Broken Content, & Duplicate Content Linking
    for (const record of contentRecords) {
      const col = record.collection;
      const docId = record.id;
      const data = record.data;
      const title = data.title || data.quote || data.name || docId;

      const brokenReasons: string[] = [];

      // Validation invariants per entity type
      if (col === "audio") {
        if (!data.title) brokenReasons.push("Missing 'title'");
        if (!data.artist) brokenReasons.push("Missing 'artist'");
        if (!data.category) brokenReasons.push("Missing 'category'");
        if (!data.durationSeconds && !data.duration) brokenReasons.push("Missing audio playback duration metadata");
        if (!data.storagePath && !data.audioUrl) brokenReasons.push("Missing media content file reference ('storagePath' or 'audioUrl')");
      } else if (col === "stuti_vinati") {
        if (!data.title) brokenReasons.push("Missing 'title'");
        if (!data.lyrics) brokenReasons.push("Missing 'lyrics'");
        if (!data.type) brokenReasons.push("Missing 'type' ('morning' or 'evening')");
      } else if (col === "books") {
        if (!data.title) brokenReasons.push("Missing 'title'");
        if (!data.author) brokenReasons.push("Missing 'author'");
        if (!data.category) brokenReasons.push("Missing 'category'");
        if (!data.storagePath && !data.pdfUrl) brokenReasons.push("Missing PDF content file reference ('storagePath' or 'pdfUrl')");
      } else if (col === "banners") {
        if (!data.title) brokenReasons.push("Missing 'title'");
        if (!data.imageUrl) brokenReasons.push("Missing image link ('imageUrl')");
      }

      if (brokenReasons.length > 0) {
        contentMismatches.push({
          collection: col,
          id: docId,
          title,
          type: "BROKEN_CONTENT",
          details: {
            reasons: brokenReasons,
            status: data.status || "unpublished",
          },
        });
      }

      // Check storage path references
      const pathsToCheck: string[] = [];
      const addPathCheck = (urlOrPath: string | null | undefined) => {
        if (!urlOrPath) return;
        const storagePath = urlOrPath.includes("firebasestorage.googleapis.com")
          ? getStoragePathFromUrl(urlOrPath)
          : urlOrPath;
        if (storagePath) pathsToCheck.push(storagePath);
      };

      if (col === "audio") {
        addPathCheck(data.storagePath);
        addPathCheck(data.audioUrl);
      } else if (col === "stuti_vinati") {
        addPathCheck(data.storagePath);
        addPathCheck(data.audioUrl);
      } else if (col === "books") {
        addPathCheck(data.storagePath);
        addPathCheck(data.pdfUrl);
        addPathCheck(data.coverUrl);
      } else if (col === "banners") {
        addPathCheck(data.imageUrl);
      }

      const verifiedPaths = new Set(pathsToCheck);
      for (const storagePath of verifiedPaths) {
        // Missing Media reference check
        if (!storageFilesMap.has(storagePath)) {
          contentMismatches.push({
            collection: col,
            id: docId,
            title,
            type: "MISSING_MEDIA",
            details: {
              brokenPath: storagePath,
              status: data.status || "unpublished",
              message: "Domain document references a file path that does not exist in Firebase Storage.",
            },
          });
        }

        // Duplicate Content reference check (two domain documents referencing same storage file)
        const refs = mediaPathReferences.get(storagePath);
        if (refs && refs.length > 1) {
          const duplicateRefs = refs.filter((r) => r.id !== docId);
          contentMismatches.push({
            collection: col,
            id: docId,
            title,
            type: "DUPLICATE_CONTENT",
            details: {
              sharedPath: storagePath,
              matchingDocuments: duplicateRefs,
            },
          });
        }
      }
    }

    // ---------------------------------------------------------
    // 5. AUDIT & RESPONSE
    // ---------------------------------------------------------
    await writeAuditLog("RECONCILE_SYSTEM_COMPLETED", callerUid, {
      totalUserMismatches: userMismatches.length,
      totalMediaMismatches: mediaMismatches.length,
      totalContentMismatches: contentMismatches.length,
    });

    return {
      status: "success",
      data: {
        users: userMismatches,
        media: mediaMismatches,
        content: contentMismatches,
        storageFiles: Array.from(storageFilesMap.values()),
        mediaPathReferences: Object.fromEntries(mediaPathReferences),
        metrics: {
          totalUsersScanned: allUids.size,
          totalStorageObjectsScanned: storageFilesMap.size,
          totalContentRecordsScanned: contentRecords.length,
        },
      },
    };
  } catch (err: any) {
    functions.logger.error("System reconciliation failed:", err);
    throw new functions.https.HttpsError("internal", err?.message ?? "System reconciliation failed.");
  }
});
