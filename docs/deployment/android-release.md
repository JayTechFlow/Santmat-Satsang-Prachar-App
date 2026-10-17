# Android Mobile Release Procedure

## Overview

The mobile client for Santmat Satsang Prachar is built with Flutter and targets Android (and iOS). This document outlines the authoritative release procedure, signing requirements, safety guidelines, and verification checks for production Android builds.

## Safety & Credential Integrity Rules

> [!IMPORTANT]
> - Never commit keystore files (`*.keystore`, `*.jks`) or `key.properties` to version control.
> - Never clear user application data or uninstall the production APK on connected verification devices.
> - Do not alter existing release signing configurations without explicit authorization.

## Pre-Release Quality Gates

All checks must pass before triggering a release build:

```bash
cd apps/mobile

# 1. Static code analysis (must report: No issues found!)
flutter analyze --no-pub

# 2. Automated unit and widget test suite (805+ tests must pass)
flutter test

# 3. Hardware navigation check (run against attached Android device)
cd tool/navcheck
python3 back_matrix.py
cd ../..
```

## Release Build Instructions

### 1. Version Update
Update `version` in `apps/mobile/pubspec.yaml` using Semantic Versioning:
```yaml
version: 1.0.0+X # Increment build number X for each release
```

### 2. Build Release Artifacts

#### A. Google Play App Bundle (AAB - Recommended for Store Distribution)
```bash
cd apps/mobile
flutter build appbundle --release
```
Output location: `apps/mobile/build/app/outputs/bundle/release/app-release.aab`

#### B. Standalone Release APK (For Direct Installation & Sideloading)
```bash
cd apps/mobile
flutter build apk --release
```
Output location: `apps/mobile/build/app/outputs/flutter-apk/app-release.apk`

## Safe Device Testing & Deployment

When verifying the release build on a physical Android device:

```bash
# Safe update in-place preserving user databases, Hive storage, and credentials
adb install -r apps/mobile/build/app/outputs/flutter-apk/app-release.apk
```

### Device Acceptance Checklist
- [ ] App launches without splash stutter or ANR.
- [ ] Session restore correctly remembers authenticated users.
- [ ] Audio catalogue loads all published bhajans and stutis.
- [ ] Mini player and full audio player play audio stream continuously.
- [ ] Physical Android back navigation respects root double-back policy.
- [ ] Category chips render canonical Hindi labels (`शाही भजनावली`, `पदावली भजन`, `स्वागत गीत`).

## Rollback Procedure

If an issue is detected post-rollout:
1. **Google Play Store**: Halt the staged rollout in the Google Play Console and promote the previous stable release artifact.
2. **Direct/Enterprise APK**: Re-install the previous stable release APK using `adb install -r <previous-stable-apk>`.
