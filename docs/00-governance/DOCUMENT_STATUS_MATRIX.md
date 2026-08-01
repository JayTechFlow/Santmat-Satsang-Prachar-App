# Document Status Matrix

**Purpose**: Registry of EVERY markdown document in the repository to maintain a Single Source of Truth.

| Document Name | Location | Category | Purpose | Current Status | Owner | Dependencies | Superseded By | Last Updated | Remarks |
|---|---|---|---|---|---|---|---|---|---|
| PROJECT_INDEX.md | `docs/00-governance/` | Governance | Master entry point | Approved | Governance Lead | None | None | 2026-08-01 | Primary Source of Truth |
| PROJECT_INVENTORY.md | `docs/00-governance/` | Governance | Repository inventory and stats | Approved | Repo Engineer | None | None | 2026-08-01 | - |
| DOCUMENT_STATUS_MATRIX.md | `docs/00-governance/` | Governance | Registry of all documents | Approved | Governance Lead | None | None | 2026-08-01 | - |
| DOCUMENTATION_MAP.md | `docs/00-governance/` | Governance | Visual relationship map | Approved | Governance Lead | None | None | 2026-08-01 | - |
| DOCUMENTATION_ROADMAP.md | `docs/00-governance/` | Governance | Authoring order and phases | Approved | Governance Lead | None | None | 2026-08-01 | - |
| DOCUMENT_HEALTH_REPORT.md | `docs/00-governance/` | Governance | Quality metrics and missing docs | Approved | Governance Lead | None | None | 2026-08-01 | - |
| PROJECT_INDEX.md | `docs/` | Governance | Legacy index | Duplicate | Governance Lead | None | `docs/00-governance/PROJECT_INDEX.md` | - | Do not delete, marked duplicate |
| DOCUMENT_STATUS_MATRIX.md | `docs/09-governance/` | Governance | Legacy matrix | Duplicate | Governance Lead | None | `docs/00-governance/DOCUMENT_STATUS_MATRIX.md` | - | Do not delete, marked duplicate |
| DOCUMENTATION_MAP.md | `docs/09-governance/` | Governance | Legacy map | Duplicate | Governance Lead | None | `docs/00-governance/DOCUMENTATION_MAP.md` | - | Do not delete, marked duplicate |
| DOCUMENTATION_ROADMAP.md | `docs/09-governance/` | Governance | Legacy roadmap | Duplicate | Governance Lead | None | `docs/00-governance/DOCUMENTATION_ROADMAP.md` | - | Do not delete, marked duplicate |
| MISSING_DOCUMENTS.md | `docs/09-governance/` | Governance | Legacy missing list | Duplicate | Governance Lead | None | `docs/00-governance/DOCUMENT_HEALTH_REPORT.md` | - | Do not delete, marked duplicate |
| CLIENT_REQUIREMENT_DOCUMENT.md | `docs/01-requirements/` | Requirements | Client needs specification | Approved | Product Owner | None | None | - | Source of truth for requirements |
| ARCHITECTURE.md | `docs/02-architecture/` | Architecture | High-level architecture | Draft | Principal Architect | CRD | None | - | - |
| ARCHITECTURE_DECISIONS.md | `docs/02-architecture/` | Architecture | ADR log | Draft | Principal Architect | ARCHITECTURE.md | None | - | - |
| Architecture_Guide.md | `docs/02-architecture/` | Architecture | Legacy architecture guide | Duplicate | Principal Architect | None | `ARCHITECTURE.md` | - | Do not delete, marked duplicate |
| DATABASE.md | `docs/03-backend-database/` | Backend | Database schema & specs | Draft | Tech Lead | ARCHITECTURE.md | None | - | - |
| FIREBASE.md | `docs/03-backend-database/` | Backend | Firebase infrastructure specs | Draft | Tech Lead | ARCHITECTURE.md | None | - | - |
| Firebase_Setup.md | `docs/03-backend-database/` | Backend | Legacy setup guide | Duplicate | Tech Lead | None | `FIREBASE.md` | - | Do not delete, marked duplicate |
| API_GUIDELINES.md | `docs/04-api/` | API | API contracts and structure | Draft | Tech Lead | ARCHITECTURE.md | None | - | - |
| CODING_STANDARDS.md | `docs/05-development/` | Development| Development standards | Draft | Lead Developer | None | None | - | - |
| Developer_Guide.md | `docs/05-development/` | Development| Onboarding and setup | Draft | Lead Developer | None | None | - | - |
| Environment_Setup.md | `docs/05-development/` | Development| Local environment instructions| Draft | Lead Developer | None | None | - | - |
| TESTING.md | `docs/06-testing/` | Testing | Test strategy & execution | Draft | QA Lead | SRS, ARCHITECTURE.md | None | - | - |
| CHANGELOG.md | `docs/07-deployment/` | Deployment | Version history | Draft | Release Manager | None | None | - | - |
| CI_CD_Guide.md | `docs/07-deployment/` | Deployment | GitHub actions setup | Approved | DevOps | None | None | - | - |
| DEPLOYMENT.md | `docs/07-deployment/` | Deployment | Deployment procedures | Draft | DevOps | None | None | - | - |
| Deployment_Guide.md | `docs/07-deployment/` | Deployment | Legacy deployment guide | Duplicate | DevOps | None | `DEPLOYMENT.md` | - | Do not delete, marked duplicate |
| RELEASE_PROCESS.md | `docs/07-deployment/` | Deployment | Release workflow | Draft | Release Manager | None | None | - | - |
| Release_Checklist.md | `docs/07-deployment/` | Deployment | Pre-release checklist | Draft | Release Manager | None | None | - | - |
| Disaster_Recovery_Guide.md | `docs/08-operations/` | Operations | DB backups & restoration | Approved | DevOps | None | None | - | - |
| Incident_Response_Guide.md | `docs/08-operations/` | Operations | Playbooks for outages | Approved | DevOps | None | None | - | - |
| Operations_Manual.md | `docs/08-operations/` | Operations | Production monitoring guide | Approved | DevOps | None | None | - | - |
| SECURITY.md | `docs/08-operations/` | Operations | Security practices | Draft | Security Lead | None | None | - | - |
| AGENT.md | `/` | Root | AI Agent Role definitions | Approved | Project Admin | None | None | - | - |
| CONTRIBUTING.md | `/` | Root | Contributor guidelines | Approved | Project Admin | None | None | - | - |
| PROJECT_ROADMAP.md | `/` | Root | Timeline and epics | Approved | Product Owner | None | None | - | - |
| README.md | `/` | Root | Root repository readme | Approved | Project Admin | None | None | - | - |
| firebase_audit_report.md | `/` | Audits | Firebase production audit | Approved | Security Auditor | None | None | - | - |
| performance_report.md | `/` | Audits | Enterprise performance audit| Approved | Performance Eng | None | None | - | - |
| README.md | `admin-panel/` | Admin Panel| React vite initialization | Approved | Frontend Lead | None | None | - | - |
| README.md | `mobile/app/` | Mobile App | Flutter root readme | Approved | Mobile Lead | None | None | - | - |
