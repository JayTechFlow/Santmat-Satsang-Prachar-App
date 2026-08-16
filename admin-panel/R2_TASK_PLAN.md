# R2 Task Plan — Enterprise Admin App Shell & Navigation

## Phase Overview
Build the Enterprise Admin Application Shell covering: AppShell, Layout architecture, Sidebar, Header, Navigation, Active route handling, Breadcrumbs, PageHeader, PageContainer, Responsive shell, Sidebar collapse, Mobile/tablet admin shell behavior, User menu, Theme consistency, Motion, Accessibility, Shell loading/error/empty states, Permission-aware navigation, Enterprise visual consistency.

## Agent Assignments

### Agent 0 — Lead / Orchestrator (THIS AGENT)
- [ ] Repository inspection & architecture understanding ✓
- [ ] Create R2_TASK_PLAN ✓
- [ ] Create R2_FILE_OWNERSHIP_MAP ✓
- [ ] Deploy Agents 1-5 (Audit Phase)
- [ ] Consolidate audit findings → `docs/02-architecture/RICH_UI_R2_ARCHITECTURE_AUDIT.md`
- [ ] Deploy Agents 6-10 (Implementation Phase)
- [ ] Integration barrier management
- [ ] Deploy Agent 11 (Integration/Testing)
- [ ] Final verification & report generation
- [ ] R3 Readiness assessment

