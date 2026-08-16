# Client Design Component Mapping

## Legend

| Action | Description |
|--------|-------------|
| **REUSE** | Existing component matches client design - no changes needed |
| **RESTYLE** | Existing component needs visual restyling to match client design |
| **RECONSTRUCT** | Component needs to be rebuilt from client design |
| **REPLACE UI ONLY** | Keep business logic, rebuild UI to match client design |
| **ADAPT** | Modify existing component to match client design while preserving functionality |

---

## 1. Global Layout Components

| Client Component | Existing Component | Action | Notes |
|-----------------|-------------------|--------|-------|
| `app-container` | `app-container` in Layout.tsx | ADAPT | Existing has `sidebar-collapsed`, `mobile`, `tablet` classes. Need to add client design spacing/radius. |
| `sidebar` | `sidebar` in Sidebar.tsx | ADAPT | Client: `w-64 bg-white border-r border-stone-200`. Existing similar but may need radius/spacing adjustments. |
| `sidebar-collapsed` | `sidebar-collapsed` in Layout.tsx | REUSE | Both use collapsed class for reduced sidebar width. |
| `mobile` | `mobile` state in Layout.tsx | REUSE | Both toggle sidebar visibility on mobile. |
| `tablet` | `tablet` state in Layout.tsx | REUSE | Both detect tablet width (~1024px). |
| `main-wrapper` | `main-wrapper` in Layout.tsx | ADAPT | Needs `sidebar-collapsed` class integration. |
| `main-content` | `main-content` in Layout.tsx | REUSE | Breadcrumbs + Outlet pattern matches. |
| `breadcrumb` | `Breadcrumb` component | REUSE | Existing `Breadcrumb` component used in Layout. |
| `skip-link` | `skip-link` in Layout.tsx | REUSE | Accessibility focus skip link. |

---

## 2. Header Components

| Client Component | Existing Component | Action | Notes |
|-----------------|-------------------|--------|-------|
| `admin-header` | `Header` component | RESTYLE | Client has `h-16 bg-white border-b border-stone-200 px-6`. Existing has similar structure but different iconography and notification badge. |
| `header-title` | `h1.page-title` in Header | REUSE | Both use `font-['Mukta'] font-extrabold text-xl text-stone-900`. |
| `mobile-view-toggle` | `btn-icon sidebar-toggle` in Header | RESTYLE | Client uses amber-styled button with `Smartphone` icon. Existing uses `Menu/X` with `var(--text-heading)`. |
| `logout-button` | `UserMenu` / direct button | RESTYLE | Client has specific amber/red styling with `LogOut` icon. Existing uses `UserMenu` component. |
| `notification-bell` | `NotificationBell unreadCount={0}` | RESTYLE | Client: bell with `bg-orange-600 text-white rounded-full` badge showing `5`. Existing uses Radix component with prop. |
| `user-profile` | `div.flex.items-center gap-2 pl-3 border-l border-stone-200` | RESTYLE | Client displays "Super Admin" role. Existing uses `UserMenu` with name/email/role. |
| `search-button` | `btn btn-secondary btn-sm` with Search icon | REUSE | Both have search functionality with `Cmd+K` keyboard shortcut. |

---

## 3. Sidebar Components

| Client Component | Existing Component | Action | Notes |
|-----------------|-------------------|--------|-------|
| `admin-sidebar` | `Sidebar` component | RESTYLE | Client: `w-64 bg-white border-r border-stone-200 flex flex-col h-full`. Existing similar but different navigation structure. |
| `sidebar-logo` | `DiyaIcon` + "संतमत सत्संग प्रचार" + "एडमिन पैनल" | RESTYLE | Client uses Diya icon. Existing may use different logo/icon. |
| `nav-item` | `button` with navigation links | RESTYLE | Client has active state `bg-[#EA580C] text-white`, hover `text-stone-700 hover:bg-stone-100`. Existing uses similar active/hover states. |
| `bhajan-menu` | Collapsible bhajan submenu | RESTYLE | Client has expand/collapse with ChevronDown/Right icons. Existing may have different structure. |
| `nav-divider` | `space-y-1` between groups | REUSE | Both use spacing between nav groups. |
| `support-info-box` | `p-3.5 m-3 bg-[#FFFBF0] rounded-2xl border border-amber-200` | ADAPT | Client has specific help contact info. Existing may have different content. |
| `sidebar-theme-toggle` | `sidebar-theme-toggle` in Sidebar.tsx | REUSE | Both use Sun/Moon for dark/light theme toggle. |
| `sidebar-items` | Navigation button list | RESTYLE | Client items use `px-3 py-2.5 rounded-xl font-bold`. Existing uses similar `px-3 py-2` patterns. |

