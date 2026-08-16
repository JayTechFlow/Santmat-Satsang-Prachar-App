# R2 File Ownership Map

## Ownership Rules
- **NO TWO IMPLEMENTATION AGENTS MAY EDIT THE SAME FILE SIMULTANEOUSLY**
- If a dependency requires another agent's changes: STOP and wait
- Do not create duplicate implementations
- Read another agent's changes before depending on them

---

## Agent 6 — App Shell
**Primary Owner:** `src/components/Layout.tsx`
**May Create:** `src/components/AppShell.tsx` (only if Layout refactor requires new shell component)

**Files NOT to touch:**
- src/components/Sidebar.tsx (Agent 7)
- src/components/Header.tsx (Agent 8)
- src/components/ui/Breadcrumb.tsx (Agent 9)
- src/components/ui/PageHeader.tsx (Agent 9)
- src/components/ui/PageContainer.tsx (Agent 9)

---

## Agent 7 — Sidebar
**Primary Owner:** `src/components/Sidebar.tsx`
**May Create:** 
- `src/components/navigation/NavSection.tsx`
- `src/components/navigation/NavLink.tsx`
- `src/components/navigation/NavGroup.tsx`
- `src/components/navigation/NavFooter.tsx`
- `src/components/navigation/RouteMatcher.tsx` (if needed)
- `src/components/navigation/SidebarContent.tsx`

