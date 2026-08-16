# R3 ARCHITECTURE CONTRACT
## Enterprise Core UI Component System

**Consolidated from:** Design System Audit, Accessibility Audit, Component Inventory, API Audit, Performance Audit, R2 Architecture Audit

---

## 1. CANONICAL STANDARDS (LOCKED)

### 1.1 Design Tokens — Add Missing (P0)

```css
/* Button Heights */
--btn-height-sm: 32px;
--btn-height-md: 40px;
--btn-height-lg: 44px;

/* Icon Sizes */
--icon-xs: 14px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 48px;

/* Typography Scale */
--text-xs: 0.625rem;   /* 10px */
--text-sm: 0.75rem;    /* 12px */
--text-base: 0.875rem; /* 14px */
--text-lg: 1rem;       /* 16px */
--text-xl: 1.125rem;   /* 18px */
--text-2xl: 1.25rem;   /* 20px */
--text-3xl: 1.5rem;    /* 24px */
--text-4xl: 1.875rem;  /* 30px */

/* Radius Aliases */
--radius-input: var(--radius-md);     /* 8px - form inputs, badge fix */
--radius-card: var(--radius-lg);      /* 12px - card containers */
--radius-overlay: var(--radius-xl);   /* 16px - modals, dropdowns */

/* Progress Heights */
--progress-height-sm: 4px;
--progress-height-md: 8px;
--progress-height-lg: 12px;

/* Elevation System */
--elevation-1: var(--shadow-sm);      /* subtle */
--elevation-2: var(--shadow-md);      /* cards */
--elevation-3: var(--shadow-lg);      /* dropdowns */
--elevation-4: var(--shadow-card);    /* cards alt */
--elevation-5: var(--shadow-float);   /* modals, toasts */

/* Spacing Gaps */
--space-6: 6px;
--space-10: 10px;
--space-14: 14px;
--space-60: 60px;
```

### 1.2 Color Contrast Fixes (P0)

```css
/* Darken primary to meet 4.5:1 on white */
--primary: #C45A0A;        /* was #E87412 (3.2:1) → now ~4.8:1 */
--primary-hover: #A0480A;
--primary-light: #FFF2E8;

/* Darken border to meet 3:1 non-text */
--border: #D1D5DB;         /* was #E5E7EB (1.3:1) → now ~3.1:1 */
--border-focus: #9CA3AF;
```

### 1.3 Touch Targets (P0)

```css
.btn { height: var(--btn-height-lg); }           /* 44px */
.btn-icon { width: var(--btn-height-lg); height: var(--btn-height-lg); }  /* 44x44 */
.form-input, .form-select, .form-textarea { height: var(--btn-height-lg); } /* 44px */
.nav-link { min-height: var(--btn-height-lg); }  /* 44px */
.dropdown-menu-item { min-height: var(--btn-height-md); } /* 40px */
.tabs-trigger { min-height: var(--btn-height-md); } /* 40px */
```

---

## 2. COMPONENT STANDARDS

### 2.1 Button Variants (Canonical)

| Variant | Height | Background | Text | Border | Shadow |
|---------|--------|------------|------|--------|--------|
| `primary` | lg | `--primary` | `white` | none | `--shadow-sm` |
| `outline` | lg | `--surface` | `--text-heading` | `--border` | `--shadow-sm` |
| `ghost` | lg | `transparent` | `--text-body` | none | none |
| `danger` | lg | `--danger` | `white` | none | `--shadow-sm` |
| `icon` | lg (44×44) | `transparent` | `--text-muted` | none | none |

**Sizes:** `sm` (32px), `md` (40px), `lg` (44px)

### 2.2 Badge Variants (Canonical — Single Source)

| Variant | Background | Text | Border | Use Case |
|---------|------------|------|--------|----------|
| `primary` | `--primary-light` | `--primary` | 25% opacity | Primary actions |
| `success` | `--success-light` | `--success` | 25% opacity | Completed, active |
| `warning` | `--warning-light` | `--warning` | 25% opacity | Pending, draft |
| `danger` | `--danger-light` | `--danger` | 25% opacity | Deleted, error |
| `info` | `--info-light` | `--info` | 25% opacity | Scheduled |
| `neutral` | `--surface-hover` | `--text-muted` | `--border` | Default, folders |

