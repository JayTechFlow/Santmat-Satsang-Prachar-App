# Architecture Compliance Report

## Overview
This report verifies the structural compliance of both the React (`admin-panel`) and Flutter (`mobile/app`) codebases against the specified architectural flow:
`Presentation -> Hooks/Providers -> Service/UseCases -> Repository -> Firebase`

It also details any violations, dependency problems, and checks for circular imports.

---

## 1. React Admin Panel
The React app strictly attempts to follow the `Components -> Hooks -> Services -> Repositories -> Firebase` architecture. 

### ✅ Compliant Areas
- **Repositories** are properly isolated and interact with Firebase for most data queries.
- **Hooks** consistently invoke Services (e.g., `useBanners.ts` uses `bannerService.ts`).
- **Services** consistently invoke Repositories (e.g., `bannerService.ts` uses `bannerRepository.ts`).
- No direct component-to-repository or component-to-firebase imports were detected.

### ❌ Violations
1. **Components calling Services directly (Bypassing Hooks):**
   - `src/features/banners/components/BannerStatusBadge.tsx` directly imports and uses `bannerService.ts`.
2. **Hooks importing Firebase directly (Leaking infrastructure into Hooks):**
   - Almost all feature hooks (`useBanners.ts`, `useBhajans.ts`, `useBooks.ts`, `useCategories.ts`, `useNotifications.ts`, `useStutiVinati.ts`, `useSuvichar.ts`, `useUsers.ts`) directly import `QueryConstraint`, `orderBy`, and `where` from `firebase/firestore`. These database concepts should be abstracted away by the Service and Repository layers.
3. **Services importing Firebase directly (Bypassing Repository):**
   - **Auth leak:** All services directly import `auth` from `firebase/config` to get the current user, rather than having the Repository or a dedicated Auth module handle session data.
   - **Data query leak:** `src/features/categories/services/categoryService.ts` executes queries directly via `collection`, `query`, `where`, and `getCountFromServer`, effectively bypassing `categoryRepository.ts` for some operations.

---

## 2. Flutter Mobile App
The Flutter application follows a standard Clean Architecture (`Presentation -> Domain -> Data`), which maps conceptually to `Widgets -> Providers -> UseCases -> Repositories -> Firebase`. 

### ✅ Compliant Areas
- **Widgets** properly rely on Providers for state.
- **Providers** properly invoke UseCases to perform actions or fetch data.
- **UseCases** correctly depend on Repository interfaces in the Domain layer.
- No widgets directly import UseCases, Repositories, or Firebase components.

### ❌ Violations
1. **Presentation (Providers) instantiating Data implementations directly (Bypassing Domain isolation):**
   - Feature providers (e.g., `audio_providers.dart`, `home_providers.dart`) directly import data sources (e.g., `firestore_audio_data_source.dart`) and repository implementations (`audio_repository_impl.dart`) to construct the DI tree. While this is common in Riverpod, it mixes the Data implementation and Presentation layers in a single file instead of keeping DI fully external.
2. **Providers importing Firebase directly:**
   - `lib/features/authentication/presentation/providers/auth_providers.dart` and `lib/features/profile/presentation/providers/profile_providers.dart` directly import `package:firebase_auth/firebase_auth.dart` to instantiate the DI providers, tying the Presentation layer directly to the Firebase framework.

---

## 3. Dependency Problems & Circular Imports
We performed a deep dependency trace on both the `mobile` (Dart) and `admin-panel` (TypeScript) codebases.
- **Circular Imports:** **0 detected.** Both codebases have a clean hierarchical dependency graph.
- **Dependency Inversion Problems:** As noted in the Violations above, the dependencies point "inwards" cleanly except where Firebase abstractions leak outwards into Services (React), Hooks (React), and Providers (Flutter).
