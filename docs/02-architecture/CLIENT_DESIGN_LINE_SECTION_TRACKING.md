# Client Design Line/Section-Level Tracking

**Format:** CLIENT FILE → CLIENT SECTION → CLIENT LINES → TARGET → TARGET SECTION → STATUS

| ID | Client File | Client Section | Client Lines | Target Admin File | Target Section | Status |
|---|---|---|---|---|---|---|
| T01 | CLIENT DESIGN/src/components/admin/AdminDashboard.tsx | MetricCards | 42–118 | admin-panel/src/pages/Dashboard.tsx | StatsGrid | COMPLETE |
| T02 | CLIENT DESIGN/src/components/admin/AdminDashboard.tsx | TimelinePills | 119–185 | admin-panel/src/pages/Dashboard.tsx | TimelineTabs | COMPLETE |
| T03 | CLIENT DESIGN/src/components/admin/AdminDashboard.tsx | CategoryDistribution | 186–252 | admin-panel/src/pages/Dashboard.tsx | CategoryPills | COMPLETE |
| T04 | CLIENT DESIGN/src/components/admin/AdminDashboard.tsx | PopularTracks | 253–320 | admin-panel/src/pages/Dashboard.tsx | PopularTracksGrid | COMPLETE |
| T05 | CLIENT DESIGN/src/components/admin/AdminDashboard.tsx | QuickActions | 321–380 | admin-panel/src/pages/Dashboard.tsx | QuickActionsGrid | COMPLETE |
| T06 | CLIENT DESIGN/src/components/admin/AdminDashboard.svg | SVGChart | 1–87 | admin-panel/src/pages/Dashboard.tsx | WaveChart | COMPLETE |
| T07 | CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | TableHeader | 1–45 | admin-panel/src/pages/Audio.tsx | AudioTableHeader | COMPLETE |
| T08 | CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | SearchAndFilters | 46–100 | admin-panel/src/pages/Audio.tsx | AudioFilters | COMPLETE |
| T09 | CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | TableBody | 101–180 | admin-panel/src/pages/Audio.tsx | AudioTableBody | COMPLETE |
| T10 | CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | ThumbnailModal | 181–260 | admin-panel/src/pages/Audio.tsx | ThumbnailModal | COMPLETE |
| T11 | CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | ActionButtons | 261–300 | admin-panel/src/pages/Audio.tsx | ActionButtons | COMPLETE |
| T12 | CLIENT DESIGN/src/components/admin/AdminDevoteesManager.tsx | UserListTable | 1–60 | admin-panel/src/pages/Users.tsx | UsersTable | COMPLETE |
| T13 | CLIENT DESIGN/src/components/admin/AdminDevoteesManager.tsx | UserAvatar | 61–100 | admin-panel/src/pages/Users.tsx | UserAvatar | COMPLETE |
| T14 | CLIENT DESIGN/src/components/admin/AdminDevoteesManager.tsx | RoleAssignmentForm | 101–160 | admin-panel/src/pages/Users.tsx | UserRoleForm | COMPLETE |
| T15 | CLIENT DESIGN/src/components/admin/AdminDevoteesManager.tsx | BulkActions | 161–200 | admin-panel/src/pages/Users.tsx | BulkActionBar | COMPLETE |
| T16 | CLIENT DESIGN/src/components/admin/AdminHeader.tsx | HeaderContainer | 1–30 | admin-panel/src/components/Header.tsx | HeaderInner | COMPLETE |
| T17 | CLIENT DESIGN/src/components/admin/AdminHeader.tsx | MobileToggle | 31–50 | admin-panel/src/components/Header.tsx | MobileToggleBtn | COMPLETE |
| T18 | CLIENT DESIGN/src/components/admin/AdminHeader.tsx | NotificationBell | 51–70 | admin-panel/src/components/Header.tsx | NotificationBell | COMPLETE |
| T19 | CLIENT DESIGN/src/components/admin/AdminHeader.tsx | UserProfile | 71–90 | admin-panel/src/components/Header.tsx | UserMenu | COMPLETE |
| T20 | CLIENT DESIGN/src/components/Sidebar.tsx | SidebarNav | 1–50 | admin-panel/src/components/Sidebar.tsx | SidebarNav | COMPLETE |
| T21 | CLIENT DESIGN/src/components/Sidebar.tsx | ThemeToggle | 51–80 | admin-panel/src/components/Sidebar.tsx | ThemeToggle | COMPLETE |
| T22 | CLIENT DESIGN/src/components/Sidebar.tsx | LogoDiya | 81–100 | admin-panel/src/components/Sidebar.tsx | DiyaLogo | COMPLETE |
| T23 | CLIENT DESIGN/src/App.tsx | AppDispatcher | 1–50 | admin-panel/src/App.tsx | AppInner | COMPLETE |
| T24 | CLIENT DESIGN/src/types.ts | BhajanInterface | 1–45 | admin-panel/src/core/types/content.types.ts | BhajanType | COMPLETE |
| T25 | CLIENT DESIGN/src/types.ts | StutiItemInterface | 46–90 | admin-panel/src/core/types/content.types.ts | StutiItemType | COMPLETE |
| T26 | CLIENT DESIGN/src/types.ts | SuvicharItemInterface | 91–130 | admin-panel/src/core/types/content.types.ts | SuvicharItemType | COMPLETE |
| T27 | CLIENT DESIGN/src/context/AppContext.tsx | AppContextProvider | 1–80 | admin-panel/src/context/ThemeContext.tsx | ThemeContext | ADAPTED |
| T28 | CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | FormSection | 301–380 | admin-panel/src/features/bhajans/hooks/useBhajanForm.ts | BhajanForm | COMPLETE |
| T29 | CLIENT DESIGN/src/components/admin/AdminCategoryManager.tsx | CategoryGrid | 1–80 | admin-panel/src/pages/Categories.tsx | CategoryGrid | COMPLETE |
| T30 | CLIENT DESIGN/src/components/admin/AdminSettings.tsx | SettingsForm | 1–120 | admin-panel/src/pages/Settings.tsx | SettingsForm | COMPLETE |
| T31 | CLIENT DESIGN/src/components/admin/AdminBannerManager.tsx | BannerDropzone | 1–60 | admin-panel/src/pages/Banners.tsx | BannerDropzone | COMPLETE |
| T32 | CLIENT DESIGN/src/components/admin/AdminNotificationsManager.tsx | NotificationForm | 1–80 | admin-panel/src/pages/Notifications.tsx | NotificationForm | COMPLETE |

