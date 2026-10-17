# Unified Firebase Hosting Deployment Guide

## Overview

Santmat Satsang Prachar utilizes a **Unified Hosting** architecture where both the Public Website (`apps/website`) and the Web Admin Dashboard (`apps/web`) are served by a single Firebase Hosting site under the canonical domain:

- **Public Business Website**: `https://santmatsatsangparchar.in` (mapped to root `/`)
- **Admin CMS Dashboard**: `https://santmatsatsangparchar.in/admin` (mapped to `/admin/*`)
- **Default Firebase Domains**: `santmat-satsang-prachar.web.app` and `santmat-satsang-prachar.firebaseapp.com` automatically redirect root traffic to `/admin/` to preserve operational access.

## Build Pipeline

The unified build is orchestrated by `scripts/build-hosting.mjs`:

```bash
npm run build:hosting
```

### Build Guarantees
1. `apps/website` builds into `dist/` with base `/`.
2. `apps/web` builds into `dist/admin/` with base `/admin/`.
3. Asset paths are isolated:
   - Website assets: `/assets/*`
   - Admin assets: `/admin/assets/*`
4. The build verifies that both `dist/index.html` and `dist/admin/index.html` exist and contain the correct asset paths.

## Pre-Deployment Verification

Before executing any deployment, run the full verification suite:

```bash
# 1. Typecheck & Lint
npm run lint

# 2. Run unit & integration test suites
npm run test

# 3. Assemble unified hosting distribution
npm run build:hosting
```

All commands must exit with code `0`.

## Deployment Procedure

Deploy the compiled distribution to Firebase Hosting:

```bash
# Deploy to the production Firebase project
firebase deploy --only hosting --project santmat-satsang-prachar
```

> **Note**: Do not include `--force` or deploy without running the pre-deployment test suite.

## Post-Deployment Smoke Verification

Immediately following deployment, verify HTTP 200 status and correct asset delivery:

```bash
# Verify public landing page
curl -s -o /dev/null -w "%{http_code}\n" https://santmatsatsangparchar.in/

# Verify admin login entry point
curl -s -o /dev/null -w "%{http_code}\n" https://santmatsatsangparchar.in/admin/login

# Verify Firebase default domain redirect
curl -s -I https://santmat-satsang-prachar.web.app/ | grep -i "location"
```

### Manual Acceptance Checklist
- [ ] Public site loads hero banner, business details, and links.
- [ ] Admin login renders properly at `/admin/login`.
- [ ] Google authentication succeeds for authorized administrators.
- [ ] Category labels display canonical `शाही भजनावली`.
- [ ] Audio, Banners, and Devotees manager screens load without console errors.

## Rollback Procedure

If a critical regression is detected post-deployment:

### Method 1: Instant Firebase Hosting Rollback (Recommended)
1. Open the [Firebase Console](https://console.firebase.google.com/project/santmat-satsang-prachar/hosting/sites).
2. Navigate to **Hosting** > **Release History**.
3. Locate the previous known-healthy deployment version.
4. Click the three dots (`...`) and select **Rollback**. The change takes effect globally within seconds.

### Method 2: Git Rollback Re-deploy
1. Identify the previous release commit or git tag.
2. Check out the clean release commit.
3. Re-run `npm run build:hosting`.
4. Re-deploy with `firebase deploy --only hosting`.
