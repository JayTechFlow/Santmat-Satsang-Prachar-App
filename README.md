# Santmat Satsang Prachar

Cross-platform spiritual ecosystem for distributing devotional satsang audio, stutis, books, and notifications.

---

## Repository Architecture

This repository is structured as a unified monorepo containing the mobile application, web applications, and serverless backend:

```text
Santmat-Satsang-Prachar/
├── apps/
│   ├── mobile/         # Flutter cross-platform mobile client (Android / iOS)
│   ├── web/            # Admin CMS Dashboard (React 19 + TypeScript + Tailwind v4)
│   └── website/        # Public business landing & legal pages (React 19 + TypeScript)
├── firebase/
│   ├── functions/      # Cloud Functions v2 serverless backend (Node.js 20 / TypeScript)
│   ├── firestore.rules # Firestore security rules and RBAC controls
│   └── storage.rules   # Cloud Storage security rules
├── shared/
│   └── siteConfig.ts   # Canonical business identity and URL contracts
├── scripts/
│   └── build-hosting.mjs # Unified Firebase Hosting assembly pipeline
└── docs/               # Centralized architecture, deployment, and audit documentation
```

---

## Canonical Domains

| Application | Canonical Production URL | Origin / Base |
|---|---|---|
| **Public Website** | `https://santmatsatsangparchar.in` | `/` |
| **Admin Dashboard** | `https://santmatsatsangparchar.in/admin` | `/admin/*` |

---

## Quick Start & Common Commands

### Root Workspace Commands

```bash
# Typecheck and lint web applications
npm run lint

# Run all web unit and integration test suites
npm run test

# Assemble unified Firebase Hosting distribution (dist/ and dist/admin/)
npm run build:hosting

# Run backend Cloud Functions tests
npm run test:functions
```

### Mobile Application (`apps/mobile`)

```bash
cd apps/mobile

# Analyze Dart source code
flutter analyze --no-pub

# Run test suite
flutter test

# Build release artifacts
flutter build apk --release
flutter build appbundle --release
```

### Web Applications

```bash
# Admin Dashboard (local dev at http://localhost:3000/admin/)
npm --prefix apps/web run dev

# Public Website (local dev at http://localhost:3001/)
npm --prefix apps/website run dev
```

---

## Documentation Registry

Comprehensive project documentation is maintained in [`docs/`](./docs/README.md):

* **[Architecture Overview](./docs/architecture/overview.md)** — Monorepo design, sequence diagrams, and security architecture.
* **[Design System Specification](./docs/design/design-system-spec.md)** — Admin dashboard design tokens, typography, and responsive patterns.
* **[Unified Firebase Hosting](./docs/deployment/hosting.md)** — Build, deployment, and rollback procedures.
* **[Android Mobile Release](./docs/deployment/android-release.md)** — Mobile release builds, signing, and verification.
* **[Monitoring Runbook](./docs/deployment/monitoring-and-maintenance.md)** — Operational maintenance and post-deploy health checks.
* **[Production Acceptance Audit](./docs/audits/production-acceptance.md)** — Category label (`शाही भजनावली`) and data compatibility records.
* **[Product Roadmap](./docs/product/roadmap.md)** — Milestone plan and technical roadmap.
