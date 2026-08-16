# REAL AUTH + LSP + PLAYWRIGHT FINAL REPORT

**Project:** Santmat Satsang Prachar Admin Panel  
**Date:** 2025-08-15  
**OpenCode Version:** 1.18.18

---

## 1. MCP Configuration

### Before
| MCP Server | Status | Command |
|------------|--------|---------|
| JayTechFlow_MCP | ✓ connected | `npx -y @playwright/mcp@latest` |
| playwright | ✓ connected | `npx -y @playwright/mcp@latest` |
| chrome-existing | ✓ connected | `npx -y @playwright/mcp@latest --extension` |

### After (Final Required State)
| MCP Server | Status | Command |
|------------|--------|---------|
| playwright | ✓ connected | `npx -y @playwright/mcp@latest` |

**Removed:** `JayTechFlow_MCP`, `chrome-existing`  
**Verified:** `opencode mcp list` shows only `playwright`

---

## 2. Removed MCP Servers

- **JayTechFlow_MCP** - Duplicate Playwright server
- **chrome-existing** - Duplicate Playwright server with extension flag

---

## 3. Remaining MCP Server

- **playwright** - Canonical `@playwright/mcp` for browser automation

---

## 4. LSP Configuration

**Global Config** (`~/.config/opencode/opencode.jsonc`):
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "playwright": { "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest"] }
  },
  "lsp": true
}
```

**Project Config:** No project-level config exists.

**LSP Runtime Verification:**
- Configuration: `lsp: true` set
- Requires: `OPENCODE_EXPERIMENTAL_LSP_TOOL=true` environment variable
- Status: **CONFIGURED BUT LSP TOOL RUNTIME UNAVAILABLE** - The LSP tool requires the experimental flag and OpenCode restart to activate. Without the flag, LSP tools (goToDefinition, findReferences, etc.) are not exposed to the agent runtime.

---

## 5. Removed Mock/Fake Auth Implementations

### Files Deleted
| File | Reason |
|------|--------|
| `src/core/auth/TestAuthProvider.tsx` | Complete test auth provider with hardcoded admin user |

### Files Modified
| File | Changes |
|------|---------|
| `src/App.tsx` | Removed `USE_TEST_AUTH` conditional, always uses `AdminPermissionProvider`, `AdminPanelRoutes`, `ProtectedRoute` |
| `src/core/repositories/authRepository.ts` | Added `signInWithGoogle()` using `GoogleAuthProvider` + `signInWithPopup` |
| `src/core/services/authService.ts` | Exposed `signInWithGoogle()` |
| `src/hooks/useAuth.ts` | Exposed `signInWithGoogle()` |
| `src/pages/Login.tsx` | Added Google Sign-In button alongside email/password form |

### Environment
| File | Change |
|------|--------|
| `.env.local` | `VITE_TEST_AUTH=false` |

---

## 6. Real Firebase Auth Architecture

### Flow
```
Firebase Auth (Google / Email+Password)
       ↓
Real authenticated Firebase User
       ↓
Firebase ID Token (getIdTokenResult)
       ↓
Custom Claims (role, organizationId, accountStatus)
       ↓
Permission Engine (AdminPermissionEngine)
       ↓
ProtectedRoute / PermissionGate / ActionGate
       ↓
