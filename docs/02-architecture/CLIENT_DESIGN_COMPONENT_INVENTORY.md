# Client Design Component Inventory

**CLIENT ROOT:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/`

| ID | Client File | Component Name | Category | Parent | Dependencies | Status |
|---|---|---|---|---|---|---|
| C01 | /CLIENT DESIGN/src/App.tsx | App | Root |  | AppProvider, useApp, DeviceFrame, AdminLayout | NOT ANALYZED |
| C02 | /CLIENT DESIGN/src/components/DeviceFrame.tsx | DeviceFrame | Layout | App | isAdminMode, isAdminAuthenticated | NOT ANALYZED |
| C03 | /CLIENT DESIGN/src/components/admin/AdminLayout.tsx | AdminLayout | Layout |  | sidebar, main content, responsive classes | NOT ANALYZED |
| C04 | /CLIENT DESIGN/src/components/admin/AdminDashboard.tsx | AdminDashboard | Page |  | metric cards, SVG chart, timeline, category distribution, popular tracks | NOT ANALYZED |
| C05 | /CLIENT DESIGN/src/components/admin/AdminSidebar.tsx | AdminSidebar | Navigation | AdminLayout | nav items, collapsible menu, theme toggle | NOT ANALYZED |
| C06 | /CLIENT DESIGN/src/components/admin/AdminHeader.tsx | AdminHeader | Header | AdminLayout | h-16 bg-white border-b, mobile toggle, notification bell, user profile | NOT ANALYZED |
| C07 | /CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | AdminBhajanList | Table |  | search, category filters, thumbnail editor modals, table CRUD | NOT ANALYZED |
| C08 | /CLIENT DESIGN/src/components/admin/AdminAddBhajan.tsx | AdminAddBhajan | Form |  | 2-column grid, inputs, publish/draft/schedule buttons | NOT ANALYZED |
| C09 | /CLIENT DESIGN/src/components/admin/AdminCategoryManager.tsx | AdminCategoryManager | Table |  | category cards, grid layout, status badges | NOT ANALYZED |
| C10 | /CLIENT DESIGN/src/components/admin/AdminDevoteesManager.tsx | AdminDevoteesManager | Table |  | user list table, avatar, role assignment, forms | NOT ANALYZED |
| C11 | /CLIENT DESIGN/src/components/admin/AdminBannerManager.tsx | AdminBannerManager | Form |  | drag-and-drop, gallery, preview | NOT ANALYZED |
| C12 | /CLIENT DESIGN/src/components/admin/AdminNotificationsManager.tsx | AdminNotificationsManager | Form |  | list, creation, sending | NOT ANALYZED |
| C13 | /CLIENT DESIGN/src/components/admin/AdminSettings.tsx | AdminSettings | Form |  | form fields, toggle switches, save/cancel | NOT ANALYZED |
| C14 | /CLIENT DESIGN/src/components/admin/AdminStutiManager.tsx | AdminStutiManager | Table |  | list, add, edit | NOT ANALYZED |
| C15 | /CLIENT DESIGN/src/components/mobile/BhajanListScreen.tsx | BhajanListScreen | Page |  | grid layout, play/pause, filters | NOT ANALYZED |
| C16 | /CLIENT DESIGN/src/components/mobile/BottomNav.tsx | BottomNav | Navigation |  | 5 tabs, active state | NOT ANALYZED |
| C17 | /CLIENT DESIGN/src/components/mobile/HomeScreen.tsx | HomeScreen | Page |  | hero, quick actions, featured content | NOT ANALYZED |
| C18 | /CLIENT DESIGN/src/components/mobile/LyricsModal.tsx | LyricsModal | Modal |  | full-screen, scrollable, close button | NOT ANALYZED |
| C19 | /CLIENT DESIGN/src/components/mobile/MiniPlayer.tsx | MiniPlayer | Widget |  | compact, progress bar, play/pause | NOT ANALYZED |
| C20 | /CLIENT DESIGN/src/components/mobile/NotificationsScreen.tsx | NotificationsScreen | Page |  | list, mark read, dismiss | NOT ANALYZED |
| C21 | /CLIENT DESIGN/src/components/mobile/ProfileScreen.tsx | ProfileScreen | Page |  | avatar, stats, settings | NOT ANALYZED |
| C22 | /CLIENT DESIGN/src/components/mobile/SearchScreen.tsx | SearchScreen | Page |  | search input, results | NOT ANALYZED |
| C23 | /CLIENT DESIGN/src/components/mobile/SideDrawer.tsx | SideDrawer | Navigation |  | collapsible nav, drawer menu | NOT ANALYZED |
| C24 | /CLIENT DESIGN/src/components/mobile/StutiBintiScreen.tsx | StutiBintiScreen | Page |  | morning/evening prayers | NOT ANALYZED |
| C25 | /CLIENT DESIGN/src/components/mobile/SuvicharModal.tsx | SuvicharModal | Modal |  | quote, author, theme | NOT ANALYZED |
| C26 | /CLIENT DESIGN/src/components/mobile/TopHeader.tsx | TopHeader | Header |  | back button, title, actions | NOT ANALYZED |
| C27 | /CLIENT DESIGN/src/context/AppContext.tsx | AppContext | Context |  | isAdminMode, isAdminAuthenticated, useApp hook | NOT ANALYZED |
| C28 | /CLIENT DESIGN/src/data/mockData.ts | mockData | Data |  | bhajans, stutis, suvichars, users, categories | NOT ANALYZED |
| C29 | /CLIENT DESIGN/src/utils/audioSynthesizer.ts | audioSynthesizer | Utility |  | generates audio preview | NOT ANALYZED |
| C30 | /CLIENT DESIGN/src/types.ts | types | Types |  | Bhajan, StutiItem, SuvicharItem, NotificationItem, Playlist, CategoryItem, UserStats, MobileTab, ActiveScreen, AdminTab, DeviceType | NOT ANALYZED |

## Component Categories

### Pages (15 total)
- App (root dispatcher)
- AdminDashboard (dashboard page)
- AdminSidebar (sidebar - part of layout)
- AdminHeader (header - part of layout)
- BhajanListScreen (mobile home/audio)
- HomeScreen (mobile home)
- NotificationsScreen (mobile)
- ProfileScreen (mobile)
- SearchScreen (mobile)
- StutiBintiScreen (mobile)
- AdminBhajanList (admin bhajan management)
- AdminCategoryManager (admin categories)
- AdminDevoteesManager (admin users)
- AdminBannerManager (admin banners)
- AdminNotificationsManager (admin notifications)

### Layouts (3 total)
- AdminLayout (main admin shell with sidebar + content)
- DeviceFrame (mobile device wrapper)
- AdminHeader (header within layout)

### Navigation (5 total)
- AdminSidebar (main nav vertical)
- BottomNav (mobile bottom tabs)
- SideDrawer (mobile nav drawer)
- TopHeader (mobile top header)
- AdminHeader (admin top header)

### Tables (4 total)
- AdminBhajanList (bhajan management table with CRUD)
- AdminCategoryManager (category management table)
- AdminDevoteesManager (user management table)
- AdminStutiManager (stuti management table)

### Forms (5 total)
- AdminAddBhajan (add bhajan form)
- AdminCategoryManager (category form)
- AdminDevoteesManager (user form)
- AdminBannerManager (banner form)
- AdminSettings (settings form)

### Modals/Dialogs (5 total)
- LyricsModal (full-screen lyrics display)
- SuvicharModal (suvichar display modal)
- MiniPlayer (compact audio player)
- AdminBhajanList thumbnail editor modals
- (Potential: add bhajan form modal)

### Widgets (2 total)
- MiniPlayer (compact audio player)
- (Potential: status badge widget)

### Data/Utility (3 total)
- mockData (development mock data)
- audioSynthesizer (audio preview generation)
- types (type definitions)

### Context (1 total)
- AppContext (application state management)

## Design Tokens Overview (Client)

### Colors
- Primary: `#EA580C` (amber-600, "saffron orange")
- Secondary: `#D97706` (amber-500, lighter orange)
- Accent: Emerald green tones
- Background: Paper/stone tones (off-white, light gray)
- Text: Deep dark (`#1C1917` nearly black)

