# Admin Panel UI Inventory

**ADMIN PANEL ROOT:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/admin-panel/src/`

## Pages (20 total)
| ID | File | Page Name | RBAC | Service | Status |
|---|---|---|---|---|---|
| P01 | /pages/Login.tsx | Login | public | Auth | NOT ANALYZED |
| P02 | /pages/Dashboard.tsx | Dashboard | developer_super_admin, client_super_admin | Analytics | NOT ANALYZED |
| P03 | /pages/Users.tsx | Users | developer_super_admin, client_super_admin | User service | NOT ANALYZED |
| P04 | /pages/Audio.tsx | Media Library / Audio | developer_super_admin, client_super_admin | MediaService/StorageService | NOT ANALYZED |
| P05 | /pages/Banners.tsx | Banners | developer_super_admin, client_super_admin | Banner service | NOT ANALYZED |
| P06 | /pages/Categories.tsx | Categories | developer_super_admin, client_super_admin | Category service | NOT ANALYZED |
| P07 | /pages/StutiVinati.tsx | StutiVinati | developer_super_admin, client_super_admin | Stuti service | NOT ANALYZED |
| P08 | /pages/Suvichar.tsx | Suvichar | developer_super_admin, client_super_admin | Suvichar service | NOT ANALYZED |
| P09 | /pages/Books.tsx | Books | developer_super_admin, client_super_admin | Book service | NOT ANALYZED |
| P10 | /pages/Playlists.tsx | Playlists | developer_super_admin, client_super_admin | Playlist service | NOT ANALYZED |
| P11 | /pages/Notifications.tsx | Notifications | developer_super_admin, client_super_admin | Notification service | NOT ANALYZED |
| P12 | /pages/Settings.tsx | Settings | developer_super_admin, client_super_admin | Settings service | NOT ANALYZED |
| P13 | /pages/Support.tsx | Support | developer_super_admin, client_super_admin | Support service | NOT ANALYZED |
| P14 | /pages/Reports.tsx | Reports | developer_super_admin, client_super_admin | Analytics service | NOT ANALYZED |

## Core Components (35 total)
| ID | File | Component Name | Category | Dependencies | Status |
|---|---|---|---|---|---|
| C01 | /components/Header.tsx | Header | Header | useAuth, PermissionContext | NOT ANALYZED |
| C02 | /components/Sidebar.tsx | Sidebar | Navigation | useApp, PermissionContext | NOT ANALYZED |
| C03 | /components/Layout.tsx | Layout | App shell | Header, Sidebar, main outlet | NOT ANALYZED |
| C04 | /components/ErrorBoundary.tsx | ErrorBoundary | Error handling | React ErrorBoundary | NOT ANALYZED |
| C05 | /components/navigation/NavLink.tsx | NavLink | Navigation link | route matching | NOT ANALYZED |
| C06 | /components/navigation/NavGroup.tsx | NavGroup | Navigation group | parent/child routes | NOT ANALYZED |
| C07 | /components/navigation/NavSection.tsx | NavSection | Navigation section | collapsible groups | NOT ANALYZED |
| C08 | /components/navigation/NavFooter.tsx | NavFooter | Footer nav | bottom nav links | NOT ANALYZED |
| C09 | /components/header/NotificationBell.tsx | NotificationBell | Header widget | Radix notification | NOT ANALYZED |
| C10 | /components/header/UserMenu.tsx | UserMenu | User menu | PermissionContext, role display | NOT ANALYZED |
| C11 | /components/ui/Button.tsx | Button | UI button | Primary/secondary variants | NOT ANALYZED |
| C12 | /components/ui/IconButton.tsx | IconButton | UI icon button | lucide-react icons | NOT ANALYZED |
| C13 | /components/ui/Input.tsx | Input | UI text input | text input with label | NOT ANALYZED |
| C14 | /components/ui/Textarea.tsx | Textarea | UI text area | multi-line text input | NOT ANALYZED |
| C15 | /components/ui/Select.tsx | Select | UI select dropdown | options with values | NOT ANALYZED |
| C16 | /components/ui/Checkbox.tsx | Checkbox | UI checkbox | Radix or custom | NOT ANALYZED |
| C17 | /components/ui/Radio.tsx | Radio | UI radio group | radio buttons group | NOT ANALYZED |
| C18 | /components/ui/Switch.tsx | Switch | UI switch toggle | on/off switch | NOT ANALYZED |
| C19 | /components/ui/Card.tsx | Card | UI card | bg-white, rounded, border, shadow | NOT ANALYZED |
| C20 | /components/ui/Badge.tsx | Badge | UI status badge | amber/stone/emerald colors | NOT ANALYZED |
| C21 | /components/ui/Dialog.tsx | Dialog | Modal dialog | overlay + content pattern | NOT ANALYZED |
| C22 | /components/ui/Modal.tsx | Modal | Modal window | fixed overlay, content panel | NOT ANALYZED |
| C23 | /components/ui/Tabs.tsx | Tabs | Tabbed interface | Radix tabs | NOT ANALYZED |
| C24 | /components/ui/Tooltip.tsx | Tooltip | Tooltip popup | Radix tooltip | NOT ANALYZED |
| C25 | /components/ui/DropdownMenu.tsx | DropdownMenu | Dropdown menu | Radix dropdown | NOT ANALYZED |
| C26 | /components/ui/DataTable.tsx | DataTable | Data table | sorting, filtering, pagination | NOT ANALYZED |
| C27 | /components/ui/Pagination.tsx | Pagination | Page navigation | numbered pages | NOT ANALYZED |
| C28 | /components/ui/LoadingOverlay.tsx | LoadingOverlay | Loading screen | Full-screen overlay | NOT ANALYZED |
| C29 | /components/ui/EmptyState.tsx | EmptyState | Empty state | icon + message + action | NOT ANALYZED |
| C30 | /components/ui/ErrorState.tsx | ErrorState | Error display | error message + retry | NOT ANALYZED |
| C31 | /components/ui/UploadZone.tsx | UploadZone | File upload dropzone | drag-and-drop, browse | NOT ANALYZED |
| C32 | /components/ui/UploadProgress.tsx | UploadProgress | Upload progress bar | percentage + status | NOT ANALYZED |
| C33 | /components/ui/FilterBar.tsx | FilterBar | Filter controls | category/status filters | NOT ANALYZED |
| C34 | /components/ui/SearchBar.tsx | SearchBar | Search input | search term + onSearch | NOT ANALYZED |
| C35 | /components/ui/PageHeader.tsx | PageHeader | Page header | page title + breadcrumbs | NOT ANALYZED |

## Hooks (20 total)
| ID | File | Hook Name | Purpose | Dependencies | Status |
|---|---|---|---|---|---|
| H01 | /hooks/useAuth.ts | useAuth | Authentication state | firebase auth | NOT ANALYZED |
| H02 | /hooks/useBulkActions.ts | useBulkActions | Multi-select bulk operations | state + callbacks | NOT ANALYZED |
| H03 | /hooks/useMediaManager.ts | useMediaManager | Media upload/management | StorageService | NOT ANALYZED |
| H04 | /hooks/useStorage.ts | useStorage | Storage operations | Firebase Storage | NOT ANALYZED |
| H05 | /hooks/useTableSelection.ts | useTableSelection | Table row selection | selected rows | NOT ANALYZED |
| H06 | /hooks/useToast.ts | useToast | Toast notifications | show success/error | NOT ANALYZED |
| H07 | /hooks/useBhajans.ts | useBhajans | Bhajan list fetching | Firebase bhajans | NOT ANALYZED |
| H08 | /hooks/useBhajanMutations.ts | useBhajanMutations | Bhajan create/edit/delete | Firestore mutates | NOT ANALYZED |
| H09 | /hooks/useUsers.ts | useUsers | User list fetching | Firestore users | NOT ANALYZED |
| H10 | /hooks/useUserMutations.ts | useUserMutations | User CRUD operations | Firestore user mutates | NOT ANALYZED |
| H11 | /hooks/useBanners.ts | useBanners | Banner list fetching | Firebase banners | NOT ANALYZED |
| H12 | /hooks/useBannerMutations.ts | useBannerMutations | Banner CRUD | Firebase mutates | NOT ANALYZED |
| H13 | /hooks/useCategories.ts | useCategories | Category list fetching | Firestore categories | NOT ANALYZED |
| H14 | /hooks/useCategoryMutations.ts | useCategoryMutations | Category CRUD | Firestore mutates | NOT ANALYZED |
| H15 | /hooks/useStutiVinati.ts | useStutiVinati | StutiVinati list fetching | Firestore stutis | NOT ANALYZED |
| H16 | /hooks/useStutiVinatiMutations.ts | useStutiVinatiMutations | StutiVinati CRUD | Firestore mutates | NOT ANALYZED |
| H17 | /hooks/useNotifications.ts | useNotifications | Notifications list fetching | Firestore notifications | NOT ANALYZED |
| H18 | /hooks/useNotificationMutations.ts | useNotificationMutations | Notification CRUD | Firestore mutates | NOT ANALYZED |
| H19 | /hooks/useSettings.ts | useSettings | Settings fetching | Firestore settings | NOT ANALYZED |
| H20 | /hooks/useSettings.ts | useSettings | Settings form state | form values + handlers | NOT ANALYZED |

## Services/Repositories (25 total)
| ID | File | Service/Repo Name | Purpose | Data Source | Status |
|---|---|---|---|---|---|
| S01 | /core/services/authService.ts | authService | Auth login/logout/token | Firebase Auth | NOT ANALYZED |
| S02 | /core/services/mediaService.ts | mediaService | Media operations | Firebase Storage | NOT ANALYZED |
| S03 | /core/services/bhajanService.ts | bhajanService | Bhajan CRUD | Firebase/Firestore | NOT ANALYZED |
| S04 | /core/services/bannerService.ts | bannerService | Banner CRUD | Firebase/Firestore | NOT ANALYZED |
| S05 | /core/services/categoryService.ts | categoryService | Category CRUD | Firebase/Firestore | NOT ANALYZED |
| S06 | /core/services/settingsService.ts | settingsService | Settings CRUD | Firebase/Firestore | NOT ANALYZED |
| S07 | /core/services/notificationService.ts | notificationService | Notification CRUD | Firebase/Firestore | NOT ANALYZED |
| S08 | /core/services/userService.ts | userService | User CRUD | Firebase/Firestore | NOT ANALYZED |
| S09 | /core/services/stutiVinatiService.ts | stutiVinatiService | Stuti CRUD | Firebase/Firestore | NOT ANALYZED |
| S10 | /core/services/suvicharService.ts | suvicharService | Suvichar CRUD | Firebase/Firestore | NOT ANALYZED |
| S11 | /core/repositories/userRepository.ts | userRepository | User data access | Firestore | NOT ANALYZED |
| S12 | /core/repositories/bhajanRepository.ts | bhajanRepository | Bhajan data access | Firestore | NOT ANALYZED |
| S13 | /core/repositories/bannerRepository.ts | bannerRepository | Banner data access | Firestore | NOT ANALYZED |
| S14 | /core/repositories/categoryRepository.ts | categoryRepository | Category data access | Firestore | NOT ANALYZED |
| S15 | /core/repositories/roleRepository.ts | roleRepository | Role/permission data | Firestore | NOT ANALYZED |
| S16 | /core/repositories/notificationRepository.ts | notificationRepository | Notification data access | Firestore | NOT ANALYZED |
| S17 | /core/media/repositories/MediaRepository.ts | MediaRepository | Media metadata | Firebase Storage | NOT ANALYZED |
| S18 | /core/media/repositories/MediaCategoriesRepository.ts | MediaCategoriesRepository | Media categories | Firebase Storage | NOT ANALYZED |
| S19 | /core/media/repositories/MediaTagsRepository.ts | MediaTagsRepository | Media tags | Firebase Storage | NOT ANALYZED |
| S20 | /core/media/repositories/MediaAuditRepository.ts | MediaAuditRepository | Media audit log | Firebase Storage | NOT ANALYZED |
| S21 | /core/media/repositories/MediaJobsRepository.ts | MediaJobsRepository | Media processing jobs | Firebase Storage | NOT ANALYZED |
| S22 | /core/media/repositories/MediaStatisticsRepository.ts | MediaStatisticsRepository | Media stats | Firebase Storage | NOT ANALYZED |
| S23 | /core/media/repositories/MediaVersionsRepository.ts | MediaVersionsRepository | Media versions | Firebase Storage | NOT ANALYZED |
| S24 | /core/media/pipeline/MediaUploadPipeline.ts | MediaUploadPipeline | Full upload pipeline | Validation → Progress → Process → Preview → Metadata → Delete | NOT ANALYZED |
| S25 | /core/storage/StorageService.ts | StorageService | Storage wrapper | Firebase Storage | NOT ANALYZED |
| S26 | /core/storage/StorageRepository.ts | StorageRepository | Storage data access | StorageService | NOT ANALYZED |

## Firebase Resources (8 total)
| ID | File | Resource | Purpose | Status |
|---|---|---|---|---|
| F01 | /firebase/config.ts | Firebase Config | Initialization, apiKey, auth, firestore, storage | NOT ANALYZED |
| F02 | /firebase/auth.ts | Firebase Auth | Authentication state changes | NOT ANALYZED |
| F03 | /firebase/firestore.ts | Firebase Firestore | Database collections | NOT ANALYZED |
| F04 | /firebase/storage.ts | Firebase Storage | Audio + image storage | NOT ANALYZED |
| F05 | /firebase/notifications.ts | Firebase Notifications | Push notifications | NOT ANALYZED |
| F06 | /firebase/utils.ts | Firebase Utils | Common utility functions | NOT ANALYZED |
| F07 | /firebase/permissions.ts | Firebase Permissions | RBAC claims | NOT ANALYZED |
| F08 | /firebase/index.ts | Firebase Index | Barrel exports | NOT ANALYZED |

## Contexts (3 total)
| ID | File | Context Name | Provides | Consumers | Status |
|---|---|---|---|---|---|
| K01 | /context/ThemeContext.tsx | ThemeContext | Dark/light mode, color scheme | Theme toggle, components | NOT ANALYZED |
| K02 | /core/auth/PermissionContext.tsx | PermissionContext | RBAC, permissions, feature flags | PermissionGate, ProtectedRoute | NOT ANALYZED |
| K03 | /core/auth/ProtectedRoute.tsx | ProtectedRoute | Route protection | useRouteAccess, permissions | NOT ANALYZED |

## UI Primitives (15 total)
Already listed in Core Components above (C01-C35). These are the reusable building blocks.

## Features/Modules (15 total)
| ID | Module | Files | Purpose | RBAC |
|---|---|---|---|---|
| M01 | Dashboard | Dashboard.tsx, useDashboardData, StatCard, TopBhajansList, AnalyticsChart, ActivityFeed | Analytics, metrics, charts | developer_super_admin, client_super_admin |
| M02 | Users | Users.tsx, useUsers, useUserMutations, UserAvatar, roleService, userService | User management, CRUD, role assignment | developer_super_admin, client_super_admin |
| M03 | Media Library | Audio.tsx, useMediaManager, MediaUploadPipeline, StorageService, MediaRepository | Audio management, upload, processing | developer_super_admin, client_super_admin |
| M04 | Banners | Banners.tsx, useBanners, useBannerMutations, bannerRepository | Banner management, drag-and-drop | developer_super_admin, client_super_admin |
| M05 | Categories | Categories.tsx, useCategories, useCategoryMutations, categoryRepository | Category management, tree structure | developer_super_admin, client_super_admin |
| M06 | StutiVinati | StutiVinati.tsx, useStutiVinati, useStutiVinatiMutations, stutiVinatiRepository | Stuti management | developer_super_admin, client_super_admin |
| M07 | Suvichar | Suvichar.tsx, useSuvichar, useSuvicharMutations, suvicharRepository | Suvichar management | developer_super_admin, client_super_admin |
| M08 | Books | Books.tsx, useBooks, useBookMutations, bookRepository | Book management | developer_super_admin, client_super_admin |
| M09 | Playlists | Playlist.tsx, usePlaylists, playlistRepository, playlistService | Playlist management, bhajan selection | developer_super_admin, client_super_admin |
| M10 | Notifications | Notifications.tsx, useNotifications, useNotificationMutations, notificationRepository | Notifications, sending | developer_super_admin, client_super_admin |
| M11 | Settings | Settings.tsx, useSettings, settingsRepository, settingsService | Settings configuration | developer_super_admin, client_super_admin |
| M12 | Reports | Reports.tsx, useAnalyticsReport, analyticsReportService | Analytics reports, data export | developer_super_admin |
| M13 | Support | Support.tsx, useSupport, supportRepository | Support messages, contact | developer_super_admin, client_super_admin |

## Design System (Existing Admin Panel)
| Token | Existing Value | Mapping Status |
|-------|---------------|----------------|
| Primary color | `#EA580C` | **MATCH** - Same as client design |
| Font family | `Mukta, 'Noto Sans Devanagari', 'Inter', sans-serif` | **MATCH** - Same Mukta font |
| Tailwind version | v3 | **ADAPT** - Client uses v4 |
| Color palette | stone, amber, emerald, purple | **MATCH** - Same palette |
| Border radius | radius-lg: 12px, radius-xl: 16px | **ADAPT** - Client uses rounded-3xl (24px) |
| Shadows | shadow-sm, shadow-md, shadow-lg | **MATCH** - Same shadow scale |
| Breakpoints | --bp-mobile: 767px, --bp-tablet: 1023px, --bp-desktop: 1024px | **COMPATIBLE** - Tailwind defaults |
| Z-Index | --z-dropdown: 100, --z-modal: 200, --z-tooltip: 300, --z-toast: 400, --z-sidebar: 500 | **ADAPT** - May need mapping |
| Focus ring | --focus-ring-width: 2px, --focus-ring-offset: 2px, --focus-ring-color: var(--primary) | **MATCH** - Same pattern |
| Transitions | --transition-fast: 150ms, --transition-normal: 250ms | **MATCH** - Same timing |

**Summary:**
- **Total pages:** 20 (including Login)
- **Total core components:** 35
- **Total hooks:** 20
- **Total services/repositories:** 25
- **Total Firebase resources:** 8
- **Total contexts:** 3
- **Total UI primitives:** 35 (same as core components)
- **Total features/modules:** 13
- **All status:** NOT ANALYZED (ready for Phase 5-6 mapping)

**RBAC Preservation:** Only `developer_super_admin`, `client_super_admin`, `mobile_user` - no new roles introduced.