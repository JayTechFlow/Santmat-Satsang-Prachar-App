# Quality Status Report: Runtime Risks, Tech Debt, and Mock Data

## 1. Heavy Reliance on Mock Data
An investigation into the codebase reveals extensive use of mock data sources across multiple features. This poses a significant tech debt, as these implementations will need to be replaced with actual backend integrations (e.g., Firebase) prior to a production launch.

* **Mock Data Sources Identified**: 
  - `MockAudioDataSource`
  - `MockBookDataSource`
  - `MockDonationDataSource`
  - `MockDownloadDataSource`
  - `MockEventDataSource`
  - `MockLibraryDataSource`
  - `MockNotificationDataSource`
* **Provider Injection**: Many Riverpod providers directly inject the mock sources (e.g., `books_providers.dart` injects `MockBookDataSource()`).
* **Fallback Mechanisms**: Even where Firebase is partially implemented, there are hardcoded fallbacks to mock data. For instance, `firebase_home_data_source.dart` falls back to `MockHomeDataSource()` temporarily "while the CMS is being built".

## 2. Missing Android Production Configuration
The Android app is currently missing a proper production release configuration. 
* **Evidence**: In `mobile/app/android/app/build.gradle.kts`, the `release` build type is explicitly configured to use the `debug` signing key.
  ```kotlin
  buildTypes {
      release {
          // TODO: Add your own signing config for the release build.
          // Signing with the debug keys for now, so `flutter run --release` works.
          signingConfig = signingConfigs.getByName("debug")
      }
  }
  ```
* **Risk**: The application cannot be published to the Google Play Store until a valid release keystore is generated, securely stored, and properly referenced in the `release` configuration block.

## 3. Empty Callbacks in Audio Player
The audio player functionality is largely superficial, lacking integration with an actual audio engine (packages like `just_audio` or `audioplayers` are missing from `pubspec.yaml`).
* **Evidence**: The player user interface in `mobile/app/lib/features/audio/presentation/pages/audio_details_page.dart` contains several empty callbacks `() {}`:
  - `onChanged: (val) {}` // TODO: Seek
  - `onPressed: () {}` // TODO: Previous
  - `onPressed: () {}` // TODO: Next
  - `onTap: () {}` // Switch track (in the Up Next list)
  - `onPlayPause: () {}` (in the Up Next list)
* **Risk**: Tapping these controls currently does nothing, leading to a broken user experience. The state notifier (`PlaybackNotifier` in `audio_providers.dart`) updates UI state variables (like `playing` vs `paused`) without invoking any actual media playback.
