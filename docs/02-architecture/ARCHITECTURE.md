# Architecture Documentation

## System Overview

Santmat Satsang Prachar is a cross-platform mobile and web ecosystem designed for distributing spiritual satsang audio, videos, books, events, and community updates. The application architecture follows **Clean Architecture** and a **Feature-First** structure in Flutter, backed by a production-ready **Firebase Serverless Backend**, Cloud Functions, Cloud Storage, dynamic CDN caching, and custom Media Processing pipelines.

```
+-----------------------------------------------------------------------+
|                           FLUTTER CLIENT                              |
|  +-------------------+  +-------------------+  +-------------------+  |
|  | Presentation Layer|  |   Domain Layer    |  |    Data Layer     |  |
|  | (UI & Riverpod)   |->| (Use Cases/Models)|->| (Repos & Sources) |  |
|  +-------------------+  +-------------------+  +-------------------+  |
+-----------------------------------:-----------------------------------+
                                    | HTTPS / GRPC (App Check Verified)
                                    v
+-----------------------------------------------------------------------+
|                          FIREBASE PLATFORM                            |
|  +-------------------+  +-------------------+  +-------------------+  |
|  | Firebase Auth     |  | Cloud Firestore   |  | Cloud Storage     |  |
|  | (Phone, Google)   |  | (NoSQL Database)  |  | (HLS, PDF, Audio) |  |
|  +-------------------+  +-------------------+  +-------------------+  |
+-----------------------------------:-----------------------------------+
                                    | Cloud Triggers & HTTPS
                                    v
+-----------------------------------------------------------------------+
|                         BACKEND SERVICES                              |
|  +-------------------+  +-------------------+  +-------------------+  |
|  | Cloud Functions   |  | Media Processing  |  | CDN & Cache Layer |  |
|  | (Node.js/TS)      |  | (FFmpeg / HLS)    |  | (Firebase Hosting)|  |
|  +-------------------+  +-------------------+  +-------------------+  |
+-----------------------------------------------------------------------+
```

---

## Technical Stack & Architectural Layers

### Mobile App Architecture (Flutter)
- **State Management**: [Riverpod 2.x / 3.x](file:///Users/jaymac/Documents/Santmat-Satsang-Prachar/mobile/app/lib) with `NotifierProvider` and `AsyncNotifierProvider`.
- **Routing**: `GoRouter` with auth-guard redirection and deep link parsing.
- **Local Persistence**: `Hive` for offline-first caching of user preferences, media metadata, and playback positions.
- **Networking**: `Dio` with custom retry interceptors and auth token refreshes.
- **Layers**:
  - `presentation/`: UI Screens, Widgets, Riverpod Controllers.
  - `domain/`: Entities, Value Objects, Repository Interfaces, Use Cases.
  - `data/`: DTOs, Repository Implementations, Remote Data Sources (Firestore/Firebase Storage), Local Data Sources (Hive).

### Backend & Cloud Architecture
- **Authentication**: Firebase Authentication with Multi-Factor Authentication (MFA), Phone OTP, and Google Sign-In.
- **Database**: Cloud Firestore with multi-region replication, indexes, and strict Security Rules.
- **Storage**: Firebase Storage bucket partitioned into `/raw`, `/processed`, `/public`, and `/user_uploads`.
- **Serverless Compute**: Cloud Functions v2 (TypeScript) handling triggers for user creation, media encoding, analytics aggregation, and push notifications via FCM.

---

## Sequence Diagrams

### 1. User Authentication & App Check Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FlutterApp as Flutter Client
    participant AppCheck as Firebase App Check
    participant FirebaseAuth as Firebase Auth
    participant Firestore as Cloud Firestore

    User->>FlutterApp: Initiate Sign-In (Phone / Google)
    FlutterApp->>AppCheck: Request Attestation Token (Play Integrity / DeviceCheck)
    AppCheck-->>FlutterApp: Return App Check Token
    FlutterApp->>FirebaseAuth: Authenticate Credentials + App Check Token
    FirebaseAuth-->>FlutterApp: Return IdToken & RefreshToken
    FlutterApp->>Firestore: Fetch User Profile (`users/{uid}`) with App Check Token
    Firestore-->>FlutterApp: User Profile Data & Role Capabilities
```

### 2. Media Upload & Processing Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AdminApp as Admin Panel / App
    participant Storage as Cloud Storage (/raw)
    participant CloudFn as Media Processor Cloud Function
    participant FFmpeg as Transcoder Service
    participant HLSStorage as Cloud Storage (/processed)
    participant Firestore as Cloud Firestore

    Admin->>AdminApp: Select & Upload Audio/Video
    AdminApp->>Storage: Upload to `/raw/media/{mediaId}.mp4`
    Storage-->>CloudFn: Trigger `onObjectFinalized`
    CloudFn->>FFmpeg: Pass Input Media URL for Transcoding
    FFmpeg-->>FFmpeg: Generate HLS Stream (.m3u8, .ts segments) & Thumbnails
    FFmpeg->>HLSStorage: Save HLS Segments to `/processed/hls/{mediaId}/`
    CloudFn->>Firestore: Update `media/{mediaId}` status='READY', hlsUrl=..., duration=...
    Firestore-->>AdminApp: Realtime Stream Listener receives 'READY' state
```

---

## Security Architecture

- **App Check**: Enforced across Firestore, Storage, and Cloud Functions to restrict access strictly to genuine app instances.
- **Role-Based Access Control (RBAC)**: Custom Claims attached to Firebase Auth ID tokens (`admin`, `editor`, `listener`).
- **Data Encryption**:
  - In Transit: TLS 1.3 enforced across all endpoints.
  - At Rest: AES-256 transparent encryption on Firestore and Cloud Storage.

---

## Extensibility & Reliability Standards

1. **Idempotency**: All Cloud Functions operating on Firestore triggers implement idempotent writes via document versioning and transaction logs.
2. **Offline-First Synchronization**: Client write operations queue locally in Hive storage and reconcile with Firestore upon network restoration.
3. **Observability**: Integrated Firebase Crashlytics, Cloud Logging, and OpenTelemetry instrumentation.