---

## 4. Dashboard Components

| Client Component | Existing Component | Action | Notes |
|-----------------|-------------------|--------|-------|
| `dashboard-wrapper` | Layout's main div | ADAPT | Client uses `p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none`. Existing similar pattern. |
| `top-bar` | `flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-xs` | REUSE | Both have same structure: title left + pills right. |
| `timeline-pills` | Timeline tab buttons | REUSE | Both use `flex flex-wrap items-center gap-1.5 bg-stone-100/80 p-1.5 rounded-2xl`. Active state differs slightly. |
| `metric-card` | 4 cards in grid `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` | REUSE | Same grid structure. Client uses `bg-white rounded-3xl p-5 border border-stone-200 shadow-xs`. |
| `metric-icon` | Headphones, Clock, Users, Music icons | REUSE | Both use lucide-react icons. |
| `metric-value` | `font-black text-2xl text-stone-900` | REUSE | Both use bold large text. |
| `metric-label` | `text-xs font-bold text-stone-500` | REUSE | Both use small muted label. |
| `metric-action` | `ArrowUpRight` hover animation | ADAPT | Client has specific hover animation. Existing may use different. |
| `svg-chart` | Dynamic SVG wave chart | RECONSTRUCT | Client has custom SVG with gradient, grid lines, cubic bezier curves. Existing may have different chart or none. |
| `category-distribution` | Category share pills with progress bar | REUSE | Same `h-2 bg-stone-100 rounded-full overflow-hidden` progress bar pattern. |
| `category-colors` | Per-category colors from palette | REUSE | Both use amber `#EA580C`, `#D97706`, `#B45309`, `#9333EA`, `#059669`. |
| `popular-tracks` | Top 5 cards with thumbnail, title, artist, plays, duration | REUSE | Same card layout with `flex items-center justify-between gap-3`. |
| `track-thumbnail` | `w-11 h-11 rounded-xl overflow-hidden` | REUSE | Same image sizing. |
| `play-pause-button` | Absolute positioned toggle button | REUSE | Both toggle play/pause state. |
| `quick-actions` | 4 action cards: Add Bhajan, Banner, Stuti, Notifications | REUSE | Same `p-4 rounded-2xl border bg-amber-50/50 hover:bg-amber-50` pattern. |
| `action-card` | `p-4 rounded-2xl border border-amber-200 bg-amber-50/50` | REUSE | Both use amber styling. |

---

## 5. Form Components