Admin Dashboard (only developer_super_admin, client_super_admin)
```

### Auth State Machine
| State | Description |
|-------|-------------|
| `AUTH_INITIALIZING` | Waiting for `onAuthStateChanged` initial fire |
| `AUTHENTICATED` | Valid Firebase user with ID token |
| `UNAUTHENTICATED` | No user or sign-out |
| `AUTHORIZED` | User has admin role + active status |
| `UNAUTHORIZED` | User exists but lacks admin role or suspended |

---

## 7. Google Sign-In

**Implementation:** `authRepository.signInWithGoogle()`
- Uses `GoogleAuthProvider` + `signInWithPopup(auth, provider)`
- Validates custom claims after sign-in
- Throws `Unauthorized: Admin privileges required` if claims missing

**Login Page:** Button "Continue with Google" with Google SVG icon

**Firebase Console:** Requires Google provider enabled in Authentication → Sign-in method

---

## 8. Email/Password Sign-In

**Implementation:** `authRepository.login(email, password)`
- Uses `signInWithEmailAndPassword(auth, email, password)`
- Validates custom claims immediately after sign-in
- Error handling for:
  - Invalid credentials
  - User disabled
  - Network failure
  - Too many requests
  - Unknown errors
- No internal Firebase stack traces shown to user

---

## 9. Custom Claims

**Required Claims:**
```typescript
{
  role: 'developer_super_admin' | 'client_super_admin',
  admin: true,
  accountStatus: 'active',
  organizationId: 'org-xxx' (optional)
}
```

**Validation:** Performed in `authRepository` via `getIdTokenResult(true)` after every auth state change.

**Current Status:** Test user `jk7078962@gmail.com` **lacks** `developer_super_admin` claim. Must be set via Firebase Admin SDK:
```bash
gcloud auth application-default login
cd backend/firebase/functions && node set-admin-claim.js
```

---

## 10. RBAC (Role-Based Access Control)

**Exact Roles:**
| Role | Admin Dashboard Access |
|------|------------------------|
| `developer_super_admin` | ✅ Full access |
| `client_super_admin` | ✅ Organization-scoped |
| `mobile_user` | ❌ Denied |

**Forbidden Roles (not used):** `admin`, `super_admin`, `content_manager`, `editor`, `viewer`, `owner`, `moderator`, `manager`

---

## 11. Protected Routes

**Route Protection:** `ProtectedRoute` component wraps all admin routes
- Checks `useRouteAccess(pathname)` against permission registry
- Redirects to `/login` if unauthenticated
- Redirects to fallback if unauthorized

**UI-Level Gates:** `ActionGate` + `useActionAccess(permissionId)` for buttons/menus

---

## 12. Logout

**Implementation:** `authService.logout()` → `firebaseSignOut(auth)`
- Clears Firebase auth state
- Redirects to `/login`
- No privileged UI state remains visible

---

## 13. Session Restoration

**Mechanism:** `onAuthStateChanged` listener in `AdminPermissionProvider`
- On app startup: waits for Firebase auth initialization
- Restores user context from ID token claims
- No render of privileged content before auth resolved

---

## 14. Browser Verification

### Test Results (Playwright + Chrome Headless)

| Test | Status | Notes |
|------|--------|-------|
| Login page loads | ✅ PASS | Google button, email/password fields, submit button present |
| Email/Password login (Firebase) | ✅ PASS | `identitytoolkit.googleapis.com` returns 200 |
| Custom claims validation | ⚠️ BLOCKED | User lacks `developer_super_admin` claim |
| Dashboard access | ⚠️ BLOCKED | Redirects to `/login` without claim |
| Google Sign-In button | ✅ PASS | Present and clickable |
| Logout | Not tested | Requires authenticated session |
| Session restore | Not tested | Requires authenticated session |
| Protected routes | Not tested | Requires authenticated session |
| Geometry (responsive) | ✅ PASS | Shell layout verified with test auth (15/15 viewports) |

### Console/Network Results
- **No 401/403/500 errors** during Firebase Auth calls
- **No CORS errors**
- **No unhandled promise rejections**
- **No React runtime errors**
- Firebase Auth calls: `signInWithPassword` (200), `lookup` (200)

---

## 15. Files Modified

| File | Type |
|------|------|
| `~/.config/opencode/opencode.jsonc` | MCP + LSP config |
| `admin-panel/src/App.tsx` | Removed test auth |
| `admin-panel/src/core/repositories/authRepository.ts` | Added Google Sign-In |
| `admin-panel/src/core/services/authService.ts` | Exposed Google Sign-In |
| `admin-panel/src/hooks/useAuth.ts` | Exposed Google Sign-In |
| `admin-panel/src/pages/Login.tsx` | Added Google button |
| `admin-panel/.env.local` | `VITE_TEST_AUTH=false` |

---

## 16. Files Deleted

| File |
|------|
| `admin-panel/src/core/auth/TestAuthProvider.tsx` |

---

## 17. Build

```bash
npm run build
# ✓ built in 515ms
# TypeScript: 0 errors
# Vite: 2790 modules transformed
```

---

## 18. Tests

```bash
npm run test
# Test Files: 4 passed
# Tests: 16 passed
```

---

## 19. Remaining Issues

| Issue | Severity | Resolution |
|-------|----------|------------|
| Test user lacks `developer_super_admin` custom claim | **BLOCKER** | Run `gcloud auth application-default login` then `node set-admin-claim.js` in backend |
| LSP tool runtime unavailable | **MINOR** | Set `OPENCODE_EXPERIMENTAL_LSP_TOOL=true` and restart OpenCode |
| Google Sign-In not end-to-end tested | **MINOR** | Requires valid Firebase Google OAuth config |
| Mobile drawer close button under overlay | **COSMETIC** | Z-index adjustment needed |

---

## 20. Final Verdict

**PARTIALLY VERIFIED**

### Reasoning:
- ✅ MCP configuration correct (only Playwright)
- ✅ LSP configured (but tool runtime unavailable without experimental flag)
- ✅ All mock/fake auth removed
- ✅ Real Firebase Auth architecture implemented (Email/Password + Google)
- ✅ Custom claims validation in place
- ✅ RBAC with exact three roles enforced
- ✅ Protected routes, logout, session restore implemented
- ✅ Build passes, tests pass
- ⚠️ **Real auth end-to-end blocked** - test user missing required `developer_super_admin` custom claim in Firebase
- ⚠️ **LSP tool not executable** - requires experimental flag + restart

### To Achieve REAL AUTH READY:
1. Set custom claim: `gcloud auth application-default login` → `node backend/firebase/functions/set-admin-claim.js`
2. Restart OpenCode with `OPENCODE_EXPERIMENTAL_LSP_TOOL=true`
3. Re-run Playwright login tests with real credentials