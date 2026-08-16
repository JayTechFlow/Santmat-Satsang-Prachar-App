# Deployment & CI/CD Guide

## Overview

This guide outlines the production deployment workflow, environment provisioning, and automated CI/CD pipeline configuration for **Santmat Satsang Prachar**.

---

## Deployment Architecture

```
+-------------------------------------------------------------------+
|                        GITHUB REPOSITORY                          |
|                     (Branch: `main` / `release/*`)                |
+---------------------------------:---------------------------------+
                                  | Push / Pull Request
                                  v
+-------------------------------------------------------------------+
|                     GITHUB ACTIONS CI/CD                          |
|  +--------------------+  +--------------------+  +--------------+  |
|  | 1. Lint & Test     |->| 2. Flutter Build   |->| 3. Firebase  |  |
|  | (Dart, TS, Audit)  |  | (APK, AAB, Web)    |  |    Deploy    |  |
|  +--------------------+  +--------------------+  +--------------+  |
+--------------------------------------------------:----------------+
                                                   |
                   +-------------------------------+-------------------------------+
                   |                                                               |
                   v                                                               v
+--------------------------------------+                       +--------------------------------------+
|          GOOGLE PLAY STORE           |                       |           FIREBASE HOSTING           |
|  (Internal Testing / Production Track|                       |     (Cloud Functions & Firestore)    |
+--------------------------------------+                       +--------------------------------------+
```

---

## Production Prerequisites & Provisioning

1. **Google Cloud Platform Project**: Firebase project initialized (`santmat-satsang-prod`).
2. **App Check Setup**: Register SHA-256 fingerprints for Android Play Integrity and App Store bundle IDs for DeviceCheck.
3. **Service Accounts**:
   - `firebase-deployer`: IAM roles `Firebase Admin`, `Cloud Functions Admin`, `API Keys Admin`.
   - `play-store-publisher`: Service Account key with Play Developer API publish scope.

---

## Environment Configuration

Secrets must be declared in GitHub Repository Secrets:

| Secret Name | Description |
| :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT_PROD` | Base64-encoded Service Account JSON key |
| `PLAY_STORE_JSON_KEY` | Base64-encoded Google Play Developer API key |
| `ANDROID_KEYSTORE_BASE64` | Encrypted release Keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | Password for Android Keystore |
| `ANDROID_KEY_ALIAS` | Release Key Alias name |
| `ANDROID_KEY_PASSWORD` | Password for Key Alias |

---

## Step-by-Step Manual Deployment Guide

### 1. Firebase Rules & Cloud Functions Deployment

```bash
# Navigate to project root
cd /path/to/Santmat-Satsang-Prachar

# Authenticate Firebase CLI
firebase login

# Target production environment
firebase use production

# Deploy Firestore Security Rules & Indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Cloud Storage Security Rules
firebase deploy --only storage

# Deploy Node.js Cloud Functions
cd backend/functions
npm install
npm run build
firebase deploy --only functions
```

### 2. Mobile App Build & Release Pipeline (Android)

```bash
cd mobile/app

# Clean workspace and fetch packages
flutter clean
flutter pub get

# Run static analysis and unit tests
flutter analyze
flutter test

# Build production Android App Bundle (AAB) with Obfuscation
flutter build appbundle --release \
  --obfuscate \
  --split-debug-info=build/app/outputs/symbols
```

---

## Automated GitHub Actions Pipeline (`.github/workflows/deploy.yml`)

```yaml
name: Production Deployment Pipeline

on:
  push:
    branches:
      - main

jobs:
  test_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Deploy Firebase Infrastructure
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_PROD }}'
          channelId: live
          projectId: santmat-satsang-prod

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.x'
          channel: 'stable'

      - name: Install Dependencies
        run: |
          cd mobile/app
          flutter pub get

      - name: Run Flutter Tests
        run: |
          cd mobile/app
          flutter test

      - name: Build Release Bundle
        run: |
          cd mobile/app
          flutter build appbundle --release
```
