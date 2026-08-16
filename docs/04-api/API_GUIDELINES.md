# API Reference & Interfacing Guidelines

## Client-to-Backend Interfacing

The mobile application communicates with the backend infrastructure through **Firebase SDKs (Firestore, Auth, Storage)** and custom **HTTPS Cloud Functions API Endpoints**.

All HTTPS APIs enforce standard security headers, authentication via Bearer ID Tokens (`Authorization: Bearer <FirebaseIdToken>`), and App Check Verification (`X-Firebase-AppCheck`).

---

## Rest & Cloud Functions Endpoints

### 1. Media Processing & Transcoding Trigger
`POST /api/v1/media/transcode`

Initiates HLS transcoding for uploaded audio/video content.

#### Request Headers
```http
Authorization: Bearer <Firebase_ID_Token>
X-Firebase-AppCheck: <App_Check_Token>
Content-Type: application/json
```

#### Request Payload
```json
{
  "mediaId": "med_987654321",
  "storagePath": "raw/media/input_satsang_108.mp4",
  "outputFormats": ["hls_720p", "hls_1080p", "audio_aac_128k"],
  "generateThumbnails": true
}
```

#### Response (202 Accepted)
```json
{
  "status": "ACCEPTED",
  "jobId": "job_transcode_001",
  "estimatedTimeSeconds": 45,
  "timestamp": "2026-08-08T13:15:00Z"
}
```

---

### 2. User Registration & Token Refresh Sync
`POST /api/v1/users/sync-profile`

Syncs device registration, FCM token, and user metadata upon authentication.

#### Request Payload
```json
{
  "fcmToken": "fcm_token_sample_abc123",
  "deviceInfo": {
    "platform": "android",
    "osVersion": "14",
    "appVersion": "1.0.0"
  },
  "preferredLanguage": "hi"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "user": {
    "uid": "usr_12345",
    "role": "listener",
    "isSubscribedToNotifications": true
  }
}
```

---

### 3. Payment Gateway Webhook Callback
`POST /api/v1/webhooks/razorpay`

Webhook listener for payment authorization and donation status updates.

#### Request Headers
```http
X-Razorpay-Signature: <HMAC_SHA256_Signature>
Content-Type: application/json
```

#### Request Payload
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_Hk829NzkW20",
        "amount": 50000,
        "currency": "INR",
        "status": "captured",
        "notes": {
          "userId": "usr_12345",
          "donationId": "don_998877"
        }
      }
    }
  }
}
```

---

## Client Repository Interfaces (Flutter)

### `ISatsangRepository` API Specification

```dart
abstract class ISatsangRepository {
  /// Fetches a paginated list of published satsangs.
  Future<Either<Failure, List<Satsang>>> getSatsangs({
    int limit = 20,
    String? startAfterId,
    String? languageCode,
  });

  /// Streams real-time updates for a single satsang by ID.
  Stream<Either<Failure, Satsang>> watchSatsang(String satsangId);

  /// Submits user feedback or play stats for a satsang.
  Future<Either<Failure, void>> logPlaybackEvent({
    required String satsangId,
    required int positionSeconds,
    required bool completed,
  });
}
```

---

## Error Response Format

All custom HTTP Cloud Functions return standardized error envelopes:

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "User does not possess the required 'admin' claim.",
    "details": {
      "requiredRole": "admin",
      "actualRole": "listener"
    },
    "requestId": "req_8877665544"
  }
}
```
