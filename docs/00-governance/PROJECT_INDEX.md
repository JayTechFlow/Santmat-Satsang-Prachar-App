# Project Documentation Index (Single Source of Truth)

## Executive Summary
This document serves as the master entry point and single source of truth for the entire Santmat Satsang Prachar repository. It organizes all enterprise documentation, modules, and processes to ensure maintainability, scalability, and strict governance.

## Product Vision
The Santmat Satsang Prachar application aims to provide a robust, spiritual platform offering Bhajans, Stuti-Vinati, daily quotes, and inspirational content tailored for an accessible and seamless user experience, particularly catering to senior citizens.

## Repository Overview
The repository is an enterprise monorepo encompassing a Flutter mobile application, a React/TypeScript Admin Panel, and a Firebase/Supabase backend with offline-first capabilities.

## Technology Stack
- **Mobile**: Flutter, Riverpod, GoRouter, Hive
- **Admin Panel**: React, TypeScript, Vite, Oxc
- **Backend & Database**: Firebase (Firestore, Storage, Functions, App Check)
- **CI/CD**: GitHub Actions

## Repository Statistics
- **Total Folders**: ~592
- **Total Files**: ~959
- **Core Languages**: Dart, TypeScript, JavaScript, Python
*(For detailed breakdown, see `docs/00-governance/PROJECT_INVENTORY.md`)*

## Folder Structure Overview
- `/admin-panel` - React + Vite Administration Web Portal
- `/mobile` - Flutter Mobile Application
- `/backend` - Firebase Cloud Functions & Configuration
- `/firebase` - Firebase local setup
- `/docs` - Enterprise Documentation & Governance
- `/scripts` - Utility & Build Scripts
- `/assets` - Centralized Asset Repository

## Documentation Structure
The documentation is systematically structured in phases:
1. `00-governance` - Governance, indexes, matrices
2. `01-requirements` - Client Requirements & SRS
3. `02-architecture` - System Architecture & ADRs
4. `03-backend-database` - Firebase & Database Specs
5. `04-api` - API Guidelines & Contracts
6. `05-development` - Coding Standards & Dev Setup
7. `06-testing` - Testing Standards
8. `07-deployment` - CI/CD, Release Processes, Changelogs
9. `08-operations` - Manuals, DR, Security
10. `09-governance` - (Legacy Governance - Deprecated)

## Reading Order
To fully understand the project, new members should read documents in the following order:
1. `docs/00-governance/PROJECT_INDEX.md` (This document)
2. `docs/00-governance/DOCUMENTATION_ROADMAP.md`
3. `docs/01-requirements/CLIENT_REQUIREMENT_DOCUMENT.md`
4. `docs/02-architecture/ARCHITECTURE.md`
5. `docs/05-development/Developer_Guide.md`

## Major Components
### Admin Panel
A React-based web dashboard using TypeScript and Vite for content management (Bhajans, Quotes, Books).
### Mobile App
A cross-platform Flutter application utilizing Riverpod for state management, focusing on offline capabilities and media playback.
### Firebase
The primary backend providing Authentication, Firestore (NoSQL Database), Cloud Storage, and security rules.
### Cloud Functions
Serverless Node.js functions bridging complex backend logic and triggers.
### Shared Libraries
Internal shared utilities, custom hooks, and models across the monorepo.

## Existing Modules
- Stuti-Vinati
- Bhajans
- Books / Library
- Banners
- Dashboard
- Users Management
- Suvichar / Daily Quotes
- Categories
- Notifications
- Audio & Downloads

## Existing Documentation
All historical documentation is preserved and tracked under `DOCUMENT_STATUS_MATRIX.md`. Key existing documents include:
- `CLIENT_REQUIREMENT_DOCUMENT.md`
- `ARCHITECTURE.md`
- `firebase_audit_report.md`
- `performance_report.md`
- `PROJECT_ROADMAP.md`

## Development Workflow
Features follow a feature-first architecture, tracked via GitHub PRs, automated via CI/CD pipelines, and requiring stringent code reviews aligned with architectural guidelines.

## References
- **Coding Standards**: `docs/05-development/CODING_STANDARDS.md`
- **Architecture**: `docs/02-architecture/ARCHITECTURE.md`
- **Database**: `docs/03-backend-database/DATABASE.md`
- **API**: `docs/04-api/API_GUIDELINES.md`
- **Testing**: `docs/06-testing/TESTING.md`
- **Security**: `docs/08-operations/SECURITY.md`

## Audit Reports
- `firebase_audit_report.md` - Details Firebase security and performance audits.
- `performance_report.md` - Enterprise scale performance report.

## Current Project Status
- **Current Release Stage**: Production Readiness / Beta Candidate
- **Pending Work**: Final QA, Missing governance documents (SRS, UI/UX specs, Admin Specs)
- **Roadmap**: `PROJECT_ROADMAP.md`

## Useful Links to Internal Documents
- [Documentation Status Matrix](DOCUMENT_STATUS_MATRIX.md)
- [Documentation Map](DOCUMENTATION_MAP.md)
- [Documentation Roadmap](DOCUMENTATION_ROADMAP.md)
- [Project Inventory](PROJECT_INVENTORY.md)
- [Document Health Report](DOCUMENT_HEALTH_REPORT.md)
