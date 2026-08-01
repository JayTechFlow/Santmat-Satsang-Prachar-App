# Project Documentation Index

**Purpose**: This document serves as the single source of truth for all project documentation. It lists every document in the repository, its purpose, assigned owner, and status.

## 01. Requirements (`/docs/01-requirements`)
| Document | Purpose | Owner | Status | Dependencies |
|----------|---------|-------|--------|--------------|
| `CLIENT_REQUIREMENT_DOCUMENT.md` | Primary source of truth from client PDF | Product Owner | Approved | None |

## 02. Architecture (`/docs/02-architecture`)
| Document | Purpose | Owner | Status | Dependencies |
|----------|---------|-------|--------|--------------|
| `ARCHITECTURE.md` | High-level system architecture | Principal Architect | Draft | CRD, SRS (Missing) |
| `Architecture_Guide.md` | *Duplicate/Obsolete* - See ARCHITECTURE.md | Principal Architect | Obsolete | None |
| `ARCHITECTURE_DECISIONS.md` | Log of architecture decisions (ADRs) | Principal Architect | Draft | ARCHITECTURE.md |

## 03. Backend & Database (`/docs/03-backend-database`)
| Document | Purpose | Owner | Status | Dependencies |
|----------|---------|-------|--------|--------------|
| `DATABASE.md` | Database schema and design | Tech Lead | Draft | ARCHITECTURE.md |
| `FIREBASE.md` | Firebase structure and rules | Tech Lead | Draft | DATABASE.md |
| `Firebase_Setup.md` | *Duplicate/Obsolete* - See FIREBASE.md | Tech Lead | Obsolete | None |

## 04. API (`/docs/04-api`)
| Document | Purpose | Owner | Status | Dependencies |
|----------|---------|-------|--------|--------------|
| `API_GUIDELINES.md` | API standards and endpoints | Tech Lead | Draft | ARCHITECTURE.md, DATABASE.md |

## 05. Development (`/docs/05-development`)
| Document | Purpose | Owner | Status | Dependencies |
|----------|---------|-------|--------|--------------|
| `CODING_STANDARDS.md` | Code formatting and conventions | Lead Developer | Draft | None |
| `Environment_Setup.md` | Local dev environment instructions | Lead Developer | Draft | None |
| `Developer_Guide.md` | Developer onboarding and workflow | Lead Developer | Draft | Environment_Setup.md |

## 06. Testing (`/docs/06-testing`)
| Document | Purpose | Owner | Status | Dependencies |
|----------|---------|-------|--------|--------------|
| `TESTING.md` | QA strategies and test cases | QA Lead | Draft | CRD, API_GUIDELINES.md |

## 07. Deployment (`/docs/07-deployment`)
| Document | Purpose | Owner | Status | Dependencies |
|----------|---------|-------|--------|--------------|
| `DEPLOYMENT.md` | Production deployment instructions | DevOps Lead | Draft | ARCHITECTURE.md |
| `Deployment_Guide.md` | *Duplicate/Obsolete* - See DEPLOYMENT.md | DevOps Lead | Obsolete | None |
| `CI_CD_Guide.md` | Continuous Integration / Delivery pipelines | DevOps Lead | Draft | DEPLOYMENT.md |
| `RELEASE_PROCESS.md` | Steps for releasing new versions | DevOps Lead | Draft | CI_CD_Guide.md |
| `Release_Checklist.md` | Pre-release checks | QA Lead | Draft | RELEASE_PROCESS.md |
| `CHANGELOG.md` | Version history | Product Owner | Active | None |

## 08. Operations (`/docs/08-operations`)
| Document | Purpose | Owner | Status | Dependencies |
|----------|---------|-------|--------|--------------|
| `SECURITY.md` | Security guidelines and audits | Principal Architect | Draft | ARCHITECTURE.md |
| `Incident_Response_Guide.md` | What to do during outages | DevOps Lead | Draft | SECURITY.md |
| `Disaster_Recovery_Guide.md` | Backup and restore procedures | DevOps Lead | Draft | Incident_Response_Guide.md |
| `Operations_Manual.md` | Routine maintenance tasks | DevOps Lead | Draft | DEPLOYMENT.md |

## 09. Governance (`/docs/09-governance`)
| Document | Purpose | Owner | Status | Dependencies |
|----------|---------|-------|--------|--------------|
| `DOCUMENTATION_MAP.md` | Visual mapping of docs dependencies | Principal Architect | Approved | None |
| `DOCUMENTATION_ROADMAP.md` | Recommended order of doc creation | Principal Architect | Approved | None |
| `DOCUMENT_STATUS_MATRIX.md` | Matrix of doc statuses | Principal Architect | Approved | None |
| `MISSING_DOCUMENTS.md` | Backlog of documents to be written | Principal Architect | Approved | None |

## Root Directory
| Document | Purpose | Owner | Status |
|----------|---------|-------|--------|
| `README.md` | Project landing page | Lead Developer | Active |
| `PROJECT_ROADMAP.md` | Project timeline and milestones | Product Owner | Draft |
| `CONTRIBUTING.md` | Rules for contributing code | Lead Developer | Active |
| `firebase_audit_report.md` | Audit report | Tech Lead | Archived |
