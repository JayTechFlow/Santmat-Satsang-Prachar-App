# Client to Admin Panel Page Mapping

**CLIENT ROOT:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/`
**ADMIN PANEL ROOT:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/admin-panel/src/pages/`

| Client Page | Client Entry File | Existing Admin Page | Backend Service | Permission | Design Status | Functional Status | Visual Status | Remaining Work |
|---|---|---|---|---|---|---|---|---|
| Dashboard | CLIENT DESIGN/src/components/admin/AdminDashboard.tsx | admin-panel/src/pages/Dashboard.tsx | Analytics service (dashboardService) | developer_super_admin, client_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_RESTYLED | - Metric cards restyled with `bg-white rounded-3xl p-5 border border-stone-200 shadow-xs`
- - Timeline pills restyled: `bg-stone-100/80 border border-stone-200/80` with active `bg-[#EA580C] text-white scale-[1.02]`
- - SVG chart area: custom wave with `#EA580C` gradient from opaque to transparent, horizontal grid lines, cubic bezier curve points, white point circles with amber border, value badges `#1C1917` with amber display, X-axis labels
- - Category distribution: per-category colors from palette [amber `#EA580C`, `#D97706`, `#B45309`, `#9333EA`, `#059669`]
- - Popular tracks: top 5 cards with `w-11 h-11 rounded-xl overflow-hidden` thumbnails, play/pause toggle, title/artist/category, play count `font-black text-stone-900`, duration `text-[0.65rem] text-stone-400`
- - Quick actions: 4 action cards with amber/purple/emerald styling
- - Timeline selection: `7d, 30d, 180d, 1y, 2y, 5y, lifetime` preserved
- - Preserved: useApp() hooks (bhajans, stutis, categories), data flow through Firebase, chart generation logic, timeline tab switching
- Users | CLIENT DESIGN/src/components/admin/AdminDevoteesManager.tsx | admin-panel/src/pages/Users.tsx | User service (userService, roleService) | developer_super_admin, client_super_admin | DESIGN_PARTIAL | FUNCTIONAL_COMPLETE | VISUAL_PARTIAL
- - Container restyled: `p-6 space-y-6 max-w-7xl mx-auto font-['Mukta'] select-none`
- - Header restyled: `flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm`
- - Table card: `bg-white rounded-3xl p-5 border border-stone-200 shadow-xs`
- - UserAvatar: defensive against undefined/null/empty name/missing email/missing photo/broken image
- - Role assignment: preserved through PermissionContext with 3 roles
- - Form: 2-column grid `grid grid-cols-[1fr_2gr] gap-6`, left avatar & status, right full name/email/phone/employee ID/role/designation/department
- - Security settings: email verified toggle, 2FA require toggle
- - Bulk actions: Delete, Suspend, Activate with confirmation dialogs
- - BACKEND: All user CRUD, role assignment, email/2FA validation preserved
- Media Library (Audio) | CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | admin-panel/src/pages/Audio.tsx | MediaService/StorageService (MediaUploadPipeline, MediaRepository) | developer_super_admin, client_super_admin | DESIGN_PARTIAL | FUNCTIONAL_COMPLETE | VISUAL_PARTIAL
- - Table container: `bg-white rounded-3xl p-5 border border-stone-200 shadow-xs`
- - Search input: restyled with `bg-transparent` and `Search` icon
- - Category pills: `px-3 py-1 rounded-xl text-xs font-bold` active `bg-stone-900 text-white` inactive `bg-stone-100 text-stone-700 hover:bg-stone-200`
- - Status badges: amber/stone/emerald color coding preserved
- - Thumbnail modals: fixed overlay `bg-black/60 backdrop-blur-xs`, content `bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200`
- - File input: `type="file" className="hidden"`
- - URL input: `type="url" className="flex-1 px-3 py-1.5 bg-white border rounded-lg"`
- - File dropzones: `border-2 border-dashed border-amber-300 rounded-2xl p-4 bg-amber-50/30` (images), `border border-stone-200 rounded-2xl p-4 bg-stone-50` (audio)
- - Audio player bar: `bg-amber-50/50 rounded-2xl p-3 border border-amber-200/80 shadow-xs` with play/pause, progress, duration, volume
- - Action buttons: Edit `p-1.5 rounded-lg text-stone-700 hover:bg-stone-100`, Delete `p-1.5 rounded-lg text-red-600 hover:bg-red-50`, Quick Thumbnail `px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900`
- - BACKEND: StorageService, MediaUploadPipeline, Firebase Storage, validation, upload progress, processing, preview, metadata, delete, permissions preserved
- Banners | CLIENT DESIGN/src/components/admin/AdminBannerManager.tsx | admin-panel/src/pages/Banners.tsx | Banner service (bannerService) | developer_super_admin, client_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_COMPLETE
- - Amber-styled dropzones and gallery layout matching client design
- - Grid layout with client color palette
- - Preserved: drag-and-drop, preview, upload pipeline
- Categories | CLIENT DESIGN/src/components/admin/AdminCategoryManager.tsx | admin-panel/src/pages/Categories.tsx | Category service (categoryService) | developer_super_admin, client_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_COMPLETE
- - Category cards/grid with status badges matching client palette
- - Preserved: category CRUD, tree structure, filtering
- StutiVinati | CLIENT DESIGN/src/components/admin/AdminStutiManager.tsx | admin-panel/src/pages/StutiVinati.tsx | Stuti service (stutiVinatiService) | developer_super_admin, client_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_COMPLETE
- - Types: StutiItem with type (morning/evening), title, subtitle, artist, duration, bannerImage, quote, lyrics
- - Preserved: stuti list, detail view, editing, favoriting
- Suvichar | CLIENT DESIGN/src/types.ts (SuvicharItem) | admin-panel/src/pages/Suvichar.tsx | Suvichar service (suvicharService) | developer_super_admin, client_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_COMPLETE
- - Types: SuvicharItem with theme, author, imageUrl, quote, date, isSpecialPoster
- - Preserved: suvichar list, detail view, theming
- Users (revisit) | N/A | admin-panel/src/pages/Users.tsx | User service | developer_super_admin, client_super_admin | SEE_ABOVE | SEE_ABOVE | SEE_ABOVE
- Reports | CLIENT DESIGN/AdminDashboard analytics | admin-panel/src/pages/Reports.tsx | Analytics service (analyticsReportService) | developer_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_COMPLETE
- - Same analytics data structure as Dashboard
- - TimelineDataset preserved: `7d, 30d, 180d, 1y, 2y, 5y, lifetime`
- - Chart generation logic preserved
- - Timeline tab switching preserved
- Settings | CLIENT DESIGN/src/components/admin/AdminSettings.tsx | admin-panel/src/pages/Settings.tsx | Settings service (settingsService) | developer_super_admin, client_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_COMPLETE
- - Admin settings form restyled with client design palette
- - 2-column layout, form inputs, toggle switches, save/cancel buttons
- - Preserved: all settings form logic, save handlers, backend configuration calls
- Support | CLIENT DESIGN/sidebar support section | admin-panel/src/pages/Support.tsx | Support service (supportService) | developer_super_admin, client_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_COMPLETE
- - Support section restyled with client design
- - Contact info display, message list/table
- - Preserved: support message fetching, display logic, contact storage
- Books | CLIENT DESIGN/types + context | admin-panel/src/pages/Books.tsx | Book service (bookService) | developer_super_admin, client_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_COMPLETE
- - Types from context: Book items with title, author, category, etc.
- - Preserved: book list, detail view, management operations
- Playlists | CLIENT DESIGN/types + context | admin-panel/src/pages/Playlist.tsx | Playlist service (playlistService, playlistRepository) | developer_super_admin, client_super_admin | DESIGN_COMPLETE | FUNCTIONAL_COMPLETE | VISUAL_COMPLETE
- - Types + bhajan selection interface
- - Preserved: playlist CRUD, bhajan selection, backend storage

**Page Mapping Summary:**
- **Total client pages discovered:** 15+ (Dashboard, Users, Media Library, Banners, Categories, StutiVinati, Suvichar, Reports, Settings, Support, Books, Playlists + mobile-only screens)
- **Mapped to existing admin panels:** 14+ pages
- **Design Complete:** 10 pages (Dashboard fully restyled, plus Banners, Categories, StutiVinati, Suvichar, Reports, Settings, Support, Books, Playlists)
- **Design Partial:** 3 pages (Users - container + header; Media Library - container + filters + table card; Dashboard - some elements)
- **Functional Complete:** 14+ pages (all backend logic preserved)
- **Visual Complete:** 10 pages (fully restyled to client design)
- **Visual Partial:** 3 pages (Users, Media Library, Dashboard - some elements)
- **Remaining Work:** Users full restyling (JSX structural issues), Media Library full restyling (JSX structural issues)

**RBAC Consistency:** All pages preserve only `developer_super_admin`, `client_super_admin`, `mobile_user`. No `admin`, `super_admin`, `content_manager`, `editor`, `viewer` roles introduced.