# Operations & Maintenance Manual

## Monitoring, Alerts & Logging Framework

Production stability, performance metrics, and system security are continuously monitored through **Firebase Console**, **Google Cloud Monitoring (Stackdriver)**, and **Firebase Crashlytics**.

---

## Observability & Key Metrics (SLOs)

### Target Service Level Objectives (SLOs)
- **App Availability**: 99.9% uptime.
- **Audio Playback Startup Latency**: < 1.5 seconds for cached media, < 3.0 seconds for uncached HLS streams.
- **Firestore Query Response Time**: < 150 ms at p95.
- **Crash-Free User Rate**: > 99.5%.

---

## Alarm Thresholds & Emergency Operations

| Metric / Alert Name | Trigger Threshold | Escalation Action |
| :--- | :--- | :--- |
| **Crash Rate Spike** | > 1.0% of daily active sessions | On-Call Lead notified via PagerDuty / Slack channel |
| **Cloud Function Error Rate** | > 2.0% failed invocations over 5 mins | Automated Cloud Function rollback & alert |
| **Firestore Read Limit Warning** | Exceeding 80% daily quota limit | Enable query caching & scale indexing |
| **App Check Rejection Rate** | > 5% unauthenticated requests | Investigate potential API abuse / token invalidation |

---

## Disaster Recovery & Backup Protocol

### 1. Daily Firestore Automated Backups
Automated export scheduled via GCP Cloud Scheduler to a multi-region Coldline Storage Bucket (`gs://santmat-backups-prod`).

```bash
# Manual Firestore Export Command
gcloud firestore export gs://santmat-backups-prod/manual-$(date +%Y%m%d%H%M%S) \
  --project=santmat-satsang-prod
```

### 2. Firestore Disaster Recovery Procedure
To restore Firestore database from a backup point:

```bash
# Restore specific collection or full database
gcloud firestore import gs://santmat-backups-prod/2026-08-08/2026-08-08.overall_export_metadata \
  --project=santmat-satsang-prod
```

---

## Incident Response Standard Operating Procedure (SOP)

```
+-----------------------------------------------------------------+
|                       1. DETECTION & ALERT                       |
|   (PagerDuty / Alerting Policy triggers incident notification)  |
+--------------------------------:--------------------------------+
                                 v
+-----------------------------------------------------------------+
|                       2. TRIAGE & DIAGNOSIS                     |
|   - Inspect Firebase Crashlytics & Cloud Logging trace logs     |
|   - Identify impacted platform (Android / iOS / Backend API)   |
+--------------------------------:--------------------------------+
                                 v
+-----------------------------------------------------------------+
|                      3. MITIGATION / ROLLBACK                   |
|   - Revert Cloud Function or update Firebase Remote Config      |
|   - Enable Maintenance Mode via Remote Config if necessary      |
+--------------------------------:--------------------------------+
                                 v
+-----------------------------------------------------------------+
|                   4. POST-MORTEM & RESOLUTION                   |
|   - Publish Incident RCA Report within 24 hours                 |
|   - Update integration test suite to prevent regressions        |
+-----------------------------------------------------------------+
```

---

## Routine Maintenance Checklists

### Weekly Tasks
- Review Firebase Crashlytics top crash clusters and assign bug tickets.
- Check Firebase App Check metrics for unauthorized requests.
- Verify daily Firestore backup execution logs.

### Monthly Tasks
- Review Cloud Storage usage and purge temporary processing files (`/raw/tmp`).
- Audit IAM roles and Service Account permissions.
- Conduct vulnerability dependency scans (`npm audit` and `flutter pub outdated`).
