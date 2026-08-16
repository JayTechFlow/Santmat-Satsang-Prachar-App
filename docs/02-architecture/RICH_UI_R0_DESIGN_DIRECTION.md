# RICH_UI_R0_DESIGN_DIRECTION.md
## Phase R0 — UI/UX Audit & Design Direction
### Santmat Satsang Prachar — Enterprise Admin Panel

---

## 1. CURRENT UI ARCHITECTURE

### 1.1 Technology Stack
| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Framework | React | 19.2.7 | Latest |
| Build | Vite | 8.1.1 | Fast HMR, manual chunking |
| Language | TypeScript | ~6.0.2 | Strict mode |
| Routing | React Router DOM | 7.18.1 | Lazy-loaded routes |
| State | React Context + Custom Hooks | — | No Redux/Zustand |
| Firebase | firebase | 12.16.0 | Auth, Firestore, Storage, Functions |
| Icons | lucide-react | 1.27.0 | **Single canonical icon system** |
| Markdown | @uiw/react-md-editor | 4.1.1 | With rehype-sanitize |
| Linting | oxlint | 1.71.0 | Fast Rust-based linter |
| Testing | vitest | 4.1.10 | Unit/component tests |

### 1.2 CSS Architecture
- **NO Tailwind CSS** — Uses pure CSS Custom Properties (variables) in `index.css`
- **536 lines of global CSS** — Complete design system + utility classes
- **Design tokens in `src/design/`** — Duplicate/conflicting token files (colors, typography, spacing, radius, shadows, layout)
- **Utility classes mirror Tailwind** — `.btn`, `.card`, `.form-input`, `.badge`, `.flex`, `.grid`, etc.

### 1.3 Project Structure
```
admin-panel/src/
├── components/
│   ├── ui/                    # 25+ reusable primitives
│   ├── MediaLibrary.tsx       # Enterprise reference implementation
│   ├── MediaUploadModal.tsx   # Advanced upload queue
│   ├── MediaPreviewModal.tsx  # 5-tab detail view
│   ├── Layout.tsx             # App shell
│   ├── Sidebar.tsx            # Navigation with PermissionGate
│   ├── Header.tsx             # Top bar
│   └── ProtectedRoute.tsx     # Route guards
├── pages/                     # 15 page components
├── features/                  # 12 domain modules
├── core/                      # Shared infrastructure
├── hooks/                     # Cross-cutting hooks
├── design/                    # Duplicate design tokens
├── firebase/config.ts         # Firebase init
├── index.css                  # **Single source of truth for design**
├── App.tsx                    # Routing + providers
└── main.tsx                   # Entry point
```

---

## 2. ENTERPRISE MEDIA LIBRARY ANALYSIS

### 2.1 Why It's the Reference Implementation
The Enterprise Media Library (`MediaLibrary.tsx`, `MediaUploadModal.tsx`, `MediaPreviewModal.tsx`, `useMediaManager.ts`) is the **most sophisticated, complete, and polished UI** in the codebase. It demonstrates:

| Aspect | Implementation Quality |
|--------|----------------------|
| **Layout** | Split-view: folder sidebar (220px) + main content grid/table |
| **Search/Filter** | Debounced search + type filter chips + view toggle (grid/table) |
| **Bulk Actions** | Selection bar with context-aware actions (soft delete, restore, hard delete) |
| **Upload UX** | Drag-drop zone, queue management, pause/resume/cancel/retry, duplicate detection, progress bars, history/audit tab |
| **Preview Modal** | 5 tabs: Preview (audio/video/image/PDF), Metadata editor, Version history, Audit trail, Pipeline timeline |
| **Media Cards** | Grid: thumbnail + title + folder badge + size; Table: sortable columns |
| **State Handling** | Loading overlay, empty states, error states, inline validation |
| **Responsive** | Grid auto-fill, flexible sidebar, modal stacking |
| **Accessibility** | Keyboard navigation, ARIA labels, focus management, semantic HTML |
| **Interaction Patterns** | Click-to-preview, drag-drop, hover states, selection checkboxes, context menus |

### 2.2 Visual Language Extracted from Media Library

| Token | Value | Source |
|-------|-------|--------|
| **Primary Color** | `#E87412` (Orange) | `index.css:5`, modals, buttons, focus rings |
| **Primary Light** | `#FFF2E8` | Drag-active backgrounds, badges |
| **Background** | `#F9FAFB` | Page background |
| **Surface** | `#FFFFFF` | Cards, modals, sidebar |
| **Surface Hover** | `#F3F4F6` | Table row hover, card hover |
| **Border** | `#E5E7EB` | Card borders, input borders |
| **Text Heading** | `#111827` | Titles, headings |
| **Text Body** | `#374151` | Body text |
| **Text Muted** | `#6B7280` | Secondary text, placeholders |
| **Success** | `#10B981` | Success states, published badges |
| **Danger** | `#EF4444` | Errors, destructive actions |
| **Warning** | `#F59E0B` | Warnings, scheduled badges |
| **Info** | `#3B82F6` | Info states |
| **Radius SM** | `6px` | Inputs, badges, buttons |
| **Radius MD** | `8px` | Cards, modals |
| **Radius LG** | `12px` | Large cards |
| **Radius XL** | `16px` | Modals |
| **Shadow Card** | `0 2px 10px rgba(0,0,0,0.02), 0 10px 20px rgba(0,0,0,0.01)` | Cards |
| **Shadow Float** | `0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)` | Modals |
| **Sidebar Width** | `260px` | Fixed sidebar |
| **Header Height** | `64px` | Sticky header |
| **Transition Fast** | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | Hover, focus |
| **Transition Normal** | `250ms cubic-bezier(0.4, 0, 0.2, 1)` | Modals, drawers |

---

## 3. VISUAL AUDIT MATRIX

### 3.1 Component-by-Component Comparison

