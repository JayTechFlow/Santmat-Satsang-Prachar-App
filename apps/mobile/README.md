# Santmat Satsang Prachar Mobile (`apps/mobile`)

Cross-platform Flutter mobile client for Santmat Satsang Prachar (Android & iOS).

---

## Architectural Stack

- **Framework**: Flutter 3.x
- **Architecture**: Clean Architecture with Feature-First packaging
- **State Management**: Riverpod (`NotifierProvider` / `AsyncNotifierProvider`)
- **Routing**: `GoRouter` with auth-guard redirection and deep link handling
- **Local Persistence**: `Hive` (offline caching of preferences, media metadata, playback states)
- **Networking**: `Dio` with retry interceptors and auth token refreshes
- **Backend Integration**: Firebase Authentication, Cloud Firestore, Cloud Storage, Firebase Cloud Messaging

---

## Essential Commands

```bash
# Static analysis (must report: No issues found!)
flutter analyze --no-pub

# Run all automated tests
flutter test

# Hardware back-navigation verification (physical Android device)
cd tool/navcheck && python3 back_matrix.py

# Production release builds
flutter build apk --release
flutter build appbundle --release
```

---

## Key Directories

```text
apps/mobile/
├── lib/
│   ├── bootstrap/      # App initialization and Firebase bootstrapping
│   ├── core/           # Shared domain value objects, utils, and auth guards
│   ├── features/       # Feature modules (audio, stuti, books, search, profile, auth)
│   └── shared/         # Design system tokens, canonical widgets, and theme
├── test/               # Unit, widget, and integration test suites
└── tool/
    └── navcheck/       # Physical Android back navigation automated verification matrix
```
