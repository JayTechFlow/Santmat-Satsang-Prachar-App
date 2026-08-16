# React Imports Audit Report

## Overview
Total files with issues: 82
Total issues found: 136

## Duplicate import (14)
| File | Evidence | Recommended Fix |
|------|----------|-----------------|
| `src/App.tsx` | Multiple imports from 'react' | Consolidate imports from 'react' |
| `src/components/ErrorBoundary.tsx` | Multiple imports from 'react' | Consolidate imports from 'react' |
| `src/core/hooks/useCrud.ts` | Multiple imports from '../repositories/BaseRepository' | Consolidate imports from '../repositories/BaseRepository' |
| `src/core/repositories/authRepository.ts` | Multiple imports from 'firebase/auth' | Consolidate imports from 'firebase/auth' |
| `src/core/services/BaseCrudService.ts` | Multiple imports from '../repositories/BaseRepository' | Consolidate imports from '../repositories/BaseRepository' |
| `src/core/services/BaseCrudService.ts` | Multiple imports from '../repositories/BaseRepository' | Consolidate imports from '../repositories/BaseRepository' |
| `src/features/categories/components/CategoryTree.tsx` | Multiple imports from '../utils/tree' | Consolidate imports from '../utils/tree' |
| `src/pages/Banners.tsx` | Multiple imports from '../components/ui/DataTable' | Consolidate imports from '../components/ui/DataTable' |
| `src/pages/Books.tsx` | Multiple imports from '../components/ui/DataTable' | Consolidate imports from '../components/ui/DataTable' |
| `src/pages/Categories.tsx` | Multiple imports from '../components/ui/DataTable' | Consolidate imports from '../components/ui/DataTable' |
| `src/pages/Notifications.tsx` | Multiple imports from '../components/ui/DataTable' | Consolidate imports from '../components/ui/DataTable' |
| `src/pages/StutiVinati.tsx` | Multiple imports from '../components/ui/DataTable' | Consolidate imports from '../components/ui/DataTable' |
| `src/pages/Suvichar.tsx` | Multiple imports from '../components/ui/DataTable' | Consolidate imports from '../components/ui/DataTable' |
| `src/pages/Users.tsx` | Multiple imports from '../components/ui/DataTable' | Consolidate imports from '../components/ui/DataTable' |

## Import ordering (25)
| File | Evidence | Recommended Fix |
|------|----------|-----------------|
| `src/App.tsx` | Absolute import 'react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/components/Layout.tsx` | Absolute import 'react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/components/ui/AudioUpload.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/components/ui/ImageUpload.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/components/ui/PDFUpload.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/core/services/authService.ts` | Absolute import 'firebase/auth' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/banners/components/BannerStatusBadge.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/banners/repositories/bannerRepository.ts` | Absolute import 'firebase/firestore' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/banners/types/index.ts` | Absolute import 'firebase/firestore' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/books/components/BookStatusBadge.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/books/repositories/bookRepository.ts` | Absolute import 'firebase/firestore' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/categories/components/CategoryBreadcrumb.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/categories/components/CategoryTree.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/categories/repositories/categoryRepository.ts` | Absolute import 'firebase/firestore' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/dashboard/components/ActivityFeed.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/dashboard/components/AnalyticsChart.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/dashboard/components/TopBhajansList.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/notifications/components/NotificationStatusBadge.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/stuti-vinati/components/PrayerStatusBadge.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/stuti-vinati/repositories/stutiVinatiRepository.ts` | Absolute import 'firebase/firestore' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/users/components/UserStatusBadge.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/features/users/repositories/userRepository.ts` | Absolute import 'firebase/firestore' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/hooks/useAuth.ts` | Absolute import 'react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/pages/Dashboard.tsx` | Absolute import 'lucide-react' appears after relative imports | Move absolute and third-party imports before relative imports. |
| `src/pages/Login.tsx` | Absolute import 'react-router-dom' appears after relative imports | Move absolute and third-party imports before relative imports. |