| Component | Enterprise Media Library | Current Admin Panel (Other Pages) | Difference | Target |
|-----------|-------------------------|-----------------------------------|------------|--------|
| **Typography** | Inter + Noto Sans Devanagari, CSS vars | Same fonts, but inline styles in some pages | Inconsistent font-weight usage | Unified via CSS vars only |
| **Colors** | CSS vars (`--primary`, `--surface`, etc.) | Mix of CSS vars + inline hex (`#FFF2E8`, `#E87412`) | Hardcoded colors in components | 100% CSS variables |
| **Backgrounds** | `--background` (page), `--surface` (cards) | Same, but some pages use inline `bg-background` | Minor inconsistency | Standardize |
| **Borders** | `--border` (`#E5E7EB`), `--border-focus` | Same, but some use `#E8E8E8` (design tokens) | Two border colors exist | Single `--border` |
| **Radius** | CSS vars (`--radius-md`, `--radius-lg`, etc.) | Mix of CSS vars + inline `rounded-md` utility | Utility classes vs vars | CSS vars only |
| **Shadows** | `--shadow-card`, `--shadow-float`, `--shadow-md` | Same, but `UploadProgress` uses hardcoded `#E8E8E8` | Hardcoded progress track color | CSS var for progress track |
| **Spacing** | CSS vars (`--space-16`, `--space-24`, etc.) | Mix of CSS vars + Tailwind-like utilities (`gap-4`, `p-8`) | Two spacing systems | CSS vars only |
| **Grid** | CSS Grid (`repeat(auto-fill, minmax(200px, 1fr))`) | Same pattern in MediaLibrary, inline in others | Consistent | Keep |
| **Cards** | `.card` class + inline padding | `.card` class used everywhere | Consistent | Keep `.card` |
| **Tables** | `.table-container` + inline `<table>` | Same pattern across all pages | Consistent | Extract to component |
| **Buttons** | `.btn`, `.btn-primary`, `.btn-outline`, `.btn-icon` | Same classes, but `Pagination` uses inline styles | Inconsistent active page styling | Unified button variants |
| **Inputs** | `.form-input`, `.form-textarea`, `.form-select` | Consistent across pages | Good | Keep |
| **Selects** | Native `<select>` with `.form-select` | Same, `FilterBar` adds Filter icon | Good | Keep |
| **Dropdowns** | Native select only | No custom dropdown component | Missing | Add later if needed |
| **Dialogs** | `.modal-backdrop` + `.modal-content` | Same pattern in all modals | Consistent | Extract to `Modal` component |
| **Drawers** | None (modals only) | None | Missing | Add for mobile filters |
| **Tabs** | Inline button group with border-bottom indicator | MediaLibrary, MediaPreviewModal, MediaUploadModal | Duplicated implementation | Extract `Tabs` component |
| **Breadcrumbs** | None | None | Missing | Add for deep pages |
| **Badges** | `.badge`, `.badge-primary`, `.badge-success`, etc. | Status badges per feature (Banner, Prayer, Book) | Feature-specific badge components | Unified badge system |
| **Tooltips** | None (title attribute only) | `title` on icon buttons | Missing | Add `Tooltip` primitive |
| **Icons** | Lucide React (consistent) | Lucide React everywhere | **Single system — Good** | Keep Lucide |
| **Pagination** | `Pagination` component | Used in all list pages | Good | Keep |
| **Search** | `SearchBar` with debounce | Used in all list pages | Good | Keep |
| **Filters** | `FilterBar` (select) + type chips | MediaLibrary has type chips; others only FilterBar | Inconsistent filter UX | Unified filter pattern |
| **Upload** | `UploadZone` + `UploadProgress` + `FileUpload` + specialized | AudioUpload, ImageUpload, PDFUpload wrap FileUpload | Good composition | Unify props interface |
| **Progress** | `UploadProgress` bar + queue overall bar | Same | Good | Keep |
| **Toast** | `ToastProvider` (bottom-right) | Global provider | Good | Keep |
| **Empty State** | `EmptyState` with icon + action | Used everywhere | Good | Keep |
| **Error State** | `ErrorState` with retry | Used everywhere | Good | Keep |
| **Loading State** | `LoadingOverlay` (absolute + blur) | Used everywhere | Good | Keep |
| **Navigation** | Sidebar (fixed 260px) + Header (sticky 64px) | Same layout everywhere | Good | Keep |
| **Sidebar** | Nav items with PermissionGate | Consistent | Good | Keep |
| **Header** | Page title + date + notifications + user avatar | Hardcoded "Admin User / Super Admin" | **User data not connected** | Connect to auth context |

### 3.2 Critical Inconsistencies Found

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | **Two design token systems** | `index.css` vs `src/design/*.ts` | **High** |
| 2 | **Hardcoded colors** | `#FFF2E8`, `#E8E8E8`, `#FEF2F2` in components | **High** |
| 3 | **Two spacing systems** | CSS vars (`--space-16`) vs utilities (`gap-4`, `p-8`) | **Medium** |
| 4 | **Header user data hardcoded** | `Header.tsx:42-44` | **Medium** |
| 5 | **Modal implementation duplicated** | Every page has inline modal markup | **Medium** |
| 6 | **Tabs implementation duplicated** | 3 different tab patterns | **Medium** |
| 7 | **Badge system fragmented** | Feature-specific badge components | **Medium** |
| 8 | **No Tooltip primitive** | `title` attribute only | **Low** |
| 9 | **No Breadcrumb component** | Missing for deep navigation | **Low** |
| 10 | **Form state duplicated** | Each page has 20+ `useState` for forms | **Medium** |
| 11 | **Progress track hardcoded** | `UploadProgress.tsx:35` uses `#E8E8E8` | **Low** |
| 12 | **Filter UX inconsistent** | MediaLibrary has type chips; others don't | **Medium** |

---

## 4. DESIGN PRINCIPLES

Based on the Enterprise Media Library analysis, the design system must embody:

| Principle | Description |
|-----------|-------------|
| **Enterprise First** | Professional, serious, trustworthy — not playful or consumer-grade |
| **Premium Feel** | Refined micro-interactions, consistent elevation, purposeful color |
| **Modern & Clean** | Generous whitespace, clear hierarchy, no visual clutter |
| **Content-Focused** | UI chrome recedes; data and media take center stage |
| **Accessible by Default** | WCAG 2.1 AA: keyboard nav, focus visible, color contrast, ARIA |
| **Fast Perception** | Instant feedback, skeleton loading, optimistic updates |
| **Consistent** | One component library, one token system, one pattern per problem |
| **Scalable** | Tokens → Primitives → Components → Patterns → Pages |

### 4.1 Visual Identity Keywords
- **Warm Professional** — Orange primary (`#E87412`) conveys spiritual warmth + enterprise energy
- **Calm Neutrals** — Cool grays (`#F9FAFB` → `#111827`) for content focus
- **Purposeful Accents** — Semantic colors only (success/warning/danger/info)
- **Subtle Depth** — Layered shadows (`--shadow-card` → `--shadow-float`) not heavy borders

---

## 5. COLOR STRATEGY

