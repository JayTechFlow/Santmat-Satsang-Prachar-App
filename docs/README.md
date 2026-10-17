# Santmat Satsang Prachar — System Documentation

Welcome to the centralized documentation registry for the Santmat Satsang Prachar platform.

---

## Documentation Registry

### 1. Architecture & Design
* **[Architecture Overview](./architecture/overview.md)**: Conceptual monorepo design, clean architecture, tech stack, sequence diagrams, and security architecture.
* **[Mobile Widget Migration](./architecture/mobile-widget-migration.md)**: Migration map for legacy to canonical design system components in the Flutter mobile application.
* **[Architecture Decision Records (ADR)](./adr/README.md)**: Historical record of key technical and architectural decisions (ADR-001 through ADR-003).
* **[Design System Specification](./design/design-system-spec.md)**: Visual design tokens, color palette, typography, responsive breakpoints, and component guidelines for the Admin Dashboard.

### 2. Deployment & Operations
* **[Unified Firebase Hosting](./deployment/hosting.md)**: Step-by-step procedure for building and deploying the unified public website and admin dashboard to Firebase Hosting.
* **[Android Mobile Release](./deployment/android-release.md)**: Authoritative guide for building release APK/AAB artifacts, keystore safety, and device smoke testing.
* **[Monitoring & Maintenance Runbook](./deployment/monitoring-and-maintenance.md)**: 24-hour post-deployment monitoring plan, error log analysis, Crashlytics, and maintenance runbooks.

### 3. Audits & Verification
* **[Production Acceptance Audit](./audits/production-acceptance.md)**: Official acceptance audit documenting canonical category labels (`शाही भजनावली`), Firestore compatibility, and build verification.
* **[Admin UI Audit Report](./audits/admin-ui-audit-report.md)**: Audit findings and progressive redesign roadmap for the Admin CMS interface.

### 4. Product
* **[Product Roadmap](./product/roadmap.md)**: Vision, technical stack, core milestones, and future deliverables.

---

## Applications Summary

| Subproject | Directory | Technology | Role |
|---|---|---|---|
| Mobile Client | `apps/mobile/` | Flutter 3.x, Riverpod, Hive | Android & iOS consumer application |
| Admin Dashboard | `apps/web/` | React 19, TypeScript, Vite, Tailwind v4 | Web CMS served at `/admin/*` |
| Public Website | `apps/website/` | React 19, TypeScript, Vite, Tailwind v4 | Public landing & legal pages at `/` |
| Cloud Backend | `firebase/functions/` | Node 20, TypeScript, Cloud Functions v2 | Triggers, IAM, and backend processing |
| Shared Config | `shared/siteConfig.ts` | TypeScript | Canonical business identity and URL contracts |
