# Requirement Master Matrix

**Project Name**: Santmat Satsang Prachar
**Version**: 1.0

This document defines the extracted requirements, business rules, workflows, validations, and permissions derived from the Client Requirement Document (CRD).

## 1. Mobile Application Requirements

| Req ID | Module | Requirement Description | Business Rules & Validations | Workflow & Action | Permissions |
|--------|--------|-------------------------|------------------------------|-------------------|-------------|
| **MOB-GLB-01** | Global | Audio Streaming Only | The app must exclusively stream audio. No offline playback or downloading is permitted. | Audio data is fetched and buffered directly from Firebase Storage. | User |
| **MOB-GLB-02** | Global | Background Play | Audio must continue playing even when the app is minimized or the screen is locked. | Operating system background audio services must be utilized. | User |
| **MOB-GLB-03** | Global | Senior Citizen Friendly | UI must be modern, minimal, lightweight, with soft shadows and rounded corners. | Easy navigation and legible font sizes. | User |
| **MOB-NAV-01** | Navigation | Bottom Navigation Bar | Fixed bottom navigation containing: Home, Audio, स्तुति-विनती, Notifications, Profile. | Tapping an icon switches the main view fragment/screen. | User |
| **MOB-HOM-01** | Home | Home Screen Layout | Must include App Logo, Name, Search Bar, Notification Icon, Banner with Share, "आज का सुविचार", Audio/Stuti Cards, Quotes, and Latest Bhajans. | Tapping specific widgets (e.g., Latest Bhajan) opens the Audio Player. | User |
| **MOB-AUD-01** | Audio | Scrollable Audio List | Display all Bhajans with Thumbnail, Title, Duration, and a Play button. Must include a Search icon. | Tapping any list item navigates directly to the Audio Player Screen. | User |
| **MOB-PLY-01** | Player | Audio Player UI & Controls | Must have Large Thumbnail, Title, Singer, Play/Pause, Prev, Next, Progress Bar, Shuffle, Repeat, Favorite, Share. | **Auto Play Next** is mandatory. Up Next and Related Bhajans shown below the player. | User |
| **MOB-STU-01** | Stuti | स्तुति-विनती (Morning/Evening) | Two dedicated cards (☀️ प्रातःकालीन, 🌙 संध्याकालीन). Must include Audio Wave Animation, Favorite, Share. | Clicking Play starts the audio immediately without navigating to a separate list. | User |
| **MOB-NOT-01** | Notification | Notifications View | Must support Categories (सभी, Updates, विशेष). Latest notifications displayed on top. | Must show an Unread Notification Dot. Integrated via Firebase. | User |
| **MOB-SRC-01** | Search | Global Search | Ability to search by Bhajan Title, Singer Name, and Keywords. Must display Recent and Popular searches. | Tapping a search result opens the content directly. | User |
| **MOB-PRF-01** | Profile | Profile Settings & Info | Display Profile Photo, Name, Mobile, Email. Options: Personal Info, Favorites, History, Notification Settings, Language, About, Logout. | Note: Authentication workflows are currently missing from the CRD. | User |

## 2. Admin Panel Requirements

| Req ID | Module | Requirement Description | Business Rules & Validations | Workflow & Action | Permissions |
|--------|--------|-------------------------|------------------------------|-------------------|-------------|
| **ADM-AUD-01** | Media | Upload Audio & Metadata | Must upload Audio File and Thumbnail. Must enter Audio Title. | Save files to Firebase Storage, save metadata to Database. | Admin |
| **ADM-AUD-02** | Media | Manage Audio Records | Admin must be able to Edit or Delete existing audio records. | Updating metadata or deleting files from Firebase Storage. | Admin |
| **ADM-CNT-01** | Content | Today's Thought Management | Admin must be able to upload "Today's Thought" (आज का सुविचार) Image. | Once uploaded, the Home Screen on the mobile app updates dynamically. | Admin |
| **ADM-NOT-01** | Notification | Broadcast Notifications | Admin must be able to compose and send push notifications to app users. | Triggered via Firebase Cloud Messaging (FCM). | Admin |

## 3. Pending Clarifications / Missing Workflows (Out of Scope for now)
- **Authentication**: Sign Up / Login workflow (OTP/Password) is unspecified.
- **Database Schema**: Document structure for Users, Bhajans, Favorites, and History is undefined.
- **Roles**: No details on role-based access beyond a generic "Admin".
- **Pagination**: Loading strategy for long lists of audio (Infinite scroll vs Pagination).