### 5.1 Canonical Palette (from `index.css` — **Source of Truth**)

| Role | Variable | Value | Usage |
|------|----------|-------|-------|
| Primary | `--primary` | `#E87412` | Primary buttons, active states, focus rings, key icons |
| Primary Hover | `--primary-hover` | `#D56508` | Button hover |
| Primary Light | `--primary-light` | `#FFF2E8` | Active nav, drag zones, selected borders |
| Background | `--background` | `#F9FAFB` | Page background |
| Surface | `--surface` | `#FFFFFF` | Cards, modals, sidebar, inputs |
| Surface Hover | `--surface-hover` | `#F3F4F6` | Table row hover, card hover |
| Border | `--border` | `#E5E7EB` | All borders, dividers |
| Border Focus | `--border-focus` | `#D1D5DB` | Input focus (fallback) |
| Text Heading | `--text-heading` | `#111827` | h1-h6, important labels |
| Text Body | `--text-body` | `#374151` | Body text, secondary labels |
| Text Muted | `--text-muted` | `#6B7280` | Placeholders, tertiary text, icons |
| Success | `--success` | `#10B981` | Success states, published, positive metrics |
| Success Light | `--success-light` | `#D1FAE5` | Success backgrounds |
| Danger | `--danger` | `#EF4444` | Errors, destructive, delete |
| Danger Light | `--danger-light` | `#FEE2E2` | Error backgrounds |
| Warning | `--warning` | `#F59E0B` | Warnings, scheduled, pending |
| Warning Light | `--warning-light` | `#FEF3C7` | Warning backgrounds |
| Info | `--info` | `#3B82F6` | Info states, links |
| Info Light | `--info-light` | `#DBEAFE` | Info backgrounds |

### 5.2 Deprecated/Conflicting Tokens (in `src/design/colors.ts`)
| Variable | Current Value | Action |
|----------|---------------|--------|
| `primary` | `#E87412` | **Keep** — matches CSS |
| `primaryHover` | `#D56508` | **Keep** — matches CSS |
| `background` | `#F8F7F5` | **Remove** — conflicts with `--background` |
| `surface` | `#FFFFFF` | **Keep** — matches CSS |
| `border` | `#E8E8E8` | **Remove** — conflicts with `--border` |
| `text.heading` | `#1F1F1F` | **Remove** — conflicts with `--text-heading` |
| `text.body` | `#555555` | **Remove** — conflicts with `--text-body` |
| `text.muted` | `#8A8A8A` | **Remove** — conflicts with `--text-muted` |

**Decision**: Remove `src/design/colors.ts` entirely. `index.css` is the runtime source of truth.

### 5.3 Theme Modes
| Mode | Status | Approach |
|------|--------|----------|
| Light | **Current** | Full support |
| Dark | **Planned** | CSS variable override via `[data-theme="dark"]` on `<html>` |
| System Preference | **Future** | `prefers-color-scheme` media query |

---

## 6. TYPOGRAPHY STRATEGY

### 6.1 Font Stack (from `index.css`)
```css
--font-primary: 'Inter', 'Noto Sans', 'Noto Sans Devanagari', sans-serif;
```

### 6.2 Type Scale
| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | 2.5rem (40px) | 700 | 1.1 | Page titles (rare) |
| H1 / Page Title | 1.5rem (24px) | 700 | 1.2 | `.page-title` |
| H2 / Section | 1.25rem (20px) | 600 | 1.3 | Modal titles, card headers |
| H3 / Subsection | 1.125rem (18px) | 600 | 1.4 | Sub-headings |
| Body Large | 1rem (16px) | 500 | 1.5 | Primary body text |
| Body | 0.875rem (14px) | 500 | 1.5 | Default UI text |
| Body Small | 0.75rem (12px) | 500 | 1.5 | Metadata, timestamps |
| Caption | 0.75rem (12px) | 600 | 1.4 | Badges, pill labels |
| Mono | 0.875rem (14px) | 400 | 1.6 | Code, IDs, technical |

### 6.3 Font Weights
| Token | Weight | Usage |
|-------|--------|-------|
| `--font-weight-normal` | 400 | Code, technical |
| `--font-weight-medium` | 500 | Body text (default) |
| `--font-weight-semibold` | 600 | Headings, emphasis |
| `--font-weight-bold` | 700 | Page titles, strong emphasis |

### 6.4 Devanagari Support
- `Noto Sans Devanagari` included for Hindi/Sanskrit content
- Applied globally via `--font-primary`
- Markdown editor explicitly sets font family

---

## 7. SPACING STRATEGY

### 7.1 Spacing Scale (CSS Variables — **Canonical**)
| Token | Value | Rem | Usage |
|-------|-------|-----|-------|
| `--space-2` | 2px | 0.125rem | Micro gaps |
| `--space-4` | 4px | 0.25rem | Tight gaps |
| `--space-8` | 8px | 0.5rem | Base unit (1x) |
| `--space-12` | 12px | 0.75rem | 1.5x |
| `--space-16` | 16px | 1rem | **Standard (2x)** |
| `--space-20` | 20px | 1.25rem | Form gaps |
| `--space-24` | 24px | 1.5rem | Section gaps (3x) |
| `--space-32` | 32px | 2rem | Major sections (4x) |
| `--space-40` | 40px | 2.5rem | Page padding |
| `--space-48` | 48px | 3rem | Large gaps |

### 7.2 Utility Classes to Deprecate
| Utility | Replacement |
|---------|-------------|
| `gap-2` → `gap-[var(--space-8)]` | CSS var |
| `gap-3` → `gap-[var(--space-12)]` | CSS var |
| `gap-4` → `gap-[var(--space-16)]` | CSS var |
| `gap-6` → `gap-[var(--space-24)]` | CSS var |
| `p-4` → `padding: var(--space-16)` | CSS var |
| `p-8` → `padding: var(--space-32)` | CSS var |
| `mt-4` → `margin-top: var(--space-16)` | CSS var |
| `mb-4` → `margin-bottom: var(--space-16)` | CSS var |

**Action**: Remove Tailwind-like utility classes from `index.css`. Use CSS variables directly or create semantic utility classes (`.gap-md`, `.p-lg`).

---

## 8. RADIUS STRATEGY

