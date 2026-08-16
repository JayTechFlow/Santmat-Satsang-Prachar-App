# R6 ARCHITECTURE CONTRACT

## Santmat Satsang Prachar Admin Panel
**Date:** 2026-08-14  
**Author:** Lead Enterprise Architect & Orchestrator  
**Status:** APPROVED & LOCKED

---

## 1. SCOPE & GOALS

R6 extends the Santmat Satsang Prachar Admin Panel with advanced platform capabilities:
1. **R6.1 Playlist Platform:** Full playlist CRUD, track management, order rearrangement, and status toggles using Firestore `playlists` collection.
2. **R6.2 AI Personalization & Recommendation UI:** Dedicated AI Insights & Personalization view exposing recommendation performance, user model distribution, and content affinity.
3. **R6.3 Analytics & Intelligence:** Extended analytics widgets, session tracking, engagement metrics, and trend analysis using `aiAnalyticsService`.
4. **R6.4 Platform Settings:** Full system configuration UI (branding defaults, upload limits, feature flags, maintenance controls) stored in Firestore `app_settings`.
5. **R6.5 Operational Reports:** Advanced reporting interface with date-range pickers, CSV data export, and KPI summaries.
6. **R6.6 Support & System Operations:** Operational health dashboard, system log monitor, latency metrics, and support ticket desk.
7. **R6.7 Cross-Module Discovery:** Global search dialog (`Cmd+K` / `Ctrl+K`) for cross-cutting content discovery across Audio, Books, StutiVinati, Suvichar, Categories, and Users.
8. **R6.8 Enterprise UX Consistency:** Consistent usage of canonical design tokens (`index.css`), Radix UI primitives, Lucide icons, and layout containers across all new views.
9. **R6.9 Performance & Security Hardening:** Zero bundle regressions, lazy-loaded components, strict RBAC gate checks, zero unhandled errors.
10. **R6.10 Final Regression & Release Report:** Complete build, lint, and test validation with `R6_MASTER_EXECUTION_REPORT.md`.

---

## 2. FILE OWNERSHIP & CONFLICT PREVENTION MAP

To prevent file collision during parallel implementation:

| Module / Phase | Target Files | Owner |
|---|---|---|
| **R6.1 Playlist** | `src/features/playlist/*`, `src/pages/Playlist.tsx` | Agent 2 / Implementation |
| **R6.2 AI Personalization** | `src/features/ai-analytics/*`, `src/components/ai/*` | Agent 3 / Implementation |
| **R6.3 Analytics** | `src/features/reports/*`, `src/components/analytics/*` | Agent 4 / Implementation |
| **R6.4 Settings** | `src/features/settings/*`, `src/pages/Settings.tsx` | Agent 5 / Implementation |
| **R6.5 Reports** | `src/pages/Reports.tsx` | Agent 5 / Implementation |
| **R6.6 Support** | `src/features/support/*`, `src/pages/Support.tsx` | Agent 5 / Implementation |
| **R6.7 Search** | `src/features/search/*`, `src/components/search/*`, `src/components/Layout.tsx` | Agent 6 / Implementation |
| **R6.8 UX & Design** | `src/components/ui/*`, `src/index.css` | Agent 7 / Shared UI |
| **R6.9 Performance/Security**| `src/core/auth/*`, `vite.config.ts` | Agent 8 / Security & Perf |
| **R6.10 Orchestration** | All root files, master reports | Agent 0 / Lead Orchestrator |

---

## 3. STRICT NON-NEGOTIABLE ARCHITECTURE RULES

1. **Role Model:** Exactly 3 roles (`developer_super_admin`, `client_super_admin`, `mobile_user`). Forbidden: `admin`, `super_admin`, `content_manager`, `editor`, `viewer`.
2. **Forbidden Frameworks:** No Tailwind, Material UI, Bootstrap, or extra CSS/icon libraries.
3. **No Fake Backend:** If a backend endpoint or Cloud Function is missing, mark UI as `UI READY — BACKEND CAPABILITY PENDING`. Never mock fake responses inside services.
4. **No Type Suppressions:** Zero `@ts-ignore`, zero `@ts-nocheck`, zero `: any` types allowed in new or edited code.
5. **Phase Gates:** Build, lint, and test suite MUST pass with exit code 0 after each implementation phase.

---

## 4. ACCEPTANCE CRITERIA
- `npm run build` exits 0.
- `npm run lint` exits 0.
- `npm run test` exits 0 with all existing + new unit tests passing.
- All R6 views fully responsive across 375px, 390px, 768px, 1024px, 1280px, 1440px.
- Zero R5 regressions.
