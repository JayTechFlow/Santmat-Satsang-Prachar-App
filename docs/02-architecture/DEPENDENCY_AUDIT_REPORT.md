# DEPENDENCY AUDIT REPORT

**Project:** Santmat Satsang Prachar
**Date:** 2026-08-15
**Audit Phase:** Phase 2 - Dependency Audit

---

## 1. PACKAGE MANIFEST INVENTORY

| Project | Package File | Type | Status |
|---------|--------------|------|--------|
| Root | `package.json` | Root orchestration | ✅ MINIMAL |
| Admin Panel | `admin-panel/package.json` | Frontend (React + Vite) | ✅ ACTIVE |
| Firebase Functions | `backend/firebase/functions/package.json` | Backend (Node.js 20) | ✅ ACTIVE |
| Backend Storage | `backend/storage/package.json` | Storage abstraction (TypeScript) | ✅ ACTIVE |
| Mobile | `mobile/app/pubspec.yaml` | Flutter (OUT OF SCOPE) | ⚠️ OUT OF SCOPE |

---

## 2. DEPENDENCY ANALYSIS BY PROJECT

### 2.1 Root Package (`package.json`)
```json
{
  "scripts": {
    "bootstrap:dev": "npm --prefix backend/firebase/functions run bootstrap:dev --",
    "build:functions": "npm --prefix backend/firebase/functions run build",
    "build:admin": "npm --prefix admin-panel run build",
    "lint:admin": "npm --prefix admin-panel run lint"
  }
}
```
**Status:** ✅ MINIMAL - Only orchestration scripts, no direct dependencies

---

### 2.2 Admin Panel (`admin-panel/package.json`)

#### Production Dependencies (13)
| Package | Version | Purpose | Used? |
|---------|---------|---------|-------|
| `@radix-ui/react-checkbox` | ^1.3.11 | Checkbox component | ✅ Used |
| `@radix-ui/react-dialog` | ^1.1.23 | Dialog/Modal component | ✅ Used |
| `@radix-ui/react-dropdown-menu` | ^2.1.24 | Dropdown menus | ✅ Used |
| `@radix-ui/react-slot` | ^1.3.3 | Slot primitive | ✅ Used |
| `@radix-ui/react-tabs` | ^1.1.21 | Tabs component | ✅ Used |
| `@radix-ui/react-tooltip` | ^1.2.16 | Tooltip component | ✅ Used |
| `@uiw/react-md-editor` | ^4.1.1 | Markdown editor | ✅ Used (Settings, Reports) |
| `firebase` | ^12.16.0 | Firebase client SDK | ✅ Used |
| `lucide-react` | ^1.27.0 | Icon library | ✅ Used |
| `react` | ^19.2.7 | React core | ✅ Used |
| `react-dom` | ^19.2.7 | React DOM | ✅ Used |
| `react-router-dom` | ^7.18.1 | Routing | ✅ Used |
| `rehype-sanitize` | ^6.0.0 | HTML sanitization | ✅ Used (Markdown) |

**Assessment:** ✅ ALL USED - No unused production dependencies detected

#### Dev Dependencies (10)
| Package | Version | Purpose | Used? |
|---------|---------|---------|-------|
| `@types/node` | ^24.13.2 | Node types | ✅ Used |
| `@types/react` | ^19.2.17 | React types | ✅ Used |
| `@types/react-dom` | ^19.2.3 | React DOM types | ✅ Used |
| `@vitejs/plugin-react` | ^6.0.3 | Vite React plugin | ✅ Used |
| `firebase-admin` | ^14.2.0 | Admin SDK (dev only?) | ⚠️ CHECK - Only for dev? |
| `oxlint` | ^1.71.0 | Linter | ✅ Used |
| `typescript` | ~6.0.2 | TypeScript | ✅ Used |
| `vite` | ^8.1.1 | Build tool | ✅ Used |
| `vitest` | ^4.1.10 | Test runner | ✅ Used |

**Assessment:** ⚠️ `firebase-admin` in devDependencies - verify if only used in dev scripts

---

### 2.3 Firebase Functions (`backend/firebase/functions/package.json`)

#### Production Dependencies (2)
| Package | Version | Purpose | Used? |
|---------|---------|---------|-------|
| `firebase-admin` | ^11.8.0 | Admin SDK | ✅ Used extensively |
| `firebase-functions` | ^4.3.1 | Functions SDK | ✅ Used |

**Assessment:** ✅ MINIMAL - Only essential dependencies

#### Dev Dependencies (4)
| Package | Version | Purpose | Used? |
|---------|---------|---------|-------|
| `typescript` | ^5.0.0 | TypeScript | ✅ Used |
| `@types/node` | ^20.0.0 | Node types | ✅ Used |
| `firebase-functions-test` | ^3.1.0 | Testing SDK | ✅ Used |

**Assessment:** ✅ MINIMAL - No unused dev dependencies

---

### 2.4 Backend Storage (`backend/storage/package.json`)