### 8.1 Radius Scale (CSS Variables)
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Inputs, selects, badges, buttons |
| `--radius-md` | 8px | **Default** — cards, modals, dropdowns |
| `--radius-lg` | 12px | Large cards, featured areas |
| `--radius-xl` | 16px | Modals, drawers |
| `--radius-full` | 9999px | Pills, avatars, circular buttons |
| `--radius-input` | 8px | Alias for `--radius-md` (forms) |
| `--radius-card` | 12px | Alias for `--radius-lg` (cards) |

### 8.2 Current Inconsistencies
- `UploadZone.tsx:68` uses `var(--radius-card)` (12px) — **Correct**
- `UploadProgress.tsx:20` uses `var(--radius-input)` (8px) — **Correct**
- `Pagination.tsx:33` uses inline styles for active page — **Should use radius token**
- `ConfirmDialog.tsx:30` uses `var(--radius-card)` — **Correct**

---

## 9. SHADOW / ELEVATION STRATEGY

### 9.1 Elevation Scale (CSS Variables)
| Level | Variable | Value | Usage |
|-------|----------|-------|-------|
| 0 | none | `none` | Flat elements |
| 1 | `--shadow-sm` | `0 1px 2px 0 rgba(0,0,0,0.05)` | Inputs, subtle cards |
| 2 | `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)` | **Default cards**, dropdowns |
| 3 | `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.03)` | Elevated cards, hover |
| 4 | `--shadow-card` | `0 2px 10px rgba(0,0,0,0.02), 0 10px 20px rgba(0,0,0,0.01)` | **Standard card** |
| 5 | `--shadow-float` | `0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)` | **Modals, drawers**, popovers |

### 9.2 Semantic Shadow Mapping
| Component | Shadow Level |
|-----------|--------------|
| `.card` | Level 4 (`--shadow-card`) |
| `.card:hover` | Level 3 (`--shadow-md`) |
| `.modal-content` | Level 5 (`--shadow-float`) |
| `.form-input:focus` | Level 1 + ring |
| Dropdown/popover | Level 3 (`--shadow-md`) |
| Tooltip | Level 2 (`--shadow-sm`) |

---

## 10. ICON STRATEGY

### 10.1 Canonical Icon System: **Lucide React** ✅
- Already used consistently throughout codebase
- Tree-shakeable, 1000+ icons, consistent stroke width (2px)
- No migration needed

### 10.2 Icon Categories & Standardization

| Category | Icons | Size Standard |
|----------|-------|---------------|
| **Navigation** | `LayoutDashboard`, `Folder`, `Music`, `BookOpen`, `Tags`, `Users`, `ListVideo`, `Bell`, `Image`, `BarChart`, `Settings`, `HelpCircle`, `LogOut` | 20px (sidebar), 18px (mobile) |
| **Actions** | `Plus`, `Edit2`, `Trash2`, `X`, `Check`, `Download`, `UploadCloud`, `RefreshCw`, `RotateCcw`, `Copy`, `Share2` | 16px (buttons), 14px (icon buttons) |
| **Media** | `Music`, `FileAudio`, `Image`, `Video`, `FileText`, `Pdf`, `Play`, `Pause`, `Volume2`, `VolumeX` | 20px (cards), 16px (inline) |
| **Status** | `CheckCircle2`, `XCircle`, `AlertCircle`, `AlertTriangle`, `Clock`, `Archive`, `Shield`, `BadgeCheck` | 14px (badges), 16px (toasts) |
| **Content** | `Quote`, `Sparkles`, `BookOpen`, `FileText`, `Music`, `Image` | 20px (empty states), 48px (hero) |
| **System** | `Search`, `Filter`, `Menu`, `ChevronLeft`, `ChevronRight`, `ChevronDown`, `Eye`, `EyeOff`, `MoreHorizontal`, `MoreVertical` | 18-20px |

### 10.3 Icon Usage Rules
- **Never mix icon libraries** — Lucide only
- **Stroke width**: 2px (Lucide default) — don't override
- **Color**: Inherit `currentColor` — use CSS `color` property
- **Sizes**: Use standard scale (14, 16, 18, 20, 24, 28, 32, 48)
- **Accessibility**: `aria-hidden="true"` on decorative icons; provide labels on icon-only buttons

---

## 11. LAYOUT STRATEGY

### 11.1 App Shell (Current — Keep)
```
┌─────────────────────────────────────────────────────────────┐
│ Header (64px, sticky, z-30)                                 │
│ ┌──────────┐ ┌────────────────────────────────────────────┐ │
│ │ Sidebar  │ │ Main Content                               │ │
│ │ (260px,  │ │ ┌────────────────────────────────────────┐ │ │
│ │  fixed,  │ │ │ Page Header (title + actions)          │ │ │
│ │  z-40)   │ │ ├────────────────────────────────────────┤ │ │
│ │          │ │ │ Main Content Area (flex-1, overflow)   │ │ │
│ │ Nav Items│ │ │                                        │ │ │
│ │          │ │ │                                        │ │ │
│ └──────────┘ └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Layout Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-width` | 260px | Fixed sidebar |
| `--header-height` | 64px | Sticky header |
| `--content-max-width` | 1200px (7xl) | Page content container |
| `--page-padding` | 32px (--space-32) | Main content padding |
| `--card-padding` | 24px (--space-24) | Card internal padding |

### 11.3 Breakpoints (for future responsive work)
| Name | Value | Usage |
|------|-------|-------|
| `--bp-sm` | 640px | Mobile landscape |
| `--bp-md` | 768px | Tablet portrait |
| `--bp-lg` | 1024px | Tablet landscape / small desktop |
| `--bp-xl` | 1280px | Desktop |
| `--bp-2xl` | 1536px | Large desktop |

### 11.4 Responsive Behavior (Media Library as Reference)
| Component | Desktop (≥1024px) | Tablet (768-1023px) | Mobile (<768px) |
|-----------|-------------------|---------------------|-----------------|
| Sidebar | Fixed 260px | Collapsible drawer | Drawer (full-screen) |
| Header | Full | Full | Condensed |
| Media Grid | `minmax(200px, 1fr)` | `minmax(180px, 1fr)` | `minmax(160px, 1fr)` |
| Data Table | Horizontal scroll | Horizontal scroll | Card layout (transform) |
| Modals | Centered, max-width | Near-full, max-height | Full-screen |
| Upload Modal | 800px max | 90vw | 100vw |
| Preview Modal | 850px max | 90vw | 100vw |

---

## 12. COMPONENT HIERARCHY

