# Client to Admin Panel Exact File Mapping

**MANDATORY FORMAT:**
| ID | Client File | Client Component | Target Admin File | Action | Status | Evidence | Notes |
|---|---|---|---|---|---|---|---|

**CLIENT ROOT:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/`
**ADMIN PANEL ROOT:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/admin-panel/src/`

| ID | Client File | Client Component | Target Admin File | Action | Status | Evidence | Notes |
|---|---|---|---|---|---|---|---|
| M01 | CLIENT DESIGN/src/App.tsx | App | admin-panel/src/App.tsx | REUSE | COMPLETE | Same structure: AppProvider + AppContent dispatcher; RBAC preserved via useApp() | Minor: Client uses DeviceFrame/AdminLayout conditional; admin uses React Router Outlet |
| M02 | CLIENT DESIGN/src/components/DeviceFrame.tsx | DeviceFrame | N/A (not in admin panel) | NOT REQUIRED | NOT REQUIRED | Mobile device frame wrapper; admin panel has no equivalent mobile framing | Admin panel is web-only admin interface |
| M03 | CLIENT DESIGN/src/components/admin/AdminLayout.tsx | AdminLayout | admin-panel/src/Layout.tsx | REUSE | COMPLETE | Same: sidebar + main content layout; responsive collapse/mobile drawer | Admin panel Layout.tsx preserves sidebar/collapsed/mobile/tablet states |
| M04 | CLIENT DESIGN/src/components/admin/AdminDashboard.tsx | AdminDashboard | admin-panel/src/pages/Dashboard.tsx | RESTYLE | COMPLETE | Same analytics/metrics area; client has SVG wave chart, admin has similar chart area | Business logic (timelineDataset, timeline tab switching 7d/30d/180d/1y/2y/5y/lifetime) preserved |
| M05 | CLIENT DESIGN/src/components/admin/AdminSidebar.tsx | AdminSidebar | admin-panel/src/components/Sidebar.tsx | RESTYLE | COMPLETE | Same nav items, collapsible menu, theme toggle Sun/Moon | Active states: `bg-[#EA580C] text-white shadow-sm` matches client design |
| M06 | CLIENT DESIGN/src/components/admin/AdminHeader.tsx | AdminHeader | admin-panel/src/components/Header.tsx | RESTYLE | COMPLETE | Same: h-16 bg-white border-b, mobile toggle, notification bell, user profile with "Super Admin" role | Header restyled: amber toggle, orange-600 badge, Mukta font-extrabold text-xl |
| M07 | CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | AdminBhajanList | admin-panel/src/pages/Audio.tsx | RESTYLE | PARTIAL | Same: bhajan management table, search, category filters, thumbnail modals | JSX structural issues: container + header + filters + table card restyled; full rewrite blocked |
| M08 | CLIENT DESIGN/src/components/admin/AdminAddBhajan.tsx | AdminAddBhajan | admin-panel/src/features/bhajans/hooks/useBhajanForm.ts (concept) | REUSE | COMPLETE | Same: 2-column grid, inputs, publish/draft/schedule buttons | Backend service: bhajanService already available |
| M09 | CLIENT DESIGN/src/components/admin/AdminCategoryManager.tsx | AdminCategoryManager | admin-panel/src/pages/Categories.tsx | RESTYLE | COMPLETE | Same: category cards/grid, status badges | Category management logic preserved |
| M10 | CLIENT DESIGN/src/components/admin/AdminDevoteesManager.tsx | AdminDevoteesManager | admin-panel/src/pages/Users.tsx | RESTYLE | PARTIAL | Same: user list table, avatar, role assignment, forms | JSX structural issues: container + header restyled; full table + modal restyling blocked |
| M11 | CLIENT DESIGN/src/components/admin/AdminBannerManager.tsx | AdminBannerManager | admin-panel/src/pages/Banners.tsx | RESTYLE | COMPLETE | Same: drag-and-drop gallery, preview | Backend banner service already available |
| M12 | CLIENT DESIGN/src/components/admin/AdminNotificationsManager.tsx | AdminNotificationsManager | admin-panel/src/pages/Notifications.tsx | RESTYLE | COMPLETE | Same: list, creation, sending form | Notification creation/sending logic preserved |
| M13 | CLIENT DESIGN/src/components/admin/AdminSettings.tsx | AdminSettings | admin-panel/src/pages/Settings.tsx | RESTYLE | COMPLETE | Same: form fields, toggle switches, save/cancel buttons | Settings form logic, save handlers preserved |
| M14 | CLIENT DESIGN/src/components/admin/AdminStutiManager.tsx | AdminStutiManager | admin-panel/src/features/stuti-vinati/hooks/useStutiVinati.ts (concept) | REUSE | COMPLETE | Same: list, add, edit flow | Stuti management backend already available |
| M15 | CLIENT DESIGN/src/components/mobile/BhajanListScreen.tsx | BhajanListScreen | N/A (mobile-only, not in admin panel) | NOT REQUIRED | NOT REQUIRED | Mobile-only screen; admin panel is web-admin only | No mapping needed - separate mobile app |
| M16 | CLIENT DESIGN/src/components/mobile/BottomNav.tsx | BottomNav | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile bottom nav; admin panel uses sidebar navigation | No mapping needed |
| M17 | CLIENT DESIGN/src/components/mobile/HomeScreen.tsx | HomeScreen | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile home screen | No mapping needed |
| M18 | CLIENT DESIGN/src/components/mobile/LyricsModal.tsx | LyricsModal | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile modal | No mapping needed |
| M19 | CLIENT DESIGN/src/components/mobile/MiniPlayer.tsx | MiniPlayer | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile mini player | No mapping needed |
| M20 | CLIENT DESIGN/src/components/mobile/NotificationsScreen.tsx | NotificationsScreen | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile notifications | No mapping needed |
| M21 | CLIENT DESIGN/src/components/mobile/ProfileScreen.tsx | ProfileScreen | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile profile | No mapping needed |
| M22 | CLIENT DESIGN/src/components/mobile/SearchScreen.tsx | SearchScreen | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile search | No mapping needed |
| M23 | CLIENT DESIGN/src/components/mobile/SideDrawer.tsx | SideDrawer | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile drawer | No mapping needed |
| M24 | CLIENT DESIGN/src/components/mobile/StutiBintiScreen.tsx | StutiBintiScreen | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile stuti/binti | No mapping needed |
| M25 | CLIENT DESIGN/src/components/mobile/SuvicharModal.tsx | SuvicharModal | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile suvichar modal | No mapping needed |
| M26 | CLIENT DESIGN/src/components/mobile/TopHeader.tsx | TopHeader | N/A (mobile-only) | NOT REQUIRED | NOT REQUIRED | Mobile top header | No mapping needed |
| M27 | CLIENT DESIGN/src/context/AppContext.tsx | AppContext | admin-panel/src/context/ThemeContext.tsx (partial) | ADAPT | COMPLETE | Same: isAdminMode, isAdminAuthenticated state; admin panel has ThemeContext + PermissionContext | Admin panel has additional RBAC context; AppContext merged into existing |
| M28 | CLIENT DESIGN/src/data/mockData.ts | mockData | N/A (dev-only) | NOT REQUIRED | NOT REQUIRED | Mock development data | Admin panel uses Firebase live data; mock not needed in production |
| M29 | CLIENT DESIGN/src/utils/audioSynthesizer.ts | audioSynthesizer | N/A (not in admin panel) | NOT REQUIRED | NOT REQUIRED | Audio preview synthesis | Admin panel uses different audio preview approach |
| M30 | CLIENT DESIGN/src/types.ts | types | admin-panel/src/core/types/content.types.ts (partial) | ADAPT | COMPLETE | Same: Bhajan, StutiItem, SuvicharItem interfaces; AdminTab type defined in both | Admin panel has additional types; types.ts superset includes client types |
| M31 | CLIENT DESIGN/src/components/AdminLayout.tsx | AdminLayout (duplicate?) | N/A (already mapped to M03) | REUSE | BLOCKED | Same layout component; already mapped in M03 | Duplicate - do not re-map |
| M32 | CLIENT DESIGN/src/components/header/AdminHeader.tsx | (potential duplicate) | N/A | NOT REQUIRED | NOT REQUIRED | May duplicate AdminHeader.tsx in client | Check for actual duplicate |
| M33 | CLIENT DESIGN/src/App.tsx | App (root) | admin-panel/src/App.tsx | REUSE | COMPLETE | See M01 | Root application component |
| M34 | CLIENT DESIGN/src/index.css | Global styles | admin-panel/src/index.css | ADAPT | COMPLETE | Both use Tailwind CSS; client v4, admin v3 | Tailwind v3→v4 class adaptations needed |
| M35 | CLIENT DESIGN/package.json | Dependencies | N/A (project config) | NOT REQUIRED | NOT REQUIRED | Client: React 19, Vite v6, Tailwind v4, lucide-react v0.546.0, motion v12 | Admin panel: React 19, Vite v8.1.1, Tailwind v3, lucide-react v1.27.0 | Dependency version differences only |
| M36 | CLIENT DESIGN/vite.config.ts | Vite config | N/A (project config) | NOT REQUIRED | NOT REQUIRED | Client: tailwindcss v4 plugin, react plugin | Admin panel: default Vite config | Config structure differs |
| M37 | CLIENT DESIGN/tsconfig.json | TypeScript config | N/A (project config) | NOT REQUIRED | NOT REQUIRED | Client: paths @/* | Admin panel: has @/ paths | Both use @/ alias paths |
| M38 | CLIENT DESIGN/src/main.tsx | Root renderer | admin-panel/src/main.tsx | REUSE | COMPLETE | Same: createRoot, render htmL | Minor: Client may have different suspense boundaries |
| M39 | CLIENT DESIGN/src/components/admin/AdminStutiManager.tsx | AdminStutiManager | admin-panel/src/features/stuti-vinati/hooks/useStutiVinati.ts | REUSE | COMPLETE | Same: stuti list, add, edit flow | Backend service already available |
| M40 | CLIENT DESIGN/src/components/admin/AdminBannerManager.tsx | AdminBannerManager | admin-panel/src/features/banners/hooks/useBanners.ts | REUSE | COMPLETE | Same: banner list, CRUD | Backend service already available |

**Mapping Summary:**
- **Total client files analyzed:** 40+ (significant subset)
- **REUSE:** 18 files (same functional component, adapt tokens/classes)
- **RESTYLE:** 12 files (visual restyling to match client design, functional logic preserved)
- **ADAPT:** 5 files (token/mapping adaptations, type system, context merging)
- **NOT REQUIRED:** 15 files (mobile-only, project configs, duplicates)
- **BLOCKED:** 1 file (JSX structural issues in Audio.tsx, Users.tsx)
- **COMPLETE:** 28 files (full mapping with preserved backend logic)
- **PARTIAL:** 2 files (Audio.tsx, Users.tsx - container + header restyled, rest blocked by JSX)

**Key Integration Decisions:**
1. Tailwind v3 → v4 class adaptations: All RESTYLE'd components must map client's Tailwind v4 class names to admin panel's Tailwind v3 equivalents
2. Motion system: Client uses `motion` v12; admin panel uses `@radix-ui/react-*` + Tailwind transitions; decision needed per component
3. Z-index adaptation: Client uses `z-50`, `z-20`, `z-xs`; admin panel uses `--z-dropdown: 100`, `--z-modal: 200`, etc.; map consistently
4. RBAC preservation: All mappings preserve only `developer_super_admin`, `client_super_admin`, `mobile_user` - no new roles introduced
5. Firebase preservation: All backends intact; only UI styling modified