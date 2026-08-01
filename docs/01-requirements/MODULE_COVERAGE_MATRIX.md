# Module Coverage Matrix

This document maps the implementation status of various modules across the Mobile, Admin Panel, and Backend systems of the Santmat-Satsang-Prachar project.

## Status Definitions
- **Complete**: Fully implemented and functional.
- **Partial**: Partially implemented (missing features or UI).
- **Missing**: Not implemented at all on the specified platform.
- **Duplicate / Deprecated**: Module exists but is either redundant or replaced by another module.
- **Coming Soon / Blocked**: Planned for future development; currently blocked or stubbed out.

## Coverage Matrix

| Module | Mobile Status | Admin Panel Status | Backend Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication (Auth)** | Complete | Complete | Complete | Handles user login, registration, and sessions. |
| **Home / Dashboard** | Complete | Complete | N/A | Landing views and dashboard statistics. |
| **Audio / Bhajans** | Complete | Complete | Complete | Audio playback and management. |
| **Notifications** | Complete | Complete | Complete | Push notifications and in-app alerts. |
| **Books / Library** | Complete | Complete | Complete | Reading materials. Mobile implements via `books` and `library`. |
| **Daily Quotes / Suvichar** | Complete | Complete | Complete | Daily inspirational quotes. |
| **Stuti-Vinati** | Complete | Complete | Complete | Integrated in Mobile under the `satsang` domain. |
| **Satsang** | Complete | Missing | Missing | Satsang schedule and details. Admin UI and dedicated Backend endpoints are missing. |
| **Events** | Complete | Missing | Complete | Calendar and upcoming events. Admin UI is missing. |
| **Donations** | Complete | Missing | Complete | Financial contributions. Admin UI is missing. |
| **Profile / Users** | Complete | Complete | Complete | User profile and administration. |
| **Search** | Complete | Partial | Complete | Search functionality across content. |
| **Settings / Preferences** | Duplicate / Deprecated | Blocked (Coming Soon) | N/A | Mobile `settings` module is deprecated and replaced by `preferences`. Admin `Settings` is a stub. |
| **Reports / Analytics** | Partial | Blocked (Coming Soon) | N/A | Admin `Reports` page is a "Coming Soon" stub. Mobile has basic `analytics`. |
| **Playlists** | Partial | Blocked (Coming Soon) | Partial | Admin `Playlist` page is a "Coming Soon" stub. |
| **Common** | Deprecated | N/A | N/A | The Mobile `common` module is an empty, unused directory. |
| **Downloads** | Complete | N/A | N/A | Offline capabilities in Mobile. Not applicable for Admin/Backend. |

## Key Findings & Recommendations

1. **Missing Admin Modules**: The Admin Panel is currently missing management interfaces for **Satsang**, **Events**, and **Donations**. The Backend is also missing specific endpoints/functions for **Satsang**.
2. **Blocked Modules**: **Reports**, **Settings**, and **Playlists** in the Admin Panel are blocked/stubbed as "Coming Soon".
3. **Redundant Code**: The Mobile app contains a deprecated `settings` feature directory which has been fully replaced by the `preferences` feature. The `common` feature in Mobile is empty and should be removed.