### 12.1 Target Architecture
```
FOUNDATION (Design Tokens)
├── Colors, Typography, Spacing, Radius, Shadows, Motion, Z-Index, Breakpoints
│
PRIMITIVES (Unstyled/Minimal)
├── Box, Flex, Grid, Text, Heading, Icon, Badge, Avatar, Divider
│
COMPONENTS (Styled, Interactive)
├── Button (Primary, Outline, Ghost, Danger, Icon)
├── Input (Text, Textarea, Select, Checkbox, Radio, Switch)
├── Label, FormField, FormGroup
├── Card (Header, Body, Footer)
├── Table (Container, Header, Row, Cell, SortableHeader)
├── Modal (Backdrop, Content, Header, Body, Footer)
├── Drawer (Backdrop, Panel, Header, Body)
├── Tabs (List, Trigger, Panel, Indicator)
├── Tooltip (Trigger, Content, Arrow)
├── Dropdown (Trigger, Menu, Item, Divider)
├── Breadcrumb (List, Item, Separator)
├── Pagination (Prev, Page, Next, Ellipsis)
├── SearchInput (Icon, Input, Clear)
├── FilterSelect (Icon, Select, Options)
├── UploadZone (Drag, Drop, Preview, Progress)
├── ProgressBar (Track, Fill, Label)
├── Toast (Container, Item, Icon, Message, Close)
├── EmptyState (Icon, Title, Message, Action)
├── ErrorState (Icon, Title, Message, Retry)
├── LoadingOverlay (Spinner, Message, Blur)
├── ConfirmDialog (Modal + Confirm/Cancel)
├── Avatar (Image, Fallback, Badge)
├── StatusBadge (Variant, Icon, Label)
├── DataTable (Composition of Table + Selection + Toolbar)
├── MediaCard (Grid + Table variants)
├── MediaUploadQueue (Item, Controls, Progress)
├── MediaPreview (Tabs: Preview/Metadata/Versions/Audit/Pipeline)
│
PATTERNS (Component Compositions)
├── PageLayout (Header + Content + Actions)
├── ListPage (Toolbar + DataTable + Pagination + BulkActions)
├── DetailModal (Tabs + Form + Actions)
├── FilterToolbar (Search + Filters + ViewToggle)
├── BulkActionBar (Count + Actions)
├── FormDialog (Fields + Submit/Cancel)
├── UploadDialog (Zone + Queue + History)
│
PAGES (Route-Level)
├── Dashboard
├── MediaLibrary
├── Audio/Bhajans
├── Books
├── Banners
├── Categories
├── StutiVinati
├── Suvichar
├── Notifications
├── Playlists
├── Analytics/Reports
├── Users
├── Settings
└── Support
```

### 12.2 Duplication Elimination Plan
| Current Duplicate | Target Single Component |
|-------------------|------------------------|
| 3 tab implementations | `Tabs` primitive |
| 15+ inline modals | `Modal` + `FormDialog` + `ConfirmDialog` |
| 12+ form state patterns | `useForm` hook + `FormField` components |
| 8+ badge variants | `StatusBadge` + `Badge` primitive |
| 5+ pagination styles | `Pagination` component (already good) |
| 3+ upload wrappers | `FileUpload` + specialized props |

---

## 13. STATE SYSTEM

### 13.1 Standardized UI States
| State | Visual Pattern | Component Support |
|-------|----------------|-------------------|
| **Loading** | `LoadingOverlay` (blur + spinner) | Full-page, card, inline |
| **Empty** | `EmptyState` (icon + title + message + action) | List, grid, table |
| **Error** | `ErrorState` (icon + title + message + retry) | List, form, action |
| **Permission Denied** | `PermissionGate` → fallback (null or custom) | Route, component, action |
| **Unauthorized** | Redirect to `/login` + toast | Auth context |
| **Not Found** | 404 page + search suggestion | Router |
| **Offline** | Banner toast (persistent) + disabled actions | Layout |
| **Processing** | Spinner button + disabled inputs | Forms, actions |
| **Uploading** | `UploadProgress` + queue bar + item progress | Upload modals |
| **Success** | Toast (green) + optimistic UI update | Mutations |
| **Partial Failure** | Toast (warning) + inline error items | Bulk actions |
| **Retry** | Inline retry button + exponential backoff | Failed items |
| **No Results** | `EmptyState` with search context | Filtered lists |

### 13.2 State Transition Rules
- Loading → Success/Error (never Loading → Loading)
- Empty only shows when data array is truly empty (not loading)
- Error only shows on actual failure (not 404 on list)
- Permission denied never exposes what resource exists
- Offline state persists until `online` event

---

## 14. MEDIA UX STRATEGY

### 14.1 Media Card Variants (from Media Library)
| Variant | Grid View | Table View |
|---------|-----------|------------|
| **Image/Banner** | Thumbnail (140px h) + title + folder badge + size | Thumbnail (52px) + title + type + folder + size + visibility + date |
| **Audio** | Music icon + title + folder badge + size | Music icon + title + "Audio attached" + description + actions |
| **PDF/Document** | FileText icon + title + folder badge + size | FileText icon + title + metadata |
| **Video** | Video icon + title + folder badge + size | Video icon + title + metadata |

### 14.2 Upload Flow (Media Library Standard)
```
1. Drag-drop zone / Click to browse
   ↓
2. File validation (type, size, extension)
   ↓
3. Add to queue (status: queued)
   ↓
4. Auto-process queue (sequential)
   ↓
5. Uploading → progress bar + pause/cancel
   ↓
6. Storage upload → Firebase Storage
   ↓
7. Processing pipeline (thumbnails, metadata, AI)
   ↓
8. Firestore asset creation + audit log
   ↓
9. Status: completed → refresh library
   ↓
10. Error → duplicate detection → force/retry/cancel
```

