# CODEBASE CLEANUP BASELINE INVENTORY

**Project:** Santmat Satsang Prachar
**Date:** 2026-08-15
**Branch:** main
**Audit Phase:** Phase 0-1 Baseline Inventory

---

## 1. REPOSITORY OVERVIEW

**Root Directory:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar`
**Git Branch:** main
**Current Status:** Uncommitted changes present (243 files changed, 15350 insertions, 6551 deletions)

---

## 2. SOURCE DIRECTORY STRUCTURE

### 2.1 Root Level
```
Santmat-Satsang-Prachar/
├── .firebaserc                     # Firebase project config
├── .gitignore
├── firebase.json                   # Firebase project configuration
├── storage.yaml                    # Enterprise storage configuration
├── package.json                    # Root package (minimal)
├── admin-panel/                    # Admin Dashboard (React + Vite)
├── backend/                        # Backend services (TypeScript)
├── firebase/                       # Firebase configuration
├── mobile/                         # Flutter mobile app (OUT OF SCOPE)
├── docs/                           # Documentation
├── scripts/                        # Utility scripts
└── node_modules/                   # Root dependencies
```

---

## 3. BACKEND INVENTORY (`backend/`)

### 3.1 Core Backend Modules (`backend/`)
```
backend/
├── ai/                    # AI/ML services
├── analytics/             # Analytics engine
├── auth/                  # Authentication & RBAC
├── caching/               # Cache layer
├── cdn/                   # CDN integration
├── firebase/              # Firebase Functions (see below)
├── knowledge/             # Knowledge graph
├── media-processing/      # Media processing pipeline
├── notifications/         # Notification services
├── observability/         # Monitoring & logging
├── personalization/       # User personalization
├── playlist/              # Playlist management
├── recommendation/        # Recommendation engine
├── search/                # Search indexing
├── storage/               # Storage abstraction layer (MAJOR)
│   ├── Providers/
│   │   ├── Firebase/         # FirebaseStorageProvider
│   │   ├── S3/               # AmazonS3StorageProvider, S3CompatibleStorageProvider
│   │   ├── Azure/            # AzureBlobStorageProvider
│   │   ├── GCS/              # GoogleCloudStorageProvider
│   │   └── Local/            # LocalStorageProvider
│   ├── Routing/
│   │   ├── StorageRouter.ts          # LEGACY - Simple router
│   │   ├── StorageRouterV2.ts        # ENTERPRISE - Policy-driven router
│   │   └── RoutingStrategies.ts      # Routing strategies
│   ├── Factory/            # ProviderRegistry, StorageProviderFactory
│   ├── Policy/             # StoragePolicyEngine
│   ├── Capabilities/       # Capability discovery
│   ├── Health/             # HealthMonitoringEngine
│   ├── Config/             # StorageConfigLoader
│   ├── Init/               # ProviderInitializer
│   ├── Security/           # StorageSecurityEngine
│   ├── Backup/             # Backup/Recovery
│   ├── Operations/         # StorageOperationsEngine
│   ├── Replication/        # MultiCloudReplicationEngine
│   ├── Interfaces/         # IStorageProvider, IStorageRouter
│   ├── Models/             # StorageModels
│   ├── Capabilities/       # StorageCapabilities
│   ├── Factory/            # ProviderRegistry, StorageProviderFactory
│   ├── Capability/         # CapabilityDiscoveryEngine
│   ├── Health/             # HealthMonitoringEngine
│   ├── Config/             # StorageConfigLoader
│   ├── Init/               # ProviderInitializer
│   └── __tests__/          # Integration tests
├── upload-pipeline/        # Media upload processing
├── functions/              # Utility functions
└── supabase/               # Supabase integration (legacy?)
```

### 3.2 Firebase Functions (`backend/firebase/functions/`)
```
backend/firebase/functions/
├── src/
│   ├── auth.ts                    # Auth callable functions
│   ├── auth/                      # Auth module
│   ├── ai_triggers.ts             # AI triggers
│   ├── analytics.ts               # Analytics functions
│   ├── auth/                      # Auth module (duplicate folder?)
│   ├── bootstrap_cli.ts           # Bootstrap CLI
│   ├── donations.ts               # Donation functions
│   ├── events.ts                  # Event functions
│   ├── firestore_triggers.ts      # Firestore triggers
│   ├── graph.ts                   # Knowledge graph functions
│   ├── iam.ts                     # IAM functions (incl. test fixtures)
│   ├── index.ts                   # Main exports
│   ├── media.ts                   # Media functions
│   ├── notification_scheduler.ts  # Notification scheduler
│   ├── notifications.ts           # Notification functions
│   ├── observability.ts           # Observability functions
│   ├── profile.ts                 # Profile functions
│   ├── queue_triggers.ts          # Queue triggers
│   ├── recommendations.ts         # Recommendation functions
│   ├── search.ts                  # Search functions
│   ├── storage_triggers.ts        # Storage triggers
│   ├── search.ts                  # Search functions (duplicate name)
│   ├── trending.ts                # Trending functions
│   ├── upload_pipeline.ts         # Upload pipeline functions
│   ├── utils.ts                   # Utilities
│   └── utils.ts (in auth folder?) # Duplicate utils?
├── lib/                           # Compiled output
├── test/                          # Unit tests
└── lib_test/                      # Compiled test output
```

### 3.3 Key Backend Duplicates Identified

| Area | Duplicate A | Duplicate B | Status |
|------|-------------|-------------|--------|
| **Storage Router** | `StorageRouter.ts` (legacy, simple) | `StorageRouterV2.ts` (enterprise) | **DUPLICATE** |
| **Storage Router Export** | `StorageRouter` exported from `backend/storage/index.ts` | `StorageRouterV2` NOT exported | **INCONSISTENT** |
| **Auth Module** | `src/auth.ts` | `src/auth/` folder | **DUPLICATE** |
| **Search Functions** | `search.ts` | `search.ts` (same name, different?) | **CHECK NEEDED** |
| **Utils** | `utils.ts` (root) | `auth/utils.ts` | **CHECK NEEDED** |
| **Test Fixtures** | `createTestFixtures` (callable) | `createTestFixturesHttp` (HTTP) | **TEMPORARY - NEEDS REMOVAL** |

---

## 4. ADMIN PANEL INVENTORY (`admin-panel/`)

### 4.1 Structure
```
admin-panel/
├── src/
│   ├── components/
│   │   ├── ui/                    # 36 UI components
│   │   ├── header/                # Header components
│   │   ├── navigation/            # Navigation components
│   │   ├── search/                # Search components
│   │   └── (modal components)     # Media modals, dashboards
│   ├── core/
│   │   ├── auth/                  # Auth context/guards
│   │   ├── hooks/                 # Custom hooks (useCrud, useList)
│   │   ├── media/                 # Media service
│   │   ├── repositories/          # Auth repository
│   │   └── services/              # Media service
│   ├── features/                  # Feature modules (18)
│   │   ├── ai-analytics/
│   │   ├── banners/
│   │   ├── bhajans/
│   │   ├── books/
│   │   ├── categories/
│   │   ├── dashboard/
│   │   ├── notifications/
│   │   ├── observability/
│   │   ├── playlist/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── stuti-vinati/
│   │   ├── support/
│   │   ├── suvichar/
│   │   └── users/
│   ├── hooks/                     # Global hooks
│   ├── pages/                     # 19 page components
│   │   ├── Audio.tsx
│   │   ├── Banners.tsx
│   │   ├── Books.tsx
│   │   ├── Categories.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MediaLibrary.tsx       # Enterprise Media Library
│   │   ├── Notifications.tsx
│   │   ├── Playlist.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   ├── StutiVinati.tsx
│   │   ├── Support.tsx
│   │   ├── Suvichar.tsx
│   │   └── Users.tsx
│   ├── utils/                     # Utility functions
│   ├── firebase/                  # Firebase config
│   ├── design/                    # DELETED - Design system files
│   ├── hooks/                     # Global hooks
│   └── utils/                     # Utility functions
├── dist/                          # Build output
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig files
```

### 4.2 Admin Panel Duplicates Identified

| Component Type | Duplicates Found |
|----------------|------------------|
| **Media Upload** | `MediaUploadModal.tsx`, `ImageUpload.tsx`, `AudioUpload.tsx`, `FileUpload.tsx`, `PDFUpload.tsx`, `MediaPicker.tsx` |
| **Media Preview** | `MediaPreviewModal.tsx`, `PrayerPreview.tsx` |
| **Dashboards** | `OperationsDashboardModal.tsx`, `PerformanceDashboardModal.tsx`, `QueueDashboardModal.tsx`, `StorageDashboardModal.tsx` |
| **Modals** | `Modal.tsx`, `Dialog.tsx`, `ConfirmDialog.tsx` |
| **Tables** | `DataTable.tsx` (main), other table implementations in features |
| **Forms** | Multiple form implementations across features |
| **Empty States** | `EmptyState.tsx`, `ComingSoon.tsx`, `ErrorState.tsx`, `LoadingState.tsx` |
| **Design System** | `design/` folder DELETED but CSS in `index.css` |

---

## 5. FIREBASE CONFIGURATION (`firebase/`)

```
firebase/
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
└── functions/              # Empty? (see backend/firebase/functions)
```

---

## 6. DOCUMENTATION (`docs/`)

```
docs/
├── 02-architecture/
│   ├── ARCHITECTURE.md
│   ├── ARCHITECTURE_CONTRACT.md
│   ├── BACKEND_PRODUCTION_DEPLOYMENT_REPORT.md
│   ├── BACKEND_RED_TEAM_SECURITY_AUDIT.md
│   ├── BACKEND_STORAGE_AUDIT.md
│   BACKEND_STORAGE_EXECUTION_REPORT.md
│   CODEBASE_CLEANUP_BASELINE.md   ← THIS FILE
│   ... (20+ more docs)
```

---

## 7. TEMPORARY / TEST ARTIFACTS IDENTIFIED

| File/Function | Type | Purpose | Action Needed |
|---------------|------|---------|---------------|
| `createTestFixtures` (callable) | Cloud Function | Test fixture creation | **REMOVE** - Temporary |
| `createTestFixturesHttp` (HTTP) | Cloud Function | Test fixture HTTP endpoint | **REMOVE** - Temporary |
| `createTestFixtures` export | Export in `index.ts` | Exported for testing | **REMOVE** |
| `createTestFixturesHttp` export | Export in `index.ts` | Exported for testing | **REMOVE** |
| `fix_auth.cjs` | Admin panel script | Auth fix script | **REVIEW** |
| `migration_audit.py` | Admin panel script | Migration audit | **REVIEW** |
| `stress_test.py` | Admin panel script | Stress test | **REVIEW** |
| `audit.py` / `audit-imports.ts` | Admin panel scripts | Import audit | **REVIEW** |
| `generate_report.py` | Admin panel script | Report generation | **REVIEW** |
| `.DS_Store` files | macOS artifacts | System files | **DELETE** |
| `docs/.DS_Store` | macOS artifact | System file | **DELETE** |

---

## 8. DELETED DESIGN SYSTEM FILES (Admin Panel)

The following design system files were deleted (shown in git status):
- `admin-panel/src/design/colors.ts` - DELETED
- `admin-panel/src/design/index.ts` - DELETED
- `admin-panel/src/design/layout.ts` - DELETED
- `admin-panel/src/design/radius.ts` - DELETED
- `admin-panel/src/design/shadows.ts` - DELETED
- `admin-panel/src/design/spacing.ts` - DELETED
- `admin-panel/src/design/typography.ts` - DELETED
- `admin-panel/src/App.css` - DELETED

**Note:** Design system values may have been migrated to `index.css` (3304 lines added)

---

## 9. MOBILE APP (OUT OF SCOPE)

Mobile app shows significant churn but is **OUT OF SCOPE** per instructions:
- Many files deleted (mock data sources, widgets)
- Many files modified
- Flutter/Dart codebase

---

## 10. SUMMARY OF FINDINGS

### Critical Duplicates Requiring Action:
1. **StorageRouter.ts vs StorageRouterV2.ts** - Two router implementations
2. **Auth module** - `auth.ts` and `auth/` folder
3. **Test fixtures** - Two temporary Cloud Functions exported
4. **Media upload components** - 6+ components for media upload
5. **Dashboard modals** - 4 dashboard modal implementations
6. **Modal/Dialog** - Multiple implementations
6. **Test fixtures exported** - Temporary functions in production exports

### Immediate Actions Required:
1. **Remove temporary test fixtures** (`createTestFixtures`, `createTestFixturesHttp`)
2. **Consolidate Storage Router** - Choose one canonical implementation
6. **Audit Auth module duplication** (`auth.ts` vs `auth/`)
6. **Consolidate Media Upload components**
6. **Remove `.DS_Store` files**
6. **Review temporary Python/JS scripts in admin-panel**

### Files to Investigate Further:
- `backend/storage/index.ts` - Exports legacy `StorageRouter` but not `StorageRouterV2`
- `backend/firebase/functions/src/auth/` vs `auth.ts`
- `backend/firebase/functions/src/utils.ts` vs `auth/utils.ts`
- Admin panel `design/` folder deletion impact

---

## 11. NEXT PHASES

**Phase 2:** Dependency Audit - Check package.json files for unused/duplicate dependencies
**Phase 3:** Duplicate Implementation Detection - Deep dive on identified duplicates
**Phase 4:** Backend Duplication Audit - Focus on Storage Router, Auth, Providers
**Phase 5:** Cloud Function Audit - Remove temporary functions
**Phase 6:** Firebase Configuration Audit
**Phase 7-9:** Frontend Audit - Admin Panel components, design system, features
**Phase 10-14:** Unused/Dead Code Detection
**Phase 15-16:** Test Audit & Security Preservation
**Phase 17-20:** Deletion Protocol & Cleanup
**Phase 21-23:** Frontend Implementation (if needed), Build/Test, Regression
**Phase 24-25:** Final Sweep & Report

---

*Baseline inventory complete. Proceeding to Phase 2 - Dependency Audit.*