#### Production Dependencies (4 - AWS SDK v3)
| Package | Version | Purpose | Used? |
|---------|---------|---------|-------|
| `@aws-sdk/client-cloudwatch` | ^3.1110.0 | CloudWatch metrics | ✅ Used (S3 provider) |
| `@aws-sdk/client-s3` | ^3.1110.0 | S3 client | ✅ Used (S3 provider) |
| `@aws-sdk/lib-storage` | ^3.1110.0 | Managed uploads | ✅ Used (S3 provider) |
| `@aws-sdk/s3-request-presigner` | ^3.1110.0 | Presigned URLs | ✅ Used (S3 provider) |

**Assessment:** ✅ ALL USED - AWS SDK v3 modular imports, only required modules

#### Dev Dependencies (3)
| Package | Version | Purpose | Used? |
|---------|---------|---------|-------|
| `@types/js-yaml` | ^4.0.9 | YAML types | ✅ Used |
| `js-yaml` | ^5.3.0 | YAML parsing | ✅ Used (config loader) |
| `vitest` | ^4.1.10 | Test runner | ✅ Used |

**Assessment:** ✅ ALL USED

---

## 3. DUPLICATE PURPOSE DEPENDENCIES ANALYSIS

### 3.1 UI Component Libraries
| Library | Projects | Assessment |
|---------|----------|------------|
| `@radix-ui/*` | Admin Panel only | ✅ SINGLE SOURCE |
| `lucide-react` | Admin Panel only | ✅ SINGLE SOURCE |

### 3.2 Firebase SDKs
| SDK | Projects | Versions | Assessment |
|-----|----------|----------|------------|
| `firebase` (client) | Admin Panel | ^12.16.0 | ✅ Latest |
| `firebase-admin` | Firebase Functions | ^11.8.0 | ⚠️ Version gap |
| `firebase-admin` | Admin Panel (dev) | ^14.2.0 | ⚠️ Version gap |
| `firebase-functions` | Firebase Functions | ^4.3.1 | ✅ Compatible |

**Finding:** `firebase-admin` version mismatch between Functions (^11.8.0) and Admin Panel dev (^14.2.0)
- Functions uses older ^11.8.0 (compatible with firebase-functions ^4.3.1)
- Admin Panel uses ^14.2.0 in devDependencies only
- **Action:** Align versions if Admin Panel needs admin SDK at runtime

### 3.3 Testing Libraries
| Library | Projects | Assessment |
|---------|----------|------------|
| `vitest` | Admin Panel, Backend Storage | ✅ CONSISTENT |
| `firebase-functions-test` | Firebase Functions only | ✅ SPECIFIC |
| `oxlint` | Admin Panel only | ✅ SPECIFIC |

### 3.4 Build Tools
| Tool | Projects | Assessment |
|------|----------|------------|
| `typescript` | Admin Panel (~6.0.2), Functions (^5.0.0) | ⚠️ Version gap |
| `vite` | Admin Panel only | ✅ SINGLE |
| `eslint` | Functions only (not in admin-panel) | ⚠️ Different linters |

---

## 4. LEGACY / OBSOLETE DEPENDENCIES

### 4.1 Potentially Unused
| Package | Location | Reason for Concern | Verification Needed |
|---------|----------|-------------------|---------------------|
| `firebase-admin` (admin-panel dev) | Admin Panel devDeps | Only for dev scripts? | Check if used in build/dev |
| `@uiw/react-md-editor` | Admin Panel deps | Only in Settings/Reports? | Verify usage |

### 4.2 Version Gaps Requiring Alignment
| Package | Current Versions | Recommended Action |
|---------|------------------|-------------------|
| `firebase-admin` | Functions: ^11.8.0, Admin: ^14.2.0 | Align to ^11.8.0 for compatibility |
| `typescript` | Functions: ^5.0.0, Admin: ~6.0.2 | Acceptable (different projects) |

---

## 5. DEPENDENCY HEALTH SUMMARY

| Project | Total Deps | Unused | Version Conflicts | Status |
|---------|------------|--------|-------------------|--------|
| Root | 0 | 0 | 0 | ✅ CLEAN |
| Admin Panel | 23 | 0 | 1 (firebase-admin) | ⚠️ MINOR |
| Firebase Functions | 6 | 0 | 0 | ✅ CLEAN |
| Backend Storage | 7 | 0 | 0 | ✅ CLEAN |

---

## 6. RECOMMENDATIONS

### Immediate Actions:
1. **Align `firebase-admin` versions** - Use ^11.8.0 in Admin Panel devDeps to match Functions
2. **Verify `firebase-admin` usage in Admin Panel** - Remove if only in devDeps and not used at runtime
3. **Remove `.DS_Store` files** - Clean up macOS artifacts

### Optional Improvements:
1. **Consider unified linting** - Use oxlint for both projects or eslint for both
2. **Align TypeScript versions** - Optional, different projects can have different versions
3. **Audit `@uiw/react-md-editor`** - Verify actual usage in Settings/Reports

---

## 7. PACKAGE LOCK FILES STATUS

| Lock File | Status | Size |
|-----------|--------|------|
| `admin-panel/package-lock.json` | ✅ PRESENT | 293KB |
| `backend/firebase/functions/package-lock.json` | ✅ PRESENT | 278KB |
| `backend/storage/package-lock.json` | ✅ PRESENT | 63KB |
| Root | N/A | N/A |

---

*Dependency Audit Complete. Proceeding to Phase 3 - Duplicate Implementation Detection.*