**REMOVE:** `default` variant (duplicate of `neutral`)

### 2.3 User Role Badge Mapping (Canonical)

| Role | Badge Variant | Label |
|------|---------------|-------|
| `developer_super_admin` | `warning` | "Platform Admin" |
| `client_super_admin` | `primary` | "Organization Admin" |
| `mobile_user` | `neutral` | "User" |

---

## 3. COMPONENT ARCHITECTURE

### 3.1 New Primitives to Create (R3 Scope)

| Component | File | Base | API Style |
|-----------|------|------|-----------|
| Button | `src/components/ui/Button.tsx` | Native `<button>` | Compound: variant, size, loading, disabled |
| IconButton | `src/components/ui/IconButton.tsx` | Button | icon, aria-label, size |
| Card | `src/components/ui/Card.tsx` | Native `<div>` | Compound: CardHeader, CardContent, CardFooter |
| Input | `src/components/ui/Input.tsx` | Native `<input>` | label, error, description, required |
| Textarea | `src/components/ui/Textarea.tsx` | Native `<textarea>` | Same as Input |
| Select | `src/components/ui/Select.tsx` | Radix Select | Native select fallback |
| Checkbox | `src/components/ui/Checkbox.tsx` | Radix Checkbox | label, description, error |
| RadioGroup/Radio | `src/components/ui/RadioGroup.tsx` | Radix Radio | options, direction |
| Switch | `src/components/ui/Switch.tsx` | Radix Switch | label, description |
| FormField | `src/components/ui/FormField.tsx` | Wrapper | label + control + error + description |
| SearchInput | `src/components/ui/SearchInput.tsx` | Input + Icon | debounce, placeholder |

### 3.2 Existing to Refactor (R3 Scope)

| Component | Action | Priority |
|-----------|--------|----------|
| Badge.tsx | Remove `default` variant, add focus-visible, fix `--radius-input` | P0 |
| Modal.tsx | Add focus-visible to close button, use `--radius-overlay` | P0 |
| Tabs.tsx | Add `--radius-sm`, focus-visible, arrow keys, `activationMode="manual"` | P0 |
| DropdownMenu.tsx | Verify arrow keys, Home/End, focus management | P0 |
| Tooltip.tsx | Verify Radix composition, focus-visible | P0 |
| DataTable.tsx | Add `aria-sort`, keyboard nav, virtualization | P1 |
| Pagination.tsx | Add `aria-label`, keyboard nav | P1 |
| ProgressBar.tsx | Add `--progress-height-*` tokens | P1 |
| PageHeader.tsx | Fix page-title size (1.5rem), use canonical badge variants | P0 |
| PageContainer.tsx | Verify token usage | P1 |
| Breadcrumb.tsx | Verify focus-visible, icon sizes | P1 |

### 3.3 New State Components (R3 Scope)

| Component | File | Purpose |
|-----------|------|---------|
| LoadingState | `src/components/ui/LoadingState.tsx` | Inline, button, page, table |
| Skeleton | `src/components/ui/Skeleton.tsx` | Text, card, table, avatar |
| EmptyState | `src/components/ui/EmptyState.tsx` | Icon, title, description, action |
| ErrorState | `src/components/ui/ErrorState.tsx` | Icon, title, message, retry |
| InlineError | `src/components/ui/InlineError.tsx` | Form field errors |
| NoResultsState | `src/components/ui/NoResultsState.tsx` | Table/list empty with filter context |

### 3.4 Toolbar/Filter System (R3 Scope)

| Component | File | Purpose |
|-----------|------|---------|
| Toolbar | `src/components/ui/Toolbar.tsx` | Flexible header with actions, search, filters |
| FilterBar | `src/components/ui/FilterBar.tsx` (refactor) | Select + label, accessible |
| FilterChip | `src/components/ui/FilterChip.tsx` | Removable filter pills |
| BulkActionBar | `src/components/ui/BulkActionBar.tsx` (refactor) | Selection actions with Button sm |

---

