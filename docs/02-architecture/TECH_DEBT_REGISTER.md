# Technical Debt Register

This document tracks technical debt, TODOs, FIXMEs, known issues, hardcoded values, and mock data across the Santmat-Satsang-Prachar codebase. This is a living document and should be updated as debt is addressed or new debt is incurred.

## 1. Mock Data & Temporary Code

The application currently relies heavily on mock data sources in the Flutter mobile app, primarily because the backend CMS is still under construction or not fully integrated. 

| Location | Description | Type |
|----------|-------------|------|
| `mobile/app/lib/features/downloads/data/datasources/mock_download_data_source.dart` | Mock implementation for the Download feature. | Mock Data |
| `mobile/app/lib/features/donations/data/datasources/mock_donation_data_source.dart` | Mock implementation for Donations. Notes "Mock automatic success for demo purposes". | Mock Data / Hardcoded |
| `mobile/app/lib/features/satsang/data/datasources/firestore_satsang_data_source.dart` | Uses a hardcoded static list instead of querying a categories collection. | Hardcoded |
| `mobile/app/lib/features/satsang/data/datasources/mock_satsang_data_source.dart` | Mock implementation for Satsang data. | Mock Data |
| `mobile/app/lib/features/search/presentation/providers/search_providers.dart` | Injects `MockSearchDataSource()` instead of a real Firestore provider. | Temporary Code |
| `mobile/app/lib/features/profile/data/datasources/mock_profile_data_source.dart` | Mock local changes and mock profile memory state. | Mock Data |
| `mobile/app/lib/features/search/data/datasources/mock_search_data_source.dart` | Contains static list of `_mockData` for search results. | Mock Data |
| `mobile/app/lib/features/events/presentation/providers/events_providers.dart` | Injects `MockEventDataSource()`. | Temporary Code |
| `mobile/app/lib/features/search/data/datasources/firestore_search_data_source.dart` | Hardcoded `_userId = 'mock_user_id'`. | Hardcoded |
| `mobile/app/lib/features/home/data/datasources/firebase_home_data_source.dart` | Fallback to `MockHomeDataSource()` temporarily while the CMS is being built. | Temporary Code / Mock |
| `mobile/app/lib/features/daily_quotes/data/datasources/mock_daily_quote_data_source.dart` | Mock implementation for daily quotes. | Mock Data |
| `mobile/app/lib/features/profile/presentation/providers/profile_providers.dart` | Injects `MockProfileDataSource()`. | Temporary Code |
| `mobile/app/lib/features/events/data/datasources/mock_event_data_source.dart` | Mock implementation for events. | Mock Data |
| `mobile/app/lib/features/audio/data/datasources/firestore_audio_data_source.dart` | Hardcoded categories fetch instead of using a Firestore collection. | Hardcoded |
| `mobile/app/lib/features/audio/data/datasources/mock_audio_data_source.dart` | Mock audio data source with favorites/history stored in memory. | Mock Data |
| `admin-panel/stress_test.py` | Injecting mock records and mocking 50MB audio file uploads for testing. | Test Code / Mock |

## 2. TODOs and FIXMEs

| Location | Description |
|----------|-------------|
| `mobile/app/lib/features/profile/presentation/pages/profile_page.dart` | `// TODO in next module: Handle language change correctly` |
| `mobile/app/lib/features/audio/presentation/pages/audio_details_page.dart` | Missing implementation for audio controls: `// TODO: Favorite toggle`, `// TODO: Seek`, `// TODO: Previous`, `// TODO: Next` |
| `mobile/app/android/app/build.gradle.kts` | Setup required: `// TODO: Specify your own unique Application ID`, `// TODO: Add your own signing config for the release build.` |

## 3. Legacy and Deprecated Code

| Location | Description | Type |
|----------|-------------|------|
| `admin-panel/migration_audit.py` | Explicitly lists legacy modules: `['Books', 'StutiVinati', 'Suvichar', 'Banners', 'Categories', 'Notifications']` | Legacy Code |

## Summary & Recommendations
1. **CMS Integration:** The highest priority tech debt is transitioning from the numerous `Mock*DataSource` classes (Home, Audio, Satsang, Events, Daily Quotes, Donations, Downloads, Profile, Search) to the `Firestore*DataSource` implementations once the CMS is complete.
2. **Hardcoded User Info:** Ensure `mock_user_id` is replaced with the authenticated user ID from Firebase Auth.
3. **Incomplete Features:** The Audio Player needs its controls implemented (Seek, Previous, Next, Favorite), and language switching needs to be completed in the Profile module.
4. **App Build Configs:** Android `build.gradle.kts` requires updates to Application ID and signing configurations before release.