**Files NOT to touch:**
- src/components/Layout.tsx (Agent 6)
- src/components/Header.tsx (Agent 8)
- src/components/ui/* (Agent 9)
- src/components/navigation/navConfig.ts (shared config, read-only)

---

## Agent 8 — Header
**Primary Owner:** `src/components/Header.tsx`
**May Create:**
- `src/components/header/UserMenu.tsx`
- `src/components/header/NotificationBell.tsx`
- `src/components/header/ThemeToggle.tsx` (if theme switching exists)
- `src/components/header/HeaderActions.tsx`

**Files NOT to touch:**
- src/components/Layout.tsx (Agent 6)
- src/components/Sidebar.tsx (Agent 7)
- src/components/ui/* (Agent 9)
- src/components/navigation/* (Agent 7/9)

---

## Agent 9 — Navigation Primitives
**Owns ONLY newly created/enhanced files:**
- `src/components/ui/Breadcrumb.tsx` (ENHANCE existing)
- `src/components/ui/PageHeader.tsx` (ENHANCE existing)
- `src/components/ui/PageContainer.tsx` (ENHANCE existing)
- `src/components/ui/UserMenu.tsx` (NEW)
- `src/components/navigation/NavLink.tsx` (NEW - reusable link component)
- `src/components/navigation/RouteMatcher.tsx` (NEW - if needed)
- `src/components/navigation/navConfig.ts` (NEW - replace stub with full config)

**Files NOT to touch:**
- src/components/Layout.tsx (Agent 6)
- src/components/Sidebar.tsx (Agent 7)
- src/components/Header.tsx (Agent 8)
- src/components/navigation/NavSection.tsx (Agent 7)
- src/components/navigation/NavGroup.tsx (Agent 7)

---

## Agent 10 — Accessibility / Responsive QA
**Mode:** READ + MODIFY only explicitly assigned files AFTER implementation
**May Modify (for fixes only):**
- Any file owned by Agents 6-9, but ONLY for accessibility/responsive fixes
- Must coordinate with owning agent before modifying

**Files to Audit (READ-ONLY during implementation):**
- src/components/Layout.tsx
- src/components/Sidebar.tsx
- src/components/Header.tsx
- src/components/ui/Breadcrumb.tsx
- src/components/ui/PageHeader.tsx
- src/components/ui/PageContainer.tsx
- src/components/ui/DropdownMenu.tsx
- src/components/ui/Tooltip.tsx
- src/components/ui/Modal.tsx
- src/components/ui/Tabs.tsx
- src/index.css

---

## Shared / Read-Only Files (All Agents)
- `src/core/auth/PermissionContext.tsx` — DO NOT MODIFY
- `src/core/auth/ProtectedRoute.tsx` — DO NOT MODIFY
- `src/core/services/authService.ts` — DO NOT MODIFY
- `src/hooks/useAuth.ts` — DO NOT MODIFY
- `src/index.css` — Design tokens (Agent 2 audits, Agent 10 verifies, others consume)
- `src/components/navigation/navConfig.stub.ts` — Reference only (Agent 9 creates navConfig.ts)
- `package.json` — Agent 0 only for dependency additions

---

## Conflict Prevention Matrix

| File | Agent 6 | Agent 7 | Agent 8 | Agent 9 | Agent 10 |
|------|---------|---------|---------|---------|----------|
| Layout.tsx | ✅ OWNER | ❌ | ❌ | ❌ | 🔍 AUDIT |
| Sidebar.tsx | ❌ | ✅ OWNER | ❌ | ❌ | 🔍 AUDIT |
| Header.tsx | ❌ | ❌ | ✅ OWNER | ❌ | 🔍 AUDIT |
| Breadcrumb.tsx | ❌ | ❌ | ❌ | ✅ OWNER | 🔍 AUDIT |
| PageHeader.tsx | ❌ | ❌ | ❌ | ✅ OWNER | 🔍 AUDIT |
| PageContainer.tsx | ❌ | ❌ | ❌ | ✅ OWNER | 🔍 AUDIT |
| navConfig.ts | ❌ | 🔍 READ | 🔍 READ | ✅ OWNER | 🔍 READ |
| RouteMatcher.tsx | ❌ | 🔍 READ | ❌ | ✅ OWNER | 🔍 READ |
| NavLink.tsx | ❌ | 🔍 READ | ❌ | ✅ OWNER | 🔍 READ |
| UserMenu.tsx | ❌ | ❌ | 🔍 READ | ✅ OWNER | 🔍 AUDIT |
| DropdownMenu.tsx | ❌ | ❌ | 🔍 READ | ❌ | 🔍 AUDIT |
| Tooltip.tsx | ❌ | 🔍 READ | ❌ | ❌ | 🔍 AUDIT |
| index.css | 🔍 READ | 🔍 READ | 🔍 READ | 🔍 READ | ✅ AUDIT |

✅ = Owner (can modify) | 🔍 = Read/Audit only | ❌ = No access

---

## Dependency Order

1. **Agent 9** creates `navConfig.ts` (replaces stub) → shared config
2. **Agent 7** consumes `navConfig.ts` for Sidebar navigation
3. **Agent 9** creates `RouteMatcher.tsx` utility → shared utility
4. **Agent 7** consumes `RouteMatcher.tsx` for active state
5. **Agent 6** integrates Sidebar + Header in Layout/AppShell
6. **Agent 8** creates `UserMenu.tsx` using Radix DropdownMenu
7. **Agent 9** enhances Breadcrumb, PageHeader, PageContainer
8. **Agent 10** audits all for accessibility/responsive compliance

---

## Implementation Barrier Rules

- Agents 6-9 work in parallel ONLY when file ownership doesn't overlap
- If Agent 7 needs RouteMatcher from Agent 9: Agent 9 completes first, Agent 7 reads
- If Agent 8 needs UserMenu from Agent 9: Agent 9 completes first, Agent 8 reads
- Agent 10 only engages AFTER Agents 6-9 declare completion
- Agent 0 coordinates handoffs and resolves conflicts

---

## File Creation Checklist

### New Files to Create (Agent 9 unless noted):
- [ ] `src/components/navigation/navConfig.ts` (Agent 9)
- [ ] `src/components/navigation/RouteMatcher.tsx` (Agent 9)
- [ ] `src/components/navigation/NavLink.tsx` (Agent 9)
- [ ] `src/components/ui/UserMenu.tsx` (Agent 9)
- [ ] `src/components/navigation/NavSection.tsx` (Agent 7)
- [ ] `src/components/navigation/NavGroup.tsx` (Agent 7)
- [ ] `src/components/navigation/NavFooter.tsx` (Agent 7)
- [ ] `src/components/navigation/SidebarContent.tsx` (Agent 7)
- [ ] `src/components/header/UserMenu.tsx` (Agent 8) — or use Agent 9's
- [ ] `src/components/header/NotificationBell.tsx` (Agent 8)
- [ ] `src/components/AppShell.tsx` (Agent 6, only if needed)

### Files to Enhance:
- [ ] `src/components/ui/Breadcrumb.tsx` (Agent 9)
- [ ] `src/components/ui/PageHeader.tsx` (Agent 9)
- [ ] `src/components/ui/PageContainer.tsx` (Agent 9)
- [ ] `src/components/Layout.tsx` (Agent 6)
- [ ] `src/components/Sidebar.tsx` (Agent 7)
- [ ] `src/components/Header.tsx` (Agent 8)

---

## Verification Commands (Agent 11)
```bash
cd /Users/jaymac/Documents/Santmat-Satsang-Prachar/admin-panel
npm run build
npm run lint
npm run test
```

---

## Rollback Plan
If conflicts arise:
1. Agent 0 identifies conflicting files
2. Agent 0 assigns single owner
3. Other agent reverts changes to that file
4. Single owner implements merged requirements
5. Re-run verification