import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { permissionEngine, createPermissionContext, AuthorizationResult, Role } from "./auth/PermissionEngine";

export const logger = functions.logger;

export const requireAuth = (context: functions.https.CallableContext) => {
    if (!context.auth) {
        logger.warn("Unauthenticated function call attempt", { app: context.app?.appId });
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    // Suspension enforcement (Phase 8): a suspended account must not reach
    // any protected callable, regardless of role.
    if (context.auth.token.accountStatus === "suspended") {
        logger.warn("Suspended account denied", { uid: context.auth.uid });
        throw new functions.https.HttpsError(
            "permission-denied",
            "Account is suspended."
        );
    }

    // App Check (Phase 9 / Phase 20 — controlled rollout):
    // AUDIT mode (default): missing tokens are logged but allowed, so
    //   development and existing clients keep working.
    // ENFORCE mode: set environment variable ENFORCE_APP_CHECK=true to hard-fail
    //   requests without a valid App Check token. Only enable after telemetry
    //   shows real clients send tokens.
    if (context.app == undefined) {
        if (process.env.ENFORCE_APP_CHECK === "true") {
            logger.warn("App Check enforcement rejected request", { uid: context.auth.uid });
            throw new functions.https.HttpsError(
                "failed-precondition",
                "App Check verification failed."
            );
        }
        logger.warn("Request missing App Check token", { uid: context.auth.uid });
    }
};
export const requirePermission = (permissionId: string) => {
    return (context: functions.https.CallableContext): AuthorizationResult => {
        const permContext = createPermissionContext(context);
        return permissionEngine.authorize(permContext, permissionId);
    };
};

export const requireRole = (...allowedRoles: Role[]) => {
    return (context: functions.https.CallableContext): AuthorizationResult => {
        const permContext = createPermissionContext(context);
        if (!allowedRoles.includes(permContext.role)) {
            return { 
                allowed: false, 
                reason: `Role ${permContext.role} not authorized. Required: ${allowedRoles.join(', ')}`, 
                userRole: permContext.role 
            };
        }
        if (permContext.accountStatus === 'suspended') {
            return { allowed: false, reason: 'Account is suspended', userRole: permContext.role };
        }
        return { allowed: true, userRole: permContext.role };
    };
};

export const requireFeature = (featureId: string) => {
    return (context: functions.https.CallableContext): AuthorizationResult => {
        const permContext = createPermissionContext(context);
        if (!permissionEngine.isFeatureEnabled(featureId, permContext.role)) {
            return { 
                allowed: false, 
                reason: `Feature not enabled: ${featureId}`, 
                userRole: permContext.role 
            };
        }
        return { allowed: true, userRole: permContext.role };
    };
};

// Backward compatibility - use permission-based checks
export const requireAdmin = (context: functions.https.CallableContext) => {
    // Explicit auth gate first so unauthenticated callers receive
    // "unauthenticated" (not a role-based "permission-denied").
    requireAuth(context);
    const result = requireRole('developer_super_admin', 'client_super_admin')(context);
    if (!result.allowed) {
        throw new functions.https.HttpsError("permission-denied", result.reason || "Admin privileges required.");
    }
};

export const requireDeveloperSuperAdmin = (context: functions.https.CallableContext) => {
    const result = requireRole('developer_super_admin')(context);
    if (!result.allowed) {
        throw new functions.https.HttpsError("permission-denied", result.reason || "Developer Super Admin privileges required.");
    }
};

export const getDb = (): admin.firestore.Firestore => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    return admin.firestore();
};

export const db = new Proxy({} as admin.firestore.Firestore, {
    get(_target, prop) {
        const instance = getDb() as any;
        const value = instance[prop];
        return typeof value === "function" ? value.bind(instance) : value;
    },
});

// Enterprise Security: Input Validation & Sanitization
// Validates at input boundary, encodes at output boundary

/**
 * Sanitize input for safe storage in Firestore
 * Removes control characters and normalizes Unicode
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove control characters except newline and tab
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .normalize('NFC');
};

/**
 * HTML escape for safe output in HTML contexts
 * Use when rendering user input in HTML
 */
export const escapeHtml = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/&/g, '\u0026')
    .replace(/</g, '\u003C')
    .replace(/>/g, '\u003E')
    .replace(/"/g, '\u0022')
    .replace(/'/g, '\u0027')
    .replace(/\//g, '\u002F');
};

/**
 * Validate and sanitize a string for use as a Firestore field value
 * Enforces length limits and character restrictions
 */
export const validateFirestoreString = (input: string, maxLength = 1000): string => {
  const sanitized = sanitizeInput(input);
  if (sanitized.length > maxLength) {
    throw new Error(`String exceeds maximum length of ${maxLength} characters`);
  }
  return sanitized;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate UUID format
 */
export const validateUuid = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validate alphanumeric with underscores and hyphens (for IDs)
 */
export const validateId = (id: string, maxLength = 200): boolean => {
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  return idRegex.test(id) && id.length <= maxLength;
};

// Enterprise Observability: Write to an Audit collection
export const writeAuditLog = async (action: string, uid: string, details: any) => {
    try {
        await db.collection("audit_logs").add({
            action,
            uid,
            details,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        logger.error("Failed to write audit log", { action, uid, error });
    }
};

// Derive the canonical thumbnail storage path for a media file.
// Shared by storage_triggers and queue_triggers to avoid drift.
export const getThumbnailPath = (storagePath: string, fallbackFileName = "media.jpg"): string => {
    const parts = storagePath.split("/");
    const fileName = parts.pop() || fallbackFileName;
    const folder = parts.join("/");
    return folder ? `${folder}/thumbnails/thumb_${fileName}` : `thumbnails/thumb_${fileName}`;
};

// Enterprise Optimization: Safely chunk massive batched writes (Firestore limit is 500)
export const chunkedBatchCommit = async (
    items: any[],
    operation: (batch: admin.firestore.WriteBatch, item: any) => void
) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += 450) {
        chunks.push(items.slice(i, i + 450));
    }
    
    for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach(item => operation(batch, item));
        await batch.commit();
    }
};
