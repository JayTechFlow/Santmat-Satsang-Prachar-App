# Media Platform Security
**Sprint M1 — Foundation**

## Principles

- **Least Privilege**: Every role gets only what it needs.
- **Defense in Depth**: Security enforced at Storage Rules, Firestore Rules, Cloud Functions, and frontend RBAC.
- **No Trust by Default**: All uploads validate MIME, extension, size, and magic bytes.

## Roles & Storage Permissions

| Role | Audio | Images/Banners | Books/PDFs | Videos | Avatars | Exports | Processing | Backups |
|---|---|---|---|---|---|---|---|---|
| Unauthenticated | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| App User (authenticated) | Read | Read | Read | Read | Own Read | ❌ | ❌ | ❌ |
| Admin | Read/Write | Read/Write | Read/Write | Read/Write | Read | Read/Write | ❌ | ❌ |
| Cloud Function (service account) | All | All | All | All | All | All | All | All |

## Firestore Media Collection Rules

```
match /media/{mediaId} {
  // Authenticated users can read non-admin-only assets
  allow read: if isAuthenticated() &&
    (resource.data.visibility != 'admin_only' || isAdmin());
  // Only admins can create, update, delete
  allow create, update, delete: if isAdmin();
}
```

## Upload Security Checklist

- [x] MIME type validated against allowed list per MediaType
- [x] File extension validated
- [x] File size validated (enforced client-side + Storage Rules)
- [x] Magic bytes checked (non-blocking warning)
- [x] Filename sanitized (no special chars)
- [x] RBAC check before upload
- [x] Storage path restricted to allowed folders (Cloud Function)
- [x] Content type restricted (Cloud Function)

## Anti-Patterns Prevented

| Threat | Prevention |
|---|---|
| Malicious file type upload | MIME + extension + magic byte validation |
| Unauthorized upload | RBAC check in pipeline + Storage Rules |
| Path traversal | Path sanitization in pipeline |
| Storage path injection (via signed URL) | Cloud Function allows only approved paths |
| Privilege escalation | Firestore Rules block user from setting admin/role fields |
| Unauthenticated access | All media folders require authentication |