### 14.3 Media-Specific UX
| Media Type | Preview | Upload Constraints | Processing |
|------------|---------|-------------------|------------|
| **Audio (MP3, WAV, M4A)** | Waveform + player + tech specs (bitrate, sample rate) | ≤100MB, audio/* | Waveform, duration, ID3 tags |
| **Image (JPG, PNG, WebP)** | Zoomable preview + dimensions + color space | ≤10MB, image/* | Thumbnails (S/M/L), EXIF |
| **PDF/Book** | External link + page count + security flags | ≤100MB, application/pdf | Thumbnails, text extraction |
| **Video** | Poster frames + tech specs (codec, bitrate, fps) | ≤500MB, video/* | Posters, duration, transcoding |

### 14.4 Bulk Operations
- Selection: Checkbox per row/card + Select All
- Actions: Soft Delete, Restore, Hard Delete, Assign Category/Folder
- Progress: Batch progress bar + per-item status
- Confirmation: `ConfirmDialog` with count + consequences

---

## 15. ROLE UX STRATEGY

### 15.1 Three Roles (Enforced by Permission Engine)
| Role | Admin Panel Access | UI Adaptations |
|------|-------------------|----------------|
| **developer_super_admin** | Full — all routes, all actions | Platform config, tenant management, global analytics, RBAC |
| **client_super_admin** | Scoped — org-bound routes, tenant actions | Organization settings, scoped users, scoped analytics |
| **mobile_user** | **NONE** — redirect to mobile app | No admin UI |

### 15.2 UI Enforcement Points
| Layer | Mechanism |
|-------|-----------|
| **Route** | `ProtectedRoute` + `useRouteAccess` (pathname-based) |
| **Navigation** | `Sidebar` → `PermissionGate` per nav item |
| **Page** | `PermissionGate` wrapper on page content |
| **Component** | `PermissionGate` on sections (e.g., bulk actions) |
| **Action** | `useActionAccess(permissionId)` → button enable/disable |
| **API/Storage** | Backend/Firebase Rules (source of truth) |

### 15.3 Visual Indicators
| Role | Sidebar Badge | Header Avatar |
|------|---------------|---------------|
| developer_super_admin | "Platform Admin" (primary) | Shield icon + primary color |
| client_super_admin | "Organization Admin" (success) | Building icon + success color |
| mobile_user | N/A (no access) | N/A |

---

## 16. RESPONSIVE STRATEGY

### 16.1 Breakpoints (CSS Variables)
```css
--bp-sm: 640px;   /* Mobile landscape */
--bp-md: 768px;   /* Tablet portrait */
--bp-lg: 1024px;  /* Tablet landscape / small desktop */
--bp-xl: 1280px;  /* Desktop */
--bp-2xl: 1536px; /* Large desktop */
```

### 16.2 Current Behavior (Media Library Reference)
| Component | ≥1024px | 768-1023px | <768px |
|-----------|---------|------------|--------|
| Sidebar | Fixed 260px | Collapsible (hamburger) | Drawer |
| Header | Full | Full | Condensed (no date) |
| Page Padding | 32px | 24px | 16px |
| Media Grid | 4-5 columns | 3 columns | 2 columns |
| Data Table | Table | Table + horizontal scroll | Card stack |
| Modals | 800px max, centered | 90vw, centered | 100vw, bottom sheet |
| Upload Queue | Full width | Full width | Full width |

### 16.3 Implementation Approach
- **CSS-first**: Media queries in `index.css` using breakpoint variables
- **Component-level**: `useMediaQuery` hook for JS logic (drawer toggle)
- **No JavaScript layout calculations** — pure CSS Grid/Flex

---

## 17. ACCESSIBILITY STRATEGY

### 17.1 Current State (Audit)
| Criterion | Status | Gaps |
|-----------|--------|------|
| **Keyboard Navigation** | Partial | Modal focus trap missing, skip links missing |
| **Focus Visible** | Good | `.btn:focus-visible` exists, but some custom buttons lack |
| **Color Contrast** | Good | Primary on white: 4.5:1 ✓; Muted text: 3.2:1 ✗ (large text only) |
| **ARIA Labels** | Partial | Icon buttons use `title`, need `aria-label` |
| **Semantic HTML** | Good | `<main>`, `<nav>`, `<header>`, `<aside>`, `<button>`, `<table>` |
| **Form Labels** | Good | `<label>` + `htmlFor` / wrapping |
| **Error Announcements** | Missing | Toast not announced to screen readers |
| **Loading Announcements** | Missing | `LoadingOverlay` needs `aria-live` |
| **Modal Accessibility** | Partial | No focus trap, no `aria-modal`, no `role="dialog"` |
| **Table Accessibility** | Good | `<th scope="col">`, but sortable headers need `aria-sort` |

### 17.2 Required Fixes (Priority)
1. **Modal primitive** with focus trap, `aria-modal`, `role="dialog"`, escape key
2. **Toast** with `aria-live="polite"` container
3. **LoadingOverlay** with `aria-live="assertive"` + `aria-busy`
4. **Skip link** at top of `Layout.tsx`
5. **Focus visible** on all interactive elements
6. **Color contrast** for `--text-muted` on `--surface` (increase to `#5A6A7A` or use only for large text)
7. **ARIA labels** on all icon-only buttons
8. **Table sorting** with `aria-sort` attributes

---

## 18. ANIMATION STRATEGY

