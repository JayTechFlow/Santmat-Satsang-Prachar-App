# Shared Component Catalog

This document outlines the conceptually duplicated components, tokens, services, and architectural patterns shared between the **Admin Panel** (React/TypeScript) and the **Mobile App** (Flutter/Dart). Identifying these overlaps allows for easier alignment of business logic, unified design systems, and smoother cross-platform maintenance.

## 1. Design Tokens
The foundational design tokens are mirrored almost file-for-file across both codebases, ensuring visual consistency.

| Token Type | Admin Panel (`admin-panel/src/design/`) | Mobile App (`mobile/app/lib/shared/theme/`) |
| --- | --- | --- |
| Colors | `colors.ts` | `app_colors.dart` |
| Typography | `typography.ts` | `app_typography.dart` |
| Spacing | `spacing.ts` | `app_spacing.dart` |
| Radius / Border | `radius.ts` | `app_radius.dart` |
| Shadows | `shadows.ts` | `app_shadows.dart` |

## 2. UI Components & Widgets
While implemented in different UI frameworks (React vs. Flutter), these structural UI components share the exact same role and frequently the same component state logic.

| Component Concept | Admin Panel (`admin-panel/src/components/ui/`) | Mobile App (`mobile/app/lib/shared/widgets/`) | Description |
| --- | --- | --- | --- |
| Confirmation Dialog | `ConfirmDialog.tsx` | `confirmation_dialog.dart` | Dialog for destructive or critical user actions. |
| Empty State | `EmptyState.tsx` | `empty_state.dart`, `ssp_empty_state.dart` | Displayed when lists or data queries return no results. |
| Error State | `ErrorState.tsx` | `error_state.dart`, `ssp_error_state.dart` | Reusable widget to present API or local errors. |
| Loading Indicator | `LoadingOverlay.tsx` | `loading_indicator.dart`, `ssp_loading.dart` | Standardized loading spinners/overlays. |
| Search Bar | `SearchBar.tsx` | `ssp_search_bar.dart` | Input field tailored for querying data. |
| Cards / Containers | N/A (Standard CSS) | `ssp_card.dart`, `ssp_glass_card.dart` | Base container styles for displaying discrete items. |

## 3. Core Utilities & Architecture
Both platforms follow a similar Clean Architecture approach, utilizing base repositories and robust error mapping.

| Core Utility Concept | Admin Panel (`admin-panel/src/core/`) | Mobile App (`mobile/app/lib/core/`) |
| --- | --- | --- |
| Error Mapping | `errors/errorMapper.ts` | `error/error_mapper.dart` |
| App Exceptions | `errors/AppError.ts` | `error/app_exception.dart` |
| Storage Services | `storage/StorageService.ts` | `storage/storage_service.dart` |
| Base Data Fetching | `repositories/BaseRepository.ts` | `network/` & `services/` |

## 4. Domain Features & Repositories
Data domains (interacting directly with Firebase/Firestore) are perfectly duplicated. Any schema change to one of these domains must be synchronized on the other platform.

| Domain | Admin Panel Feature | Mobile App Feature | Matching Repositories/Services |
| --- | --- | --- | --- |
| Books / Library | `features/books` | `features/books` | Book Repositories / Data Sources |
| Quotes (Suvichar) | `features/suvichar` | `features/daily_quotes` | Suvichar / Daily Quote Repositories |
| Notifications | `features/notifications`| `features/notifications` | Notification Repositories |
| Users / Profile | `features/users` | `features/profile` | User & Role Repositories |
| Audio (Bhajans) | `features/bhajans` | `features/audio` & `satsang` | Bhajan / Audio Track Data Sources |
| Stuti Vinati | `features/stuti-vinati` | `features/satsang` | Stuti / Vinati Repositories |
| Banners | `features/banners` | `features/banners` (Implicit) | App Banners for Home Screen |

## 5. State Management & Hooks
State providers mirror each other's responsibilities:
- **React Hooks** (Admin Panel): `useBooks`, `useSuvichar`, `useNotifications`, `useUsers`, etc.
- **Flutter Providers** (Mobile App): `books_providers.dart`, `daily_quotes_providers.dart`, `notifications_providers.dart`, `profile_providers.dart`.

## Recommendations for Maintenance
1. **Schema Synchronization**: Always update the Dart Models (`_dto.dart`) and TypeScript interfaces (`types/index.ts`) in tandem when modifying Firestore collections.
2. **Design Token Updates**: If updating the core brand colors or typography, update both the TypeScript and Dart theme files simultaneously.
3. **Error Code Parity**: Maintain parity in `errorMapper.ts` and `error_mapper.dart` to ensure consistent error messaging across user platforms.