## 4. ACCESSIBILITY REQUIREMENTS (ALL COMPONENTS)

### 4.1 Mandatory for Every Component

- [ ] `focus-visible` styles using `--focus-ring-*` tokens
- [ ] `aria-disabled`, `aria-invalid`, `aria-required` where applicable
- [ ] `aria-label` / `aria-labelledby` for icon-only controls
- [ ] `aria-expanded`, `aria-controls`, `aria-haspopup` for expandable
- [ ] `aria-live` for dynamic content (loading, errors, toasts)
- [ ] Keyboard: Tab, Enter, Space, Escape, Arrow keys (where applicable)
- [ ] `prefers-reduced-motion` respected
- [ ] Touch targets ≥44×44px (or 40×40px for dense)
- [ ] Color contrast ≥4.5:1 (normal), ≥3:1 (large/non-text)

### 4.2 Component-Specific

| Component | Keyboard | ARIA |
|-----------|----------|------|
| Button | Enter, Space | `aria-disabled`, `aria-busy` (loading) |
| IconButton | Enter, Space | `aria-label`, `aria-expanded` |
| Input/Textarea | Tab, Enter | `aria-invalid`, `aria-describedby` (error), `aria-required` |
| Select | Tab, Enter, Space, Arrows | `aria-invalid`, `aria-required`, `aria-expanded` |
| Checkbox/Radio | Tab, Space | `aria-checked`, `aria-required` |
| Switch | Tab, Space, Enter | `aria-checked`, `aria-disabled` |
| Dialog/Modal | Tab (trap), Escape | `role="dialog"`, `aria-modal`, `aria-labelledby` |
| DropdownMenu | Arrows, Home/End, Escape, Tab | `role="menu"`, `aria-orientation`, `aria-expanded` |
| Tabs | Arrows, Home/End | `role="tablist"`, `aria-selected`, `aria-controls` |
| Tooltip | — | `role="tooltip"`, `aria-describedby` |
| DataTable | Arrows (row nav), Enter (action) | `aria-sort`, `role="grid"`, `role="row"` |
| Pagination | Arrows, Enter | `aria-label`, `aria-current` |
| Toast | Escape (dismiss) | `role="status"`, `aria-live="polite"` |

---

## 5. RESPONSIVE STANDARDS

### 4.1 Breakpoints (Consistent)

```css
--bp-mobile: 767px;      /* < 768px */
--bp-tablet: 1023px;     /* 768px - 1023px */
--bp-desktop: 1024px;    /* ≥ 1024px */
```

### 4.2 Component Behavior

| Component | Mobile (<768) | Tablet (768-1023) | Desktop (≥1024) |
|-----------|---------------|-------------------|-----------------|
| Button | Full width if primary action | Normal | Normal |
| Card | Full width, stacked | 2-col grid | Multi-col |
| DataTable | Horizontal scroll, card view | Horizontal scroll | Full table |
| Dialog/Modal | Full screen sheet | Centered, max-w-lg | Centered, max-w-lg |
| DropdownMenu | Bottom sheet | Dropdown | Dropdown |
| Tabs | Scrollable, indicator | Normal | Normal |
| Toolbar | Stacked, full width | Inline | Inline |

---