## Unused import (97)
| File | Evidence | Recommended Fix |
|------|----------|-----------------|
| `src/components/ErrorBoundary.tsx` | Import 'type  ErrorInfo' from 'react' is unused | Remove 'type  ErrorInfo' from import statement. |
| `src/components/ui/FileUpload.tsx` | Import 'type UploadZoneProps' from './UploadZone' is unused | Remove 'type UploadZoneProps' from import statement. |
| `src/components/ui/ToastProvider.tsx` | Import 'type ReactNode' from 'react' is unused | Remove 'type ReactNode' from import statement. |
| `src/components/ui/ToastProvider.tsx` | Import 'type ToastType' from '../../hooks/useToast' is unused | Remove 'type ToastType' from import statement. |
| `src/components/ui/ToastProvider.tsx` | Import 'type ToastMessage' from '../../hooks/useToast' is unused | Remove 'type ToastMessage' from import statement. |
| `src/core/hooks/useCrud.ts` | Import 'type  PaginationOptions' from '../repositories/BaseRepository' is unused | Remove 'type  PaginationOptions' from import statement. |
| `src/core/hooks/useCrud.ts` | Import 'type  CustomQueryOptions' from '../repositories/BaseRepository' is unused | Remove 'type  CustomQueryOptions' from import statement. |
| `src/core/hooks/useList.ts` | Import 'type  BaseCrudService' from '../services/BaseCrudService' is unused | Remove 'type  BaseCrudService' from import statement. |
| `src/core/hooks/useList.ts` | Import 'type  CustomQueryOptions' from '../repositories/BaseRepository' is unused | Remove 'type  CustomQueryOptions' from import statement. |
| `src/core/repositories/BaseRepository.ts` | Import 'type  Firestore' from 'firebase/firestore' is unused | Remove 'type  Firestore' from import statement. |
| `src/core/repositories/authRepository.ts` | Import 'type  User' from 'firebase/auth' is unused | Remove 'type  User' from import statement. |
| `src/core/services/BaseCrudService.ts` | Import 'type  PaginationOptions' from '../repositories/BaseRepository' is unused | Remove 'type  PaginationOptions' from import statement. |
| `src/core/services/BaseCrudService.ts` | Import 'type  BaseRepository' from '../repositories/BaseRepository' is unused | Remove 'type  BaseRepository' from import statement. |
| `src/core/services/BaseCrudService.ts` | Import 'type  CustomQueryOptions' from '../repositories/BaseRepository' is unused | Remove 'type  CustomQueryOptions' from import statement. |
| `src/core/services/authService.ts` | Import 'type  User' from 'firebase/auth' is unused | Remove 'type  User' from import statement. |
| `src/core/storage/StorageRepository.ts` | Import 'type  FirebaseStorage' from 'firebase/storage' is unused | Remove 'type  FirebaseStorage' from import statement. |
| `src/features/banners/components/BannerStatusBadge.tsx` | Import 'type  BannerDTO' from '../types' is unused | Remove 'type  BannerDTO' from import statement. |
| `src/features/banners/hooks/useBannerMutations.ts` | Import 'type  BannerDTO' from '../types' is unused | Remove 'type  BannerDTO' from import statement. |
| `src/features/banners/hooks/useBanners.ts` | Import 'type  BannerDTO' from '../types' is unused | Remove 'type  BannerDTO' from import statement. |
| `src/features/banners/hooks/useBanners.ts` | Import 'type  QueryFilter' from '../../../core/repositories/BaseRepository' is unused | Remove 'type  QueryFilter' from import statement. |
| `src/features/banners/repositories/bannerRepository.ts` | Import 'type  BannerDTO' from '../types' is unused | Remove 'type  BannerDTO' from import statement. |
| `src/features/banners/services/bannerService.ts` | Import 'type  BannerDTO' from '../types' is unused | Remove 'type  BannerDTO' from import statement. |
| `src/features/banners/types/index.ts` | Import 'type  EntityWithAudit' from '../../../core/services/BaseCrudService' is unused | Remove 'type  EntityWithAudit' from import statement. |
| `src/features/banners/types/index.ts` | Import 'type  Timestamp' from 'firebase/firestore' is unused | Remove 'type  Timestamp' from import statement. |
| `src/features/bhajans/hooks/useBhajanMutations.ts` | Import 'type  BhajanDTO' from '../types' is unused | Remove 'type  BhajanDTO' from import statement. |
| `src/features/bhajans/hooks/useBhajans.ts` | Import 'type  BhajanDTO' from '../types' is unused | Remove 'type  BhajanDTO' from import statement. |
| `src/features/bhajans/hooks/useBhajans.ts` | Import 'type  QueryFilter' from '../../../core/repositories/BaseRepository' is unused | Remove 'type  QueryFilter' from import statement. |
| `src/features/bhajans/repositories/bhajanRepository.ts` | Import 'type  BhajanDTO' from '../types' is unused | Remove 'type  BhajanDTO' from import statement. |
| `src/features/bhajans/services/bhajanService.ts` | Import 'type  BhajanDTO' from '../types' is unused | Remove 'type  BhajanDTO' from import statement. |
| `src/features/books/components/BookStatusBadge.tsx` | Import 'type  PublishStatus' from '../types' is unused | Remove 'type  PublishStatus' from import statement. |
| `src/features/books/hooks/useBookMutations.ts` | Import 'type  BookDTO' from '../types' is unused | Remove 'type  BookDTO' from import statement. |
| `src/features/books/hooks/useBooks.ts` | Import 'type  BookDTO' from '../types' is unused | Remove 'type  BookDTO' from import statement. |
| `src/features/books/hooks/useBooks.ts` | Import 'type  QueryFilter' from '../../../core/repositories/BaseRepository' is unused | Remove 'type  QueryFilter' from import statement. |
| `src/features/books/repositories/bookRepository.ts` | Import 'type  BookDTO' from '../types' is unused | Remove 'type  BookDTO' from import statement. |
| `src/features/books/services/bookService.ts` | Import 'type  BookDTO' from '../types' is unused | Remove 'type  BookDTO' from import statement. |
| `src/features/books/types/index.ts` | Import 'type  EntityWithAudit' from '../../../core/services/BaseCrudService' is unused | Remove 'type  EntityWithAudit' from import statement. |
| `src/features/categories/components/CategoryBreadcrumb.tsx` | Import 'type  CategoryDTO' from '../types' is unused | Remove 'type  CategoryDTO' from import statement. |
| `src/features/categories/components/CategorySelector.tsx` | Import 'type  CategoryDTO' from '../types' is unused | Remove 'type  CategoryDTO' from import statement. |
| `src/features/categories/components/CategoryTree.tsx` | Import 'type  CategoryDTO' from '../types' is unused | Remove 'type  CategoryDTO' from import statement. |
| `src/features/categories/components/CategoryTree.tsx` | Import 'type  CategoryTreeNode' from '../utils/tree' is unused | Remove 'type  CategoryTreeNode' from import statement. |
| `src/features/categories/hooks/useCategories.ts` | Import 'type  CategoryDTO' from '../types' is unused | Remove 'type  CategoryDTO' from import statement. |
| `src/features/categories/hooks/useCategories.ts` | Import 'type  QueryFilter' from '../../../core/repositories/BaseRepository' is unused | Remove 'type  QueryFilter' from import statement. |
| `src/features/categories/hooks/useCategoryMutations.ts` | Import 'type  CategoryDTO' from '../types' is unused | Remove 'type  CategoryDTO' from import statement. |
| `src/features/categories/repositories/categoryRepository.ts` | Import 'type  CategoryDTO' from '../types' is unused | Remove 'type  CategoryDTO' from import statement. |
| `src/features/categories/services/categoryService.ts` | Import 'type  CategoryDTO' from '../types' is unused | Remove 'type  CategoryDTO' from import statement. |
| `src/features/categories/types/index.ts` | Import 'type  EntityWithAudit' from '../../../core/services/BaseCrudService' is unused | Remove 'type  EntityWithAudit' from import statement. |
| `src/features/categories/utils/tree.ts` | Import 'type  CategoryDTO' from '../types' is unused | Remove 'type  CategoryDTO' from import statement. |
| `src/features/dashboard/components/ActivityFeed.tsx` | Import 'type  ActivityItemDTO' from '../types' is unused | Remove 'type  ActivityItemDTO' from import statement. |
| `src/features/dashboard/components/AnalyticsChart.tsx` | Import 'type  ChartDataDTO' from '../types' is unused | Remove 'type  ChartDataDTO' from import statement. |
| `src/features/dashboard/components/StatCard.tsx` | Import 'type  DashboardStatsViewModel' from '../types' is unused | Remove 'type  DashboardStatsViewModel' from import statement. |
| `src/features/dashboard/components/TopBhajansList.tsx` | Import 'type  BhajanDTO' from '../types' is unused | Remove 'type  BhajanDTO' from import statement. |
| `src/features/dashboard/hooks/useDashboardData.ts` | Import 'type  DashboardStatsViewModel' from '../types' is unused | Remove 'type  DashboardStatsViewModel' from import statement. |
| `src/features/dashboard/repositories/dashboardRepository.ts` | Import 'type  ActivityItemDTO' from '../types' is unused | Remove 'type  ActivityItemDTO' from import statement. |
| `src/features/dashboard/services/dashboardService.ts` | Import 'type  DashboardStatsViewModel' from '../types' is unused | Remove 'type  DashboardStatsViewModel' from import statement. |
| `src/features/notifications/components/NotificationStatusBadge.tsx` | Import 'type  PushStatus' from '../types' is unused | Remove 'type  PushStatus' from import statement. |
| `src/features/notifications/hooks/useNotificationMutations.ts` | Import 'type  NotificationDTO' from '../types' is unused | Remove 'type  NotificationDTO' from import statement. |
| `src/features/notifications/hooks/useNotifications.ts` | Import 'type  NotificationDTO' from '../types' is unused | Remove 'type  NotificationDTO' from import statement. |
| `src/features/notifications/hooks/useNotifications.ts` | Import 'type  QueryFilter' from '../../../core/repositories/BaseRepository' is unused | Remove 'type  QueryFilter' from import statement. |
| `src/features/notifications/repositories/notificationRepository.ts` | Import 'type  NotificationDTO' from '../types' is unused | Remove 'type  NotificationDTO' from import statement. |
| `src/features/notifications/services/notificationService.ts` | Import 'type  NotificationDTO' from '../types' is unused | Remove 'type  NotificationDTO' from import statement. |
| `src/features/notifications/types/index.ts` | Import 'type  EntityWithAudit' from '../../../core/services/BaseCrudService' is unused | Remove 'type  EntityWithAudit' from import statement. |
| `src/features/stuti-vinati/components/PrayerStatusBadge.tsx` | Import 'type  PublishStatus' from '../types' is unused | Remove 'type  PublishStatus' from import statement. |
| `src/features/stuti-vinati/hooks/useStutiVinati.ts` | Import 'type  StutiVinatiDTO' from '../types' is unused | Remove 'type  StutiVinatiDTO' from import statement. |
| `src/features/stuti-vinati/hooks/useStutiVinati.ts` | Import 'type  QueryFilter' from '../../../core/repositories/BaseRepository' is unused | Remove 'type  QueryFilter' from import statement. |
| `src/features/stuti-vinati/hooks/useStutiVinatiMutations.ts` | Import 'type  StutiVinatiDTO' from '../types' is unused | Remove 'type  StutiVinatiDTO' from import statement. |
| `src/features/stuti-vinati/repositories/stutiVinatiRepository.ts` | Import 'type  StutiVinatiDTO' from '../types' is unused | Remove 'type  StutiVinatiDTO' from import statement. |
| `src/features/stuti-vinati/services/stutiVinatiService.ts` | Import 'type  StutiVinatiDTO' from '../types' is unused | Remove 'type  StutiVinatiDTO' from import statement. |
| `src/features/stuti-vinati/types/index.ts` | Import 'type  EntityWithAudit' from '../../../core/services/BaseCrudService' is unused | Remove 'type  EntityWithAudit' from import statement. |
| `src/features/suvichar/hooks/useSuvichar.ts` | Import 'type  SuvicharDTO' from '../types' is unused | Remove 'type  SuvicharDTO' from import statement. |
| `src/features/suvichar/hooks/useSuvichar.ts` | Import 'type  QueryFilter' from '../../../core/repositories/BaseRepository' is unused | Remove 'type  QueryFilter' from import statement. |
| `src/features/suvichar/hooks/useSuvicharMutations.ts` | Import 'type  SuvicharDTO' from '../types' is unused | Remove 'type  SuvicharDTO' from import statement. |
| `src/features/suvichar/repositories/suvicharRepository.ts` | Import 'type  SuvicharDTO' from '../types' is unused | Remove 'type  SuvicharDTO' from import statement. |
| `src/features/suvichar/services/suvicharService.ts` | Import 'type  SuvicharDTO' from '../types' is unused | Remove 'type  SuvicharDTO' from import statement. |
| `src/features/suvichar/types/index.ts` | Import 'type  EntityWithAudit' from '../../../core/services/BaseCrudService' is unused | Remove 'type  EntityWithAudit' from import statement. |
| `src/features/users/components/UserStatusBadge.tsx` | Import 'type  UserStatus' from '../types' is unused | Remove 'type  UserStatus' from import statement. |
| `src/features/users/hooks/useUserMutations.ts` | Import 'type  UserDTO' from '../types' is unused | Remove 'type  UserDTO' from import statement. |
| `src/features/users/hooks/useUsers.ts` | Import 'type  UserDTO' from '../types' is unused | Remove 'type  UserDTO' from import statement. |
| `src/features/users/hooks/useUsers.ts` | Import 'type  QueryFilter' from '../../../core/repositories/BaseRepository' is unused | Remove 'type  QueryFilter' from import statement. |
| `src/features/users/repositories/roleRepository.ts` | Import 'type  RoleDTO' from '../types' is unused | Remove 'type  RoleDTO' from import statement. |
| `src/features/users/repositories/userRepository.ts` | Import 'type  UserDTO' from '../types' is unused | Remove 'type  UserDTO' from import statement. |
| `src/features/users/services/roleService.ts` | Import 'type  RoleDTO' from '../types' is unused | Remove 'type  RoleDTO' from import statement. |
| `src/features/users/services/userService.ts` | Import 'type  UserDTO' from '../types' is unused | Remove 'type  UserDTO' from import statement. |
| `src/features/users/types/index.ts` | Import 'type  EntityWithAudit' from '../../../core/services/BaseCrudService' is unused | Remove 'type  EntityWithAudit' from import statement. |
| `src/pages/Banners.tsx` | Import 'type  BannerDTO' from '../features/banners/types' is unused | Remove 'type  BannerDTO' from import statement. |
| `src/pages/Banners.tsx` | Import 'type  Column' from '../components/ui/DataTable' is unused | Remove 'type  Column' from import statement. |
| `src/pages/Books.tsx` | Import 'type  BookDTO' from '../features/books/types' is unused | Remove 'type  BookDTO' from import statement. |
| `src/pages/Books.tsx` | Import 'type  Column' from '../components/ui/DataTable' is unused | Remove 'type  Column' from import statement. |
| `src/pages/Categories.tsx` | Import 'type  CategoryDTO' from '../features/categories/types' is unused | Remove 'type  CategoryDTO' from import statement. |
| `src/pages/Categories.tsx` | Import 'type  Column' from '../components/ui/DataTable' is unused | Remove 'type  Column' from import statement. |
| `src/pages/Notifications.tsx` | Import 'type  NotificationDTO' from '../features/notifications/types' is unused | Remove 'type  NotificationDTO' from import statement. |
| `src/pages/Notifications.tsx` | Import 'type  Column' from '../components/ui/DataTable' is unused | Remove 'type  Column' from import statement. |
| `src/pages/StutiVinati.tsx` | Import 'type  StutiVinatiDTO' from '../features/stuti-vinati/types' is unused | Remove 'type  StutiVinatiDTO' from import statement. |
| `src/pages/StutiVinati.tsx` | Import 'type  Column' from '../components/ui/DataTable' is unused | Remove 'type  Column' from import statement. |
| `src/pages/Suvichar.tsx` | Import 'type  SuvicharDTO' from '../features/suvichar/types' is unused | Remove 'type  SuvicharDTO' from import statement. |
| `src/pages/Suvichar.tsx` | Import 'type  Column' from '../components/ui/DataTable' is unused | Remove 'type  Column' from import statement. |
| `src/pages/Users.tsx` | Import 'type  UserDTO' from '../features/users/types' is unused | Remove 'type  UserDTO' from import statement. |
| `src/pages/Users.tsx` | Import 'type  Column' from '../components/ui/DataTable' is unused | Remove 'type  Column' from import statement. |

