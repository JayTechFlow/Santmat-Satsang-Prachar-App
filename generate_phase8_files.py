import os

files_to_create = {
    # FIREBASE RULES
    "firebase/firestore.rules": """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Shared functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    match /satsangs/{satsangId} {
      allow read: if isAuthenticated();
      allow write: if false; // Admin only via Cloud Functions
    }

    match /audio/{audioId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    match /books/{bookId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    match /quotes/{quoteId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    match /donations/{donationId} {
      allow read: if isOwner(resource.data.userId);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
""",
    "firebase/storage.rules": """rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /public/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if false;
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
""",
    
    # CI/CD PIPELINES
    ".github/workflows/production_pipeline.yml": """name: Production Pipeline

on:
  push:
    branches:
      - main
      - release/*
  pull_request:
    branches:
      - main

jobs:
  validate:
    name: Code Validation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
      - run: flutter pub get
        working-directory: mobile/app
      - run: dart format --output=none --set-exit-if-changed .
        working-directory: mobile/app
      - run: flutter analyze
        working-directory: mobile/app
      - run: flutter test
        working-directory: mobile/app

  build_android:
    name: Build Android
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '17'
      - uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
      - run: flutter pub get
        working-directory: mobile/app
      - run: flutter build apk --release
        working-directory: mobile/app
      - run: flutter build appbundle --release
        working-directory: mobile/app
      - uses: actions/upload-artifact@v3
        with:
          name: android-release
          path: |
            mobile/app/build/app/outputs/flutter-apk/app-release.apk
            mobile/app/build/app/outputs/bundle/release/app-release.aab

  build_ios:
    name: Build iOS (Preparation)
    needs: validate
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          channel: 'stable'
      - run: flutter pub get
        working-directory: mobile/app
      - run: flutter build ios --release --no-codesign
        working-directory: mobile/app

  build_functions:
    name: Build Cloud Functions
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
        working-directory: backend/firebase/functions
      - run: npm run build
        working-directory: backend/firebase/functions
""",

    # ANDROID SECURITY CONFIG
    "mobile/app/android/app/src/main/res/xml/network_security_config.xml": """<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">santmatsatsang.org</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="false" />
</network-security-config>
""",
    "mobile/app/android/app/proguard-rules.pro": """# Flutter wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class plugins.flutter.io.**  { *; }

# Firebase App Check
-keep class com.google.firebase.appcheck.** { *; }

# Firebase general
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
""",

    # IOS PRIVACY MANIFEST
    "mobile/app/ios/Runner/PrivacyInfo.xcprivacy": """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeEmailAddress</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <true/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
            </array>
        </dict>
    </array>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
""",

    # DOCUMENTATION
    "docs/Release_Checklist.md": """# Release Checklist v1.0
- [ ] Code frozen and validated.
- [ ] Security rules deployed (Firestore/Storage).
- [ ] App Check enforced in Firebase console.
- [ ] Android signed with production key.
- [ ] iOS signed with distribution profile.
- [ ] Privacy Policy and Terms of Service updated and accessible.
- [ ] Store assets (icons, screenshots, feature graphics) ready.
- [ ] Firebase Analytics and Crashlytics linked and actively receiving data.
- [ ] Performance monitoring verified.
- [ ] CI/CD pipeline green.
""",
    "docs/Architecture_Guide.md": """# Architecture Guide
- **Clean Architecture & Feature-First**: Modules are isolated by feature.
- **Riverpod**: State management and dependency injection.
- **Firebase Foundation**: Authentication, Firestore, Storage, Functions.
- **Offline Sync**: Custom SyncManager and CacheManager for offline readiness.
""",
    "docs/Developer_Guide.md": """# Developer Guide
- **Setup**: `flutter pub get`, `npm install`.
- **Environment**: Use `EnvironmentConfiguration` for dev/prod swapping.
- **State**: Use `NotifierProvider` and `AsyncValue`.
""",
    "docs/Deployment_Guide.md": """# Deployment Guide
- **Android**: `flutter build appbundle --release`
- **iOS**: `flutter build ipa --release`
- **Backend**: `firebase deploy --only functions,firestore:rules,storage`
""",
    "docs/Environment_Setup.md": """# Environment Setup
Requires Flutter 3.x, Node 20.x, Firebase CLI.
""",
    "docs/Firebase_Setup.md": """# Firebase Setup
Requires GoogleServices-Info.plist (iOS) and google-services.json (Android). App Check must be initialized with Play Integrity and DeviceCheck.
""",
    "docs/CI_CD_Guide.md": """# CI/CD Guide
Managed via GitHub Actions. Automates lint, test, build for PRs and main branches.
""",
    "docs/Operations_Manual.md": """# Operations Manual
Monitor Crashlytics, Firebase Console for App Check metrics, and Cloud Functions logs.
""",
    "docs/Incident_Response_Guide.md": """# Incident Response
If functions fail, rollback via Firebase console. For DB issues, restore from daily automated GCP backups.
""",
    "docs/Disaster_Recovery_Guide.md": """# Disaster Recovery
Firebase automated backups are scheduled daily. Ensure secondary admin access is configured.
"""
}

for filepath, content in files_to_create.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(content)

print("Files generated.")