## 5. DARK MODE TOKENS

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #111827;
    --surface: #1F2937;
    --surface-hover: #374151;
    --border: #374151;
    --border-focus: #4B5563;
    --text-heading: #F9FAFB;
    --text-body: #E5E7EB;
    --text-muted: #9CA3AF;
    --primary: #F59E0B;
    --primary-hover: #FBBF24;
    --primary-light: #78350F;
    --success: #34D399;
    --success-light: #064E3B;
    --danger: #F87171;
    --danger-light: #7F1D1D;
    --warning: #FBBF24;
    --warning-light: #78350F;
    --info: #60A5FA;
    --info-light: #1E3A5F;
    --overlay-backdrop: rgba(0, 0, 0, 0.7);
  }
}
```

---

## 6. FILE OWNERSHIP MAP

### Phase 1: Foundation (Parallel — No Conflicts)

| Agent | Owns | Creates |
|-------|------|---------|
| **A6 — Action** | — | `Button.tsx`, `IconButton.tsx` |
| **A7 — Data Display** | `Badge.tsx` (refactor), `Modal.tsx` (refactor) | `Card.tsx`, `StatCard.tsx` |
| **A8 — Forms** | — | `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Checkbox.tsx`, `RadioGroup.tsx`, `Switch.tsx`, `FormField.tsx`, `SearchInput.tsx` |
| **A9 — Overlay/Nav** | `Tabs.tsx` (refactor), `DropdownMenu.tsx` (verify), `Tooltip.tsx` (verify) | `Dialog.tsx` (Modal alias) |
| **A10 — Data Table** | `DataTable.tsx` (refactor), `Pagination.tsx` (refactor) | `FilterBar.tsx` (refactor), `FilterChip.tsx`, `Toolbar.tsx`, `BulkActionBar.tsx` (refactor) |
| **A11 — State** | `ProgressBar.tsx` (tokenize) | `LoadingState.tsx`, `Skeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `InlineError.tsx`, `NoResultsState.tsx` |

### Phase 2: Integration (Sequential)

| Agent | Owns | Creates |
|-------|------|---------|
| **A7** | `PageHeader.tsx`, `PageContainer.tsx`, `Breadcrumb.tsx` | `Card.tsx`, `StatCard.tsx` |
| **A10** | `FilterBar.tsx`, `BulkActionBar.tsx` | `FilterChip.tsx`, `Toolbar.tsx` |
| **A11** | `ProgressBar.tsx` | `LoadingState.tsx`, `Skeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `InlineError.tsx`, `NoResultsState.tsx` |

### Phase 3: Token & CSS Fixes (A0 — Orchestrator)

| File | Changes |
|------|---------|
| `index.css` | Add all missing tokens (Section 1.1), color fixes (1.2), touch targets (1.3), dark mode (Section 5) |
| `package.json` | No new dependencies (use existing Radix) |

---

## 7. DEPENDENCY ORDER

```
Week 1: Token + CSS Fixes (A0) + Badge/Modal/Tabs refactor (A7/A9) + Button/IconButton (A6)
Week 2: Form Primitives (A8) + Card/StatCard (A7) + DataTable/Pagination/Filter (A10)
Week 3: State Components (A11) + Toolbar/BulkActionBar (A10) + PageHeader/PageContainer/Breadcrumb (A7)
Week 4: Integration Testing, A12 QA Audit, Documentation
```

---

## 8. ACCEPTANCE CRITERIA (Per Component)

| Component | Build | Lint | Test | A11y | Dark | Responsive | Visual |
|-----------|-------|------|------|------|------|------------|--------|
| Button | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| IconButton | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Card | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Badge | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Input | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Textarea | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Select | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Checkbox | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RadioGroup | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Switch | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FormField | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SearchInput | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modal/Dialog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tabs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tooltip | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DropdownMenu | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DataTable | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pagination | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| FilterBar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Toolbar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| LoadingState | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Skeleton | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| EmptyState | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ErrorState | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PageHeader | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PageContainer | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Breadcrumb | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 9. REGRESSION GUARDS

- No Flutter/mobile changes
- No backend/Firebase changes
- No Permission Engine changes
- No Auth architecture changes
- No Database/Storage changes
- All existing R2 shell components remain functional
- All 15 pages still render (lazy-loaded)

---

## 10. VISUAL REGRESSION BASELINE

**Canonical Reference:** `src/pages/MediaLibrary.tsx` (pre-R3 state)

**Components to Compare:**
- Buttons (all variants, sizes)
- Cards (default, hover, selected)
- Badges (all variants, sizes)
- Inputs (default, focus, error, disabled)
- Modals (default, confirm, full-screen)
- Dropdowns (default, with groups, separators)
- Tabs (default, vertical, with icons)
- Tables (default, sorting, selection, pagination)
- Empty/Error/Loading states

**Tools:** If Playwright/screenshot available → automated. Else → manual comparison report.

---

## 11. SIGN-OFF

**Agent 0 (Orchestrator):** Architecture contract approved. Implementation authorized per dependency order.

**Next Step:** Deploy Implementation Agents A6-A11 per Phase 1.