### Agent 1 — Architecture Auditor (READ-ONLY)
**Inspect:**
- src/App.tsx, src/main.tsx
- src/components/Layout.tsx, Header.tsx, Sidebar.tsx
- src/core/auth/* (PermissionContext, ProtectedRoute)
- src/index.css
- src/components/ui/*
- src/pages/*
- Routing files, package.json

**Determine:**
- Current shell architecture
- Routing architecture
- Authentication boundary
- PermissionContext integration
- ProtectedRoute behavior
- Existing navigation source
- Current responsive behavior
- Theme system
- Existing shell primitives
- Duplicate shell patterns
- Technical debt

**Output:** `R2_ARCHITECTURE_AUDIT`

### Agent 2 — Design System Auditor (READ-ONLY)
**Inspect:**
- src/index.css
- R1 UI primitives (Button, Card, Modal, DropdownMenu, Tooltip, Tabs, etc.)
- Enterprise Media Library components (MediaLibrary.tsx)

**Audit:**
- Colors, spacing, typography, radius, shadows, z-index
- Motion, focus, dark mode, component density
- Compare shell requirements against canonical Media Library

**Output:** `R2_DESIGN_AUDIT`

### Agent 3 — Navigation / RBAC Auditor (READ-ONLY)
**Inspect:**
- Routes (App.tsx)
- Sidebar.tsx, navConfig.stub.ts
- PermissionContext, PermissionGate, ProtectedRoute
- Role/permission utilities

**Verify exactly three roles:**
- developer_super_admin
- client_super_admin
- mobile_user

**Determine:**
- Available routes & permission requirements
- Navigation visibility logic
- Nested route behavior
- Active-route behavior

**Output:** `R2_NAVIGATION_PERMISSION_MAP`

### Agent 4 — Accessibility Auditor (READ-ONLY)
**Inspect:**
- Header, Sidebar, Layout
- DropdownMenu, Modal, Tooltip, Tabs
- Existing accessibility primitives

**Audit:**
- Keyboard navigation
- Focus management, focus-visible
- ARIA attributes
- Escape handling
- Screen reader labels
- Reduced motion support
- Responsive overlay accessibility

**Output:** `R2_ACCESSIBILITY_AUDIT`

### Agent 5 — Performance Auditor (READ-ONLY)
**Inspect:**
- Sidebar, Header, PermissionContext
- Navigation calculations, route calculations
- Global providers

**Look for:**
- Unnecessary rerenders
- Unstable objects/callbacks
- Expensive route calculations
- Unnecessary context updates

**Output:** `R2_PERFORMANCE_AUDIT`

---

## Parallel Audit Barrier
**IMPORTANT:** Do NOT begin implementation until Agents 1-5 complete audits.
Agent 0 consolidates findings → `docs/02-architecture/RICH_UI_R2_ARCHITECTURE_AUDIT.md`

---

## File Ownership Map (Implementation Phase)

### Agent 6 — App Shell
**Owns:** `src/components/Layout.tsx`
**May create:** `src/components/AppShell.tsx`
**Responsibilities:**
- Shell hierarchy
- Main content region
- Page container integration
- Responsive shell orchestration

### Agent 7 — Sidebar
**Owns:** `src/components/Sidebar.tsx`
**May create:** `src/components/navigation/*`
**Responsibilities:**
- Navigation hierarchy (sections from navConfig)
- Active state (exact + nested + dynamic routes)
- Collapse/expand with tooltip in collapsed mode
- Responsive overlay/drawer (mobile/tablet)
- Permission-aware visibility (consume PermissionGate)
- Keyboard accessibility (Arrow keys, Home/End, Escape)
- Lucide icons
- Tooltip behavior in collapsed mode

### Agent 8 — Header
**Owns:** `src/components/Header.tsx`
**May create:** `src/components/header/*`
**Responsibilities:**
- Authenticated user identity (real name/email/role from auth state)
- Sidebar toggle
- User menu (Radix DropdownMenu)
- Notification entry (if existing)
- Theme controls (if already supported)
- Responsive header behavior

### Agent 9 — Navigation Primitives
**Owns ONLY newly created files:**
- `src/components/ui/Breadcrumb.tsx` (enhance existing)
- `src/components/ui/PageHeader.tsx` (enhance existing)
- `src/components/ui/PageContainer.tsx` (enhance existing)
- `src/components/ui/UserMenu.tsx` (new)
- `src/components/navigation/NavLink.tsx` (new)
- `src/components/navigation/RouteMatcher.tsx` (new, if needed)

**Responsibilities:**
- Reusable APIs
- Accessibility compliance
- Responsive behavior
- Design-token compliance
- **Do NOT modify Sidebar/Header**

### Agent 10 — Accessibility / Responsive QA
**Mode:** READ + MODIFY only explicitly assigned files after implementation
**Responsibilities:**
- Verify keyboard flow (Tab, Arrow keys, Escape, Enter/Space)
- Verify responsive behavior (desktop/tablet/mobile breakpoints)
- Verify ARIA (roles, labels, live regions)
- Verify focus management (focus trapping, restoration)
- Verify reduced motion compliance
- Identify integration issues
- **Do NOT independently redesign components**

### Agent 11 — Integration / Testing (Post-Implementation)
**Owns:** Integration verification only
**Run:** `npm run build`, `npm run lint`, `npm run test`
**Inspect:** git diff
**Check:** TypeScript, imports, circular deps, unused components, dead navigation, broken routes, permission regressions, accessibility regressions, theme regressions
**Classify issues:** BASELINE / NEW / FIXED

---

## Target Architecture
```
App
 |
ProtectedRoute
 |
PermissionContext
 |
AppShell (or Layout)
 |
+----------------------+
|                      |
Sidebar              Header
|                      |
+----------+-----------+
           |
      Main Content
           |
     Breadcrumb
           |
      PageHeader
           |
     PageContainer
           |
       Page Content
```

## Key Requirements Summary

### Sidebar
- Enterprise visual style matching Media Library
- Clear hierarchy with sections (Main, Content, Operations, System)
- Compact density, icon + label
- Active route (exact/nested/dynamic: /media, /media/123, /media/upload)
- Hover, focus, disabled states
- Collapsed mode (icons only) with Radix Tooltip
- Responsive overlay/drawer on mobile/tablet
- Keyboard navigation (ArrowUp/Down, Home, End, Enter, Escape)
- Permission-aware via existing PermissionGate

### Header
- Real authenticated user data (name, email, role from context)
- Sidebar toggle button
- User menu with Radix DropdownMenu (profile, settings, logout)
- Notification bell (if notifications feature exists)
- Responsive: collapses appropriately on small screens

### Breadcrumbs
- Semantic `<nav aria-label="Breadcrumb">`
- `aria-current="page"` for current page
- Handle nested routes
- Avoid excessive depth
- Use existing navConfig.getBreadcrumbTrail()

### PageHeader
- Reusable API: title, description, breadcrumbs, actions, status/badge
- Minimal API, don't overengineer
- Match Media Library visual style

### Responsive
- Desktop (≥1024px): Persistent sidebar
- Tablet (768px-1023px): Collapsible sidebar
- Mobile (<768px): Accessible overlay/drawer
- Escape handling, focus management, backdrop, scroll locking
- Correct z-index, no clipping, no layout jump
- Use Radix Dialog/Sheet primitives where appropriate

### Motion
- Use existing R1 motion tokens (--duration-fast, --duration-normal, --easing-standard)
- Restrained transitions only
- Respect `prefers-reduced-motion`

### Theme
- Use existing CSS variables from index.css
- Verify light/dark for: Sidebar, Header, Dropdown, Tooltip, Breadcrumb, PageHeader, PageContainer, focus states, overlay

### Permission Safety
- **DO NOT MODIFY:** Permission Engine, ProtectedRoute, PermissionContext architecture
- Navigation consumes existing permissions
- Three roles remain immutable
- Never add: admin, super_admin, editor, viewer, content_manager

### Performance
- Avoid unnecessary rerenders
- Only introduce useMemo/useCallback/React.memo when justified
- No global state solely for navigation

### Security
- Never treat UI hiding as authorization
- Never log tokens/credentials
- Don't weaken route protection
- Don't bypass PermissionGate

---

## Acceptance Matrix (to be filled by Agent 11)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| App Shell | | |
| Sidebar | | |
| Header | | |
| Navigation | | |
| Active Route | | |
| Breadcrumb | | |
| Page Header | | |
| Page Container | | |
| Responsive | | |
| Collapsed Sidebar | | |
| Mobile Overlay | | |
| Theme | | |
| Motion | | |
| Accessibility | | |
| Keyboard | | |
| Permission Integration | | |
| Authenticated User | | |
| Performance | | |
| Security | | |
| Media Library Consistency | | |
| Build | | |
| Lint | | |
| Tests | | |
| Browser Verification | | |
| Visual Verification | | |

**Allowed statuses:** PASS, FAIL, PARTIAL, NOT VERIFIED, NOT AVAILABLE, NOT APPLICABLE

---

## Final Execution Summary Format (Agent 0 produces)

```
R2 STATUS: COMPLETE / PARTIAL / BLOCKED

ARCHITECTURE: PASS / FAIL
APP SHELL: PASS / FAIL / NOT VERIFIED
SIDEBAR: PASS / FAIL / NOT VERIFIED
HEADER: PASS / FAIL / NOT VERIFIED
NAVIGATION: PASS / FAIL / NOT VERIFIED
BREADCRUMBS: PASS / FAIL / NOT VERIFIED
PAGE HEADER: PASS / FAIL / NOT VERIFIED
RESPONSIVE: PASS / FAIL / NOT VERIFIED
ACCESSIBILITY: PASS / FAIL / NOT VERIFIED
THEME: PASS / FAIL / NOT VERIFIED
MOTION: PASS / FAIL / NOT VERIFIED
PERMISSIONS: PASS / REGRESSION / NOT VERIFIED
MEDIA LIBRARY CONSISTENCY: PASS / FAIL / NOT VERIFIED
BUILD: PASS / FAIL / NOT VERIFIED
LINT: PASS / FAIL / NOT VERIFIED
TESTS: PASS / FAIL / NOT VERIFIED
BROWSER: PASS / FAIL / NOT AVAILABLE / NOT VERIFIED
VISUAL: PASS / FAIL / NOT AVAILABLE / NOT VERIFIED

NEW ERRORS: ...
BASELINE ERRORS: ...
FILES MODIFIED: ...
FILES ADDED: ...
FILES DELETED: ...
DEPENDENCIES ADDED: ...
REGRESSIONS: NONE / LIST
REMAINING ITEMS: ...
R3 READINESS: READY / NOT READY
```