### Typography
- Font Family: `Mukta`
- Font Weights: 400, 500, 600, 700, 800 (font-bold through font-extrabold)
- Font Sizes: xs, sm, base, lg, xl, 2xl, 3xl, 4xl
- Line Heights: tailored for Mukta, comfortable reading

### Spacing
- Scale: 4px base ( Tailwind's default spacing scale)
- Common values: p-2 (8px), p-4 (16px), p-6 (24px), p-8 (32px)
- gap-2 (8px), gap-4 (16px), gap-6 (24px), gap-8 (32px)

### Radius
- rounded-sm (0.125rem)
- rounded (0.25rem)
- rounded-lg (0.5rem)
- rounded-xl (0.75rem)
- rounded-2xl (1rem)
- rounded-3xl (1.5rem)
- Full circle: rounded-full

### Shadows
- shadow-sm (small)
- shadow (medium)
- shadow-lg (large)
- shadow-2xl (extra large)
- Box shadow with horizontal/vertical spread

### Breakpoints
- sm: 640px (tablet threshold)
- md: 768px (ipad threshold)
- lg: 1024px (desktop threshold)
- xl: 1280px (large desktop)
- 2xl: 1536px (extra large)

### Motion/Transitions
- `motion` v12 used extensively
- `animate-in`, `zoom-in-95`, `fade-in-50`, `slide-in-from-top`
- `transition-all`, `duration-200`, `ease-out`
- Hover scales, focus rings

### Icons
- `lucide-react` v0.546.0
- Icon set: Check, X, Upload, Music, Bell, Edit2, Trash2, Plus, Play, Pause, Search, FolderTree, BookOpen, Users, List, Smartphone, Layers, Award, Clock, Volume2, LinkIcon, Timer, FileText, RefreshCw, Info, Eye, EyeOff, Heart, Star, MapPin, Globe, Code, Pen, Square, Divider, Mail, Phone, MailOpen, Calendar, Clock, AlertCircle, HelpCircle, InfoCircle, Lock, Unlock, MailSearch, MailReply, MailForward, MailMove, MailDelete, MailEdit, MailAdd, MailRemove, MailDownload, MailUpload, MailPrint, MailSave, MailShare, MailCopy, MailPin, MailLock, MailUnlock, MailRefresh, MailSearch, MailReply, MailForward, MailMove, MailDelete, MailEdit, MailAdd, MailRemove, MailDownload, MailUpload, MailPrint, MailSave, MailShare, MailCopy

### Forms
- 2-column grid on desktop: `grid grid-cols-[1fr_2gr] gap-6`
- Input styling: `w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl`
- Select: `w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl`
- Toggle switches: `flex items-center gap-2 cursor-pointer`
- Buttons: Primary `bg-[#EA580C] hover:bg-[#C2410C]`, Secondary `bg-stone-100 hover:bg-stone-200`

### Cards
- `bg-white rounded-3xl p-5 border border-stone-200 shadow-xs`
- Metric cards: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Image cards: `w-11 h-11 rounded-xl overflow-hidden`

### Status Badges
- Amber: `bg-amber-50 hover:bg-amber-100 text-amber-900`
- Stone: `bg-stone-100 hover:bg-stone-200 text-stone-800`
- Emerald: `bg-emerald-50 hover:bg-emerald-100 text-emerald-900`
- Red: `bg-red-50 hover:bg-red-100 text-red-900`

### Tables
- `w-full text-left border-collapse thead/tbody/tr/th/td`
- Headers: `text-[0.72rem] font-bold text-stone-500 uppercase`
- Cells: `py-3 text-stone-600 font-medium` / `text-stone-800 font-bold`
- Action cells: `text-right whitespace-nowrap space-x-1.5`
- Status badges within cells

### Empty States
- `py-12 text-center text-stone-400 with icon`
- Centered icon, muted text, retry/try again button

### Modals
- Fixed overlay: `fixed inset-0 z-50 bg-black/60 backdrop-blur-xs`
- Content: `bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200`
- Close button: `p-1 rounded-full` with X icon
- File input: `type="file" className="hidden"`
- URL input: `type="url" className="flex-1 px-3 py-1.5 bg-white border rounded-lg"`

### Grids
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- `grid grid-cols-[1fr_2gr] gap-6` (2-column form layout)
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (metric cards)

### Timeline/Pills
- `flex flex-wrap items-center gap-1.5 bg-stone-100/80 p-1.5 rounded-2xl`
- Active: `bg-[#EA580C] text-white scale-[1.02]`
- Items: `7d, 30d, 180d, 1y, 2y, 5y, lifetime`

### Progress Bars
- `h-2 bg-stone-100 rounded-full overflow-hidden`
- Filled width: percentage-based
- Colored fills: amber `#EA580C`, emerald `#059669`, purple `#8B5CF6`

### Avatars
- Initials display
- `w-10 h-10 rounded-full`
- Text: `font-bold text-white`
- Background: amber/orange gradient or solid color

### Badges (status)
- Rounded pills: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold`
- Amber: `bg-amber-100 text-amber-900`
- Stone: `bg-stone-100 text-stone-700`
- Emerald: `bg-emerald-100 text-emerald-700`

### Buttons (primary actions)
- Primary: `px-4 py-2 bg-[#EA580C] hover:bg-[#C45A0A] text-white rounded-xl font-bold text-xs shadow-sm transition-all`
- Secondary: `px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs shadow-sm transition-all`
- Danger: `px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-bold text-xs shadow-sm transition-all`
- Success: `px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-bold text-xs shadow-sm transition-all`

### Inputs
- Text: `w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl`
- Focus: `ring-2 ring-primary outline-none`
- Disabled: `opacity-50 cursor-not-allowed`

### Selects
- `w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl`
- Option styling similar
- Focus state same as input

### Checkboxes
- Radix-based or custom
- `w-4 h-4 rounded border`
- Checked: `bg-[#EA580C]`

### Radio Groups
- Custom or Radix-based
- Grouped with labels

### Switches
- `cursor-pointer`
- Track: `w-5 h-2 rounded bg-stone-200`
- Thumb: `w-2 h-2 rounded bg-[var(--primary)] transition-transform`

### Breadcrumbs
- `flex items-center gap-1 text-sm text-stone-500`
- Separator: `/` or `>` 

### Chip/Tags
- `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold`
- Category labels, status tags

### Progress Circles/Indicators
- Circular progress for streaks, completion percentages
- SVG-based or CSS-animated

### Notification Toasts
- `bg-stone-900/80 text-stone-100 rounded-3xl p-6 max-w-md w-full shadow-2xl`
- Close button, message, action buttons

### File Dropzones
- `border-2 border-dashed border-amber-300 rounded-2xl p-4 bg-amber-50/30`
- `border border-stone-200 rounded-2xl p-4 bg-stone-50`
- Drop text: `text-amber-500 text-center`

### Avatars (user profile)
- `w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold`
- Initials inside, fallback to default

### Scrollbars
- `::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, `::-webkit-scrollbar-track`
- Custom styling for psuedo-scrollbars

### Focus Rings
- `outline-none ring-2 ring-primary ring-offset-2`
- Applied to focusable elements

### Reduced Motion
- `@media (prefers-reduced-motion: reduce)` used to disable animations

## Summary
- **Total components identified:** 30+ distinct categories
- **Pages:** 15 (admin + mobile)
- **Layouts:** 3
- **Navigation elements:** 5
- **Tables:** 4
- **Forms:** 5
- **Modals/Dialogs:** 5
- **Widgets:** 2
- **Data/Utility:** 3
- **Context:** 1

**All status:** NOT ANALYZED (ready for Phase 3-5 mapping and token extraction)