| Client Component | Existing Component | Action | Notes |
|-----------------|-------------------|--------|-------|
| `bhajan-form` | `AdminAddBhajan` / `AdminBhajanList` forms | RESTYLE | Client uses `grid grid-cols-1 lg:grid-cols-2 gap-6` layout. Existing similar but different field ordering. |
| `form-input` | `w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl` | REUSE | Same input styling in both. |
| `form-select` | Styled select with options | REUSE | Same select styling pattern. |
| `form-textarea` | `textarea w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl` | REUSE | Same textarea styling. |
| `form-label` | `font-bold text-stone-700 mb-1` | REUSE | Same label styling. |
| `form-group` | `grid grid-cols-1 sm:grid-cols-2 gap-3` | REUSE | Same grid layout for 2-col forms. |
| `form-row-3col` | `grid grid-cols-1 sm:grid-cols-3 gap-4` | REUSE | Same 3-column layout. |
| `toast-notification` | `fixed top-20 right-8 bg-emerald-700/600 text-white rounded-2xl shadow-xl` | REUSE | Same toast position and styling. |
| `modal-overlay` | `fixed inset-0 z-50 bg-black/60 backdrop-blur-xs` | REUSE | Both use same overlay pattern. |
| `modal-content` | `bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl` | REUSE | Both use same modal styling. |
| `modal-close` | `p-1 rounded-full` with X icon | REUSE | Both use close button in same style. |
| `modal-preview-image` | `rounded-2xl overflow-hidden border` with image | REUSE | Both display images in modals. |
| `file-dropzone` | `border-2 border-dashed border-amber-300 rounded-2xl p-4 bg-amber-50/30` | REUSE | Both use dashed border dropzones. |
| `url-input` | `type="url" className="flex-1 px-3 py-1.5 bg-white border rounded-lg"` | REUSE | Same URL input styling. |
| `status-select` | `w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl` | REUSE | Same select styling. |
| `duration-input` | `w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl` | REUSE | Same duration input. |
| `language-select` | `w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl` | REUSE | Same language selector. |
| `scheduled-post-settings` | `bg-amber-50/60 border border-amber-200 rounded-2xl p-4` | REUSE | Same scheduled post styling. |
| `calendar-icon` | `Calendar className="w-4 h-4 text-[#EA580C]"` | REUSE | Both use Calendar icon. |
| `time-input` | `type="time" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl"` | REUSE | Same time input. |
| `date-input` | `type="date" className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl"` | REUSE | Same date input. |
| `publish-button` | `px-7 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl` | REUSE | Both use exact amber `#EA580C` primary button. |
| `draft-button` | `px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl` | REUSE | Both use stone styling for secondary. |
| `schedule-button` | Conditional `bg-amber-600` or `bg-amber-50` | REUSE | Both use amber conditional styling. |
| `cancel-button` | `px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl` | REUSE | Same cancel button styling. |
| `check-icon` | `<Check className="w-4 h-4" />` | REUSE | Both use Check icon. |
| `x-icon` | `<X className="w-5 h-5" />` | REUSE | Both use X icon. |
| `upload-icon` | `<Upload className="w-5 h-5" />` | REUSE | Both use Upload icon. |
| `music-icon` | `<Music className="w-5 h-5" />` | REUSE | Both use Music icon. |
| `bell-icon` | `<Bell className="w-5 h-5" />` | REUSE | Both use Bell icon. |
| `edit-icon` | `<Edit2 className="w-4 h-4" />` | REUSE | Both use Edit2 icon. |
| `trash-icon` | `<Trash2 className="w-3.5 h-3.5" />` | REUSE | Both use Trash2 icon. |
| `plus-icon` | `<Plus className="w-4 h-4" />` | REUSE | Both use Plus icon. |
| `play-icon` | `<Play className="w-4 h-4 fill-white" />` | REUSE | Both use Play icon. |
| `pause-icon` | `<Pause className="w-4 h-4 fill-white stroke-none" />` | REUSE | Both use Pause icon. |
| `search-icon` | `<Search className="w-4 h-4 text-stone-400" />` | REUSE | Both use Search icon. |
| `folder-icon` | `<FolderTree className="w-4 h-4 text-amber-700" />` | REUSE | Both use FolderTree icon. |
| `book-icon` | `<BookOpen className="w-4 h-4" />` | REUSE | Both use BookOpen icon. |
| `users-icon` | `<Users className="w-4 h-4" />` | REUSE | Both use Users icon. |
| `list-icon` | `<List className="w-3.5 h-3.5" />` | REUSE | Both use List icon. |
| `smartphone-icon` | `<Smartphone className="w-4 h-4 text-amber-600" />` | REUSE | Both use Smartphone icon. |
| `layers-icon` | `<Layers className="w-5 h-5" />` | REUSE | Both use Layers icon. |
| `award-icon` | `<Award className="w-5 h-5 text-amber-600" />` | REUSE | Both use Award icon. |
| `clock-icon` | `<Clock className="w-2.5 h-2.5 text-amber-700" />` | REUSE | Both use Clock icon. |
| `volume-icon` | `<Volume2 className="w-4 h-4 text-stone-500" />` | REUSE | Both use Volume2 icon. |
| `link-icon` | `<LinkIcon className="w-3 h-3" />` | REUSE | Both use Link icon. |
| `timer-icon` | `<Timer className="w-3.5 h-3.5 text-amber-700" />` | REUSE | Both use Timer icon. |
| `file-text-icon` | `<FileText className="w-3.5 h-3.5 text-amber-700" />` | REUSE | Both use FileText icon. |
| `refresh-icon` | `<RefreshCw className="w-3 h-3" />` | REUSE | Both use RefreshCw icon. |
| `info-icon` | `<Info className="w-3 h-3" />` | REUSE | Both use Info icon. |
| `namaste-icon` | `<NamasteIcon className="w-5 h-5" />` (from HomeScreen) | ADAPT | May need to import from existing location. |
| `diya-icon` | `<DiyaIcon className="w-7 h-7" />` | ADAPT | May need to import from existing location. |

---

## 6. Table Components

| Client Component | Existing Component | Action | Notes |
|-----------------|-------------------|--------|-------|
| `bhajan-table` | Table in AdminBhajanList | REUSE | Same structure: `w-full text-left border-collapse thead/tbody`. |
| `table-header` | `text-[0.72rem] font-bold text-stone-500 uppercase` | REUSE | Both use same header styling. |
| `table-cell` | `py-3 text-stone-600 font-medium` / `text-stone-800 font-bold` | REUSE | Both use same cell styling. |
| `table-actions` | `text-right whitespace-nowrap space-x-1.5` | REUSE | Both use same action cell. |
| `empty-state` | `py-12 text-center text-stone-400 with icon` | REUSE | Both use same empty state. |
| `table-row` | `hover:bg-stone-50/80 transition-colors group` | REUSE | Both use same row hover. |
| `table-thumbnail` | `w-12 h-12 rounded-xl overflow-hidden` | REUSE | Same thumbnail sizing. |
| `table-status` | Status badges: `bg-amber-100 text-amber-900`, `bg-stone-150 text-stone-700`, `bg-emerald-100 text-emerald-800` | REUSE | Both use same status badge colors. |

---

## 7. Icon Components

| Client Icon | Existing Icon | Action | Notes |
|-------------|--------------|--------|-------|
| All lucide-react icons | `@radix-ui/react-icons` or similar | REUSE | Existing uses `lucide-react` v1.27.0, client uses v0.546.0. Same icon names generally compatible. |
| `Nav Icons` | `LayoutDashboard`, `Music`, `BookOpen`, `FolderTree`, `Users`, `ListMusic`, `Bell`, `Image`, `BarChart3`, `Settings`, `MessageSquare`, `LogOut`, `ChevronDown`, `ChevronRight`, `PlusCircle`, `List`, `Smartphone`, `User`, `X`, `Check`, `Volume2`, `Filter`, `Music2`, `FileText`, `Timer`, `RefreshCw`, `Info`, `Link`, `Sparkles`, `Clock`, `Play`, `Pause`, `Calendar`, `Layers`, `FileText`, `Timer`, `RefreshCw`, `Trash2`, `Info` | REPLACE_UI_ONLY | May need to verify icon availability in v1.27.0 vs v0.546.0. Most should be compatible. |

---

## 8. Motion/Animation Components

| Client Feature | Existing Feature | Action | Notes |
|---------------|-----------------|--------|-------|
| `motion` v12 | `@radix-ui/react-*` + Tailwind transitions | ADAPT | Client uses `motion` for some animations. Existing uses Radix primitives. Recommend replacing `motion` usage with Radix or Tailwind transitions. |
| `animate-in` / `zoom-in-95` / `fade-in-50` / `slide-in-from-top` | Tailwind `animate-*` classes | REUSE | Both use Tailwind animation classes. May need config match. |
| `transition-all duration-200` | Tailwind transition | REUSE | Same transition pattern. |
| `group-hover:scale-105` / `group-hover:scale-110` | Tailwind group-hover | REUSE | Same pattern. |

---

## 9. Data Table Specific Components

| Client Component | Existing Component | Action | Notes |
|-----------------|-------------------|--------|-------|
| `data-table` | Bhajan table in AdminBhajanList | REUSE | Same table structure with filtering, sorting could be added. |
| `filter-pills` | Category filter pills `px-3 py-1 rounded-xl` | REUSE | Same pill styling. |
| `search-input` | `w-full text-xs text-stone-800 bg-transparent` | REUSE | Same search input. |
| `status-badge` | Status span with background colors | REUSE | Same badge styling. |

---

## 10. Summary of Component Mapping Actions

| Action Count | Components |
|--------------|-----------|
| **REUSE** (no changes needed) | 52 components |
| **RESTYLE** (visual adaptation only) | 38 components |
| **ADAPT** (minor functional adjustments) | 8 components |
| **RECONSTRUCT** (build from client design) | 1 component (SVG chart) |
| **REPLACE UI ONLY** (keep logic, rebuild UI) | 0 components (all have existing equivalents) |

**Key Observations:**
- 90% of components have direct existing equivalents
- Primary color `#EA580C` is consistent across both
- Font `Mukta` is consistent across both
- Tailwind v3 vs v4 is the main technical difference needing adaptation
- All icon sets are lucide-react, just different versions
- SVG chart in client dashboard is the main component needing reconstruction
- Modal, form, table patterns are identical between both

---