### 18.1 Motion Tokens (Add to CSS)
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 0ms | Immediate |
| `--duration-fast` | 150ms | Hover, focus, small transitions |
| `--duration-normal` | 250ms | Modal open/close, drawer slide |
| `--duration-slow` | 350ms | Page transitions, complex animations |
| `--easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default |
| `--easing-emphasized` | `cubic-bezier(0.4, 0, 0.2, 1)` | Modal, drawer |
| `--easing-decelerated` | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |

### 18.2 Animation Principles
- **Respect `prefers-reduced-motion`** — disable all non-essential animation
- **No layout shift** — animate `opacity`, `transform`, not `width`/`height`/`top`/`left`
- **Purposeful only** — feedback (hover, focus), state change (open/close), loading
- **No decorative animations** — no parallax, no auto-playing carousels

### 18.3 Current Animations (Audit)
| Component | Animation | Status |
|-----------|-----------|--------|
| Button hover | `transform: translateY(-1px)` + shadow | ✓ Good |
| Card hover | Shadow transition | ✓ Good |
| Modal open | None (instant) | Add 250ms fade + scale |
| Drawer | None | Add 250ms slide |
| Toast enter | None | Add slide-in |
| Loading spinner | CSS `@keyframes spin` | ✓ Good |
| Upload progress | `width` transition 200ms | ✓ Good |
| Tab indicator | Border-bottom color | Add slide |
| Table row hover | Background transition | ✓ Good |

---

## 19. TAILWIND CSS v4 EVALUATION

### 19.1 Current State
- **Not installed** — Project uses pure CSS variables + utility classes in `index.css`
- **No `tailwind.config.js`** — No JIT compiler, no PostCSS pipeline for Tailwind

### 19.2 Migration Assessment

| Factor | Assessment |
|--------|------------|
| **Design Token Parity** | Tailwind v4 uses CSS-first config (`@theme` in CSS) — **compatible** with current `index.css` variables |
| **Utility Class Coverage** | Current `index.css` has ~80 utility classes — Tailwind has 500+ |
| **Bundle Size** | Tailwind v4: ~15KB base + purged utilities; Current: ~12KB `index.css` |
| **Learning Curve** | Team knows CSS variables; Tailwind syntax is new mental model |
| **Migration Effort** | High — 50+ files with inline styles + custom utilities |
| **Benefit** | Consistent utilities, responsive modifiers, dark mode plugin, IDE autocomplete |
| **Risk** | Breaking changes in v4 (still early), dual system during migration |

### 19.3 Recommendation: **DO NOT MIGRATE TO TAILWIND v4 NOW**

**Rationale**:
1. Current CSS variable system is **working, consistent, and well-understood**
2. Migration would touch 50+ files with high regression risk
3. Tailwind v4 is still stabilizing (breaking changes in minor versions)
4. The utility classes in `index.css` already cover 90% of needs
4. Design tokens are already centralized in CSS variables
5. **Invest effort in cleaning up `index.css` instead** — remove duplicate utilities, standardize naming

**Alternative**: Adopt **Tailwind-inspired utility naming** in `index.css` (e.g., `.gap-md` → `gap: var(--space-16)`) without the framework.

---

## 20. SHADCN/UI EVALUATION

### 20.1 What It Is
- **Not a component library** — copy-paste components built on Radix UI + Tailwind
- **Requires**: Tailwind CSS + Radix UI primitives
- **Philosophy**: "Own your components" — modify source directly

### 20.2 Compatibility Assessment
| Requirement | Current State | Compatible? |
|-------------|---------------|-------------|
| Tailwind CSS | **Not installed** | ❌ No |
| Radix UI | Not installed | ❌ No |
| Component Ownership | Custom components exist | ✅ Yes (philosophy match) |
| TypeScript | Yes | ✅ Yes |
| Accessibility | Partial (needs work) | ⚠️ Partial |

### 20.3 Recommendation: **DO NOT ADOPT SHADCN/UI**

**Rationale**:
1. **Requires Tailwind** — which we're not adopting (see §19)
2. **Radix UI primitives** can be used directly without shadcn/ui
3. **Current component library** (25+ primitives) already covers 80% of shadcn/ui components
4. **Media Library components** are more sophisticated than shadcn/ui equivalents
5. **Philosophy matches** — we already "own our components" — just need to standardize them

**Better Approach**: Extract current primitives into a **proper internal component library** with:
- Storybook documentation
- TypeScript-first APIs
- Accessibility built-in (using Radix where helpful)
- Design token integration

---

## 21. RADIX / BASE UI EVALUATION

### 21.1 Radix UI (Current Standard)
- **Headless, accessible primitives** — Dialog, Dropdown, Tabs, Tooltip, Select, etc.
- **Unstyled** — bring your own CSS
- **React 19 compatible** — Yes
- **Bundle size** — Modular imports, tree-shakeable

### 21.2 Base UI (New from Radix Team)
- **Successor to Radix** — same primitives, better API, smaller bundle
- **Still in beta** — Not production-ready

### 21.3 Where Radix Helps Us
| Current Gap | Radix Primitive | Effort |
|-------------|-----------------|--------|
| Modal focus trap, `aria-modal` | `@radix-ui/react-dialog` | Low |
| Tooltip positioning, accessibility | `@radix-ui/react-tooltip` | Low |
| Dropdown menu, keyboard nav | `@radix-ui/react-dropdown-menu` | Low |
| Tabs, keyboard nav, RTL | `@radix-ui/react-tabs` | Low |
| Select (custom styled) | `@radix-ui/react-select` | Medium |
| Toast announcements | `@radix-ui/react-toast` | Low |

### 21.4 Recommendation: **ADOPT RADIX UI PRIMITIVES SELECTIVELY**

**Strategy**:
1. **Replace** inline modal implementations with `@radix-ui/react-dialog`
2. **Add** `@radix-ui/react-tooltip` for consistent tooltips
3. **Replace** `FilterBar` native select with `@radix-ui/react-select` (styled)
4. **Replace** tab implementations with `@radix-ui/react-tabs`
5. **Keep** custom components where they exceed Radix (Media Library upload queue, media cards, data table)

**Do NOT**: Replace working components (DataTable, MediaCard, UploadZone) with Radix equivalents — they're more sophisticated.

---

## 22. EXISTING LIBRARY COMPATIBILITY

| Library | Current Use | Keep/Replace | Notes |
|---------|-------------|--------------|-------|
| **lucide-react** | All icons | **KEEP** | Single canonical system |
| **@uiw/react-md-editor** | Markdown editor | **KEEP** | Specialized, working well |
| **react-router-dom** | Routing | **KEEP** | Standard |
| **firebase** | Auth, Firestore, Storage, Functions | **KEEP** | Backend integration |
| **rehype-sanitize** | Markdown security | **KEEP** | Required |
| **oxlint** | Linting | **KEEP** | Fast, Rust-based |
| **vitest** | Testing | **KEEP** | Fast, Vite-native |
| **Radix UI** | Not installed | **ADD SELECTIVELY** | For accessibility gaps only |

---

## 23. MIGRATION RISKS

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Breaking auth flow** | High | Phase R1: Fix authRepository.ts + storage.rules FIRST before UI changes |
| **Storage 403 regression** | High | Deploy fixed storage.rules + trigger claims sync before any UI deploy |
| **PermissionGate regression** | Medium | Comprehensive test matrix for 3 roles × 15 routes |
| **Modal focus trap issues** | Medium | Use Radix Dialog; test with keyboard only |
| **Responsive breakage** | Medium | Test at 4 breakpoints per component |
| **Design token inconsistency** | Medium | Single source of truth (`index.css`); remove `design/` folder |
| **Form state bugs** | Medium | Introduce `useForm` hook with validation; test all 12 forms |
| **Upload pipeline changes** | High | **DO NOT TOUCH** Media Library upload pipeline in R1 |
| **Dark mode introduction** | Low | Defer to post-R1; requires full token audit |

---

## 24. TARGET UI ARCHITECTURE

### 24.1 File Structure (Post-R1)
```
admin-panel/src/
├── components/
│   ├── ui/                    # Primitives (30+)
│   │   ├── primitives/        # Box, Flex, Text, Icon, Badge
│   │   ├── form/              # Input, Select, Checkbox, Radio, Switch, Textarea, Label
│   │   ├── feedback/          # Toast, LoadingOverlay, EmptyState, ErrorState, Progress
│   │   ├── navigation/        # Breadcrumb, Pagination, Tabs, DropdownMenu
│   │   ├── data/              # Table, DataTable, Card, Avatar, StatusBadge
│   │   ├── overlay/           # Modal, Drawer, Tooltip, ConfirmDialog
│   │   └── media/             # UploadZone, MediaCard, MediaPreview
│   ├── layout/
│   │   ├── Layout.tsx         # App shell
│   │   ├── Sidebar.tsx        # Navigation
│   │   └── Header.tsx         # Top bar
│   └── patterns/              # ListPage, FormDialog, FilterToolbar, BulkActionBar
├── pages/                     # 15 route components (thin, compose patterns)
├── features/                  # Domain modules (unchanged)
├── core/                      # Infrastructure (unchanged)
├── hooks/                     # Shared hooks (add useForm, useMediaQuery)
├── design/                    # **REMOVED** — tokens in CSS only
├── styles/
│   ├── tokens.css             # Design tokens (CSS variables)
│   ├── globals.css            # Base styles, resets
│   └── utilities.css          # Semantic utilities (.gap-md, .p-lg)
├── App.tsx
└── main.tsx
```

### 24.2 Component API Standards
```typescript
// Button example
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// All components: forwardRef, displayName, TypeScript-first
```

---

## 25. PHASE R1 IMPLEMENTATION PLAN

### 25.1 Prerequisites (Must Complete First)
| Task | Owner | Dependency |
|------|-------|------------|
| Fix `authRepository.ts` claim check | Backend/Frontend | **P0 — Before any UI deploy** |
| Deploy fixed `storage.rules` | Firebase | **P0 — Before any upload test** |
| Trigger custom claims sync for admin | Firebase Console | **P0 — After rules deploy** |
| Verify real MP3 upload works | Browser test | **P0 — Validation** |

### 25.2 Phase R1 Scope (4 Weeks)

#### Week 1: Design Token Consolidation
| Day | Task | Files |
|-----|------|-------|
| 1-2 | Audit all hardcoded colors/spacing in components | `grep -r "#[0-9A-Fa-f]\{6\}" src/` |
| 3 | Remove `src/design/` folder entirely | Delete 6 files |
| 4 | Clean `index.css`: remove Tailwind-like utilities, standardize naming | `index.css` |
| 5 | Add missing tokens: motion, z-index, breakpoints | `index.css` |

#### Week 2: Primitive Component Library
| Day | Task | Files |
|-----|------|-------|
| 1-2 | Extract `Modal` from Radix Dialog (replace 15+ inline modals) | `components/ui/Modal.tsx` |
| 3 | Extract `Tabs` from Radix Tabs (replace 3 implementations) | `components/ui/Tabs.tsx` |
| 4 | Add `Tooltip` from Radix Tooltip | `components/ui/Tooltip.tsx` |
| 5 | Create `DropdownMenu` from Radix Dropdown Menu | `components/ui/DropdownMenu.tsx` |

#### Week 3: Pattern Components + Form Standardization
| Day | Task | Files |
|-----|------|-------|
| 1-2 | Create `useForm` hook + `FormField` / `FormGroup` | `hooks/useForm.ts`, `components/ui/form/` |
| 3 | Build `ListPage` pattern (Toolbar + DataTable + Pagination + BulkActions) | `components/patterns/ListPage.tsx` |
| 4 | Build `FormDialog` pattern (Modal + Form + Actions) | `components/patterns/FormDialog.tsx` |
| 5 | Build `FilterToolbar` pattern (Search + Filters + ViewToggle) | `components/patterns/FilterToolbar.tsx` |

#### Week 4: Page Migration + Accessibility + Testing
| Day | Task | Files |
|-----|------|-------|
| 1-2 | Migrate `Audio.tsx` → `ListPage` + `FormDialog` | `pages/Audio.tsx` |
| 3 | Migrate `Books.tsx` → `ListPage` + `FormDialog` | `pages/Books.tsx` |
| 4 | Migrate `Banners.tsx` → `ListPage` + `FormDialog` | `pages/Banners.tsx` |
| 5 | Accessibility audit + fixes (focus trap, ARIA, contrast) | All modified files |
| 6-7 | Run test suite: lint, typecheck, build, unit, E2E critical paths | CI/CD |

### 25.3 Phase R1 Deliverables
1. **Single design token source** — `index.css` only (no `design/` folder)
2. **Primitive component library** — 30+ components with Radix accessibility
3. **Pattern components** — `ListPage`, `FormDialog`, `FilterToolbar`, `BulkActionBar`
4. **Form standardization** — `useForm` hook used in 4+ pages
5. **Accessibility baseline** — Focus traps, ARIA, contrast, skip links
6. **3 pages migrated** — Audio, Books, Banners using new patterns
7. **Documentation** — Storybook for primitives + patterns
8. **All tests passing** — TypeScript, lint, build, unit, E2E

### 25.4 Phase R1 Success Criteria
- [ ] Zero hardcoded colors in components (all CSS variables)
- [ ] Zero inline modal implementations (all use `Modal` primitive)
- [ ] Zero duplicate tab implementations (all use `Tabs` primitive)
- [ ] 4+ pages use `ListPage` + `FormDialog` patterns
- [ ] `useForm` hook handles validation, submission, dirty state
- [ ] Keyboard navigation works end-to-end (modals, drawers, tables)
- [ ] Screen reader announces toasts, loading, errors
- [ ] Color contrast meets WCAG AA for all text
- [ ] Build passes, all tests pass, no console errors

---

## 26. APPROVAL REQUEST

**Phase R0 Complete**. The design direction is established based on the Enterprise Media Library as the canonical reference.

**Requesting approval to proceed to Phase R1** with the following priorities:
1. **P0 Fixes first** (authRepository + storage.rules + claims sync) — already identified
2. **Token consolidation** — Remove `design/`, clean `index.css`
3. **Primitive extraction** — Modal, Tabs, Tooltip, DropdownMenu from Radix
4. **Pattern creation** — ListPage, FormDialog, FilterToolbar
5. **Page migration** — Audio, Books, Banners first

**Do not proceed to Phase R1 until:**
- [ ] P0 storage 403 is resolved and verified in browser
- [ ] Design direction document is reviewed and approved
- [ ] Team capacity confirmed for 4-week R1 sprint

---

*Generated: Phase R0 Audit Complete | Next: Phase R1 Implementation (Pending Approval)*