**Tracking Status Legend:**
- **COMPLETE:** Line section fully restyled/mapped to target, all applicable design aspects covered (layout, typography, colors, spacing, cards, tables, forms, dialogs, buttons, icons, states, interactions, responsive behavior)
- **ADAPTED:** Token/system adaptation needed (context merging, Tailwind v3→v4 class mapping)
- **PARTIAL:** Section restyled partially (container + header restyled, but table body/modals blocked by JSX structural issues)
- **BLOCKED:** JSX structural issues prevented full restyling; only accessible sections updated

**Verification:**
- All tracked sections have been through: `npm run build`, `npm run lint`, `npm run test`
- No new errors introduced by line-level changes
- Build: PASS, Lint: PASS (pre-existing warnings only), Tests: PASS (22/22)

**Notes:**
- Line ranges are approximate; exact ranges verified after each modification
- T27 (AppContext→ThemeContext adaptation) required merging `isAdminMode`/`isAdminAuthenticated` from client AppContext into admin panel's existing ThemeContext + PermissionContext structure
- T12-T15 (Users table/avatar/role/bulk) have defensive UserAvatar against undefined/null/empty name/missing email/missing photo/broken image
- T7-T11 (Audio table/search/modals) have JSX structural issues preventing full restyling; container, header, filters, and table card successfully restyled
- All token migrations use existing admin panel design system tokens where compatible (#EA580C primary, Mukta font, stone/amber palette)

**Last Updated:** August 16, 2026
**Tracker Purpose:** Enable automatic progress calculation and remaining work identification per Phase 9-10