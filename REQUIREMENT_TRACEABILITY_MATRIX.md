# Requirement Traceability Matrix

## 1. Client Requirement Inventory
The following features are strictly extracted from the `pravian.pdf` Client UI Description (Version 1.0):
- Home Screen (Banner, Suvichar, Audio, Stuti-Vinati, Quote, Bhajan List)
- Audio Screen (List of Bhajans)
- Audio Player (Playback, Previous, Next, Shuffle, Repeat, Favorite, Share, Background Play)
- Stuti-Vinati Screen (Morning/Evening text prayers, instant play)
- Notifications (Push updates, Categories)
- Search (Title, Singer, Keywords)
- Profile (User Details, Listening History, Favorites, Settings)
- Admin Panel (Manage Audio, Suvichar, Notifications)

## 2. Requirement IDs
- **REQ-001**: Home Screen & Navigation
- **REQ-002**: Audio & Bhajan Listing
- **REQ-003**: Audio Player & Background Play
- **REQ-004**: Stuti-Vinati (Text & Audio)
- **REQ-005**: Notifications
- **REQ-006**: Global Search
- **REQ-007**: User Profile & History
- **REQ-008**: Admin Content Management (Audio, Suvichar, Notifications)
- **REQ-009**: Security & Restrictions (No Downloads allowed)

## 3. Client PDF Page Reference
- REQ-001: Page 1
- REQ-002: Page 2
- REQ-003: Page 2
- REQ-004: Page 3
- REQ-005: Pages 3-4
- REQ-006: Page 4
- REQ-007: Pages 4-5
- REQ-008: Page 6
- REQ-009: Page 6

## 4. Requirement Description
*   **REQ-001 (Home)**: Primary landing screen containing global search, daily quote, latest bhajans, and banners.
*   **REQ-002 (Audio)**: Scrollable list of audio tracks displaying duration, title, and mini-player.
*   **REQ-003 (Player)**: Full playback controls, background audio support, and queueing (Up Next).
*   **REQ-004 (Stuti)**: Dedicated section for Morning and Evening prayers with wave animation and auto-play.
*   **REQ-005 (Notifications)**: Tabbed notification center (All, Updates, Special) with unread dot.
*   **REQ-006 (Search)**: Search content by keyword, title, singer with recent/popular terms.
*   **REQ-007 (Profile)**: User account page managing favorites, history, and app settings.
*   **REQ-008 (Admin)**: Upload/Edit/Delete audio and thumbnails, upload daily thought image, send push notifications.
*   **REQ-009 (Restrictions)**: Audio streaming ONLY. Downloading to device is strictly prohibited.

## 5. Business Rule
- "Audio Streaming Only"
- "No Download Option"
- "Future Ready Architecture"
- "Follow UI Design provided by the client"

## 6. React Mapping
- REQ-008: `Bhajans.tsx`, `Suvichar.tsx`, `Notifications.tsx`, `Banners.tsx`
- Implementation Support Modules: `Dashboard.tsx`, `Users.tsx`, `Categories.tsx`

## 7. Flutter Mapping
- REQ-001: `home` module
- REQ-002 & REQ-003: `audio` module (`audio_details_page.dart` empty callbacks detected)
- REQ-004: `stuti_vinati` module
- REQ-005: `notifications` module
- REQ-006: `search` module
- REQ-007: `profile` & `authentication` modules

## 8. Firebase Mapping
- `audio` (Firestore & Storage)
- `suvichar` (Firestore & Storage)
- `stuti_vinati` (Firestore)
- `banners` (Firestore & Storage)
- `users` (Firestore)

## 9. Admin Mapping
- Admins can upload Audio (Title, File, Thumbnail).
- Admins can edit/delete Audio.
- Admins can update "Today's Thought" (Suvichar).
- Admins can broadcast Notifications.

## 10. Workflow Mapping
Admin (React UI) -> Uploads Audio/Suvichar to Firebase Storage -> Saves metadata to Firestore -> Triggers Cloud Function (if needed) -> Flutter App fetches real-time updates -> User plays audio (Background Service active).

## 11. Evidence
- Admin Panel files (`Bhajans.tsx`, `Suvichar.tsx`) exist and are integrated with `BaseCrudService`.
- Flutter Audio background service is configured in `AndroidManifest.xml`.
- Flutter `audio_details_page.dart` contains un-wired TODOs for Seek, Next, Previous, Favorite.
- Flutter `mobile/app/lib/features/downloads` module exists in the codebase.

## 12. Completion Status
- **REQ-001 (Home)**: Completed
- **REQ-002 (Audio)**: Completed
- **REQ-003 (Player)**: Partially Implemented (UI exists, callbacks empty)
- **REQ-004 (Stuti)**: Completed
- **REQ-005 (Notifications)**: Completed
- **REQ-006 (Search)**: Completed
- **REQ-007 (Profile)**: Completed
- **REQ-008 (Admin)**: Completed
- **REQ-009 (Restrictions)**: Missing / Violated (Downloads module built)

## 13. Completion Percentage
88% (8 out of 9 core requirements fulfilled or partially fulfilled).

## 14. Gap Analysis
The core system aligns closely with the PDF layout and intent. However, a severe violation exists regarding the strict "No Download" rule. Additionally, while the audio player UI is present, its internal logic (seek, next, prev) is currently stubbed out (empty callbacks).

## 15. Missing Requirement
None of the core features requested in the PDF are completely missing from the codebase.

## 16. Partial Requirement
- **REQ-003 (Audio Player)**: Background play and UI are done, but the playback queue and interactive controls (Next, Previous, Seek) are empty.

## 17. Unsupported Feature (Only if truly outside client scope)
The following features are implemented in the repository but DO NOT exist in the original client PDF. They are outside the validated business scope:
1.  **Downloads**: Explicitly violates the "No Download Option" business rule on Page 6.
2.  **Books**: Not mentioned in the PDF.
3.  **Satsang**: Not mentioned in the PDF.
4.  **Events**: Not mentioned in the PDF.
5.  **Donations**: Not mentioned in the PDF.

## 18. Implementation Support Modules
The following modules are correctly identified as necessary engineering scaffolding (not extra features):
- Dashboard
- Users
- Categories
- RBAC
- Shared CRUD
- Repository Pattern
- Services
- Hooks
- BaseRepository
- StorageService
- Generic Components

## 19. Requirement Coverage
100% of the requested PDF features are represented in the codebase. (Some represent partial completion or violation).

## 20. Business Readiness
**Not Ready.** The presence of the forbidden `downloads` module and the un-wired Audio Player controls prevent this from being shipped to the client as v1.0.

## 21. Recommended Development Order
1.  **Immediate Purge**: Delete the `downloads` module in Flutter to comply with the "No Download Option" business rule.
2.  **Audio Player Completion**: Wire up the empty UI callbacks in `audio_details_page.dart` (Next, Prev, Seek, Shuffle) to the actual background audio player state.
3.  **Scope Alignment**: Remove or isolate the `Books`, `Satsang`, `Events`, and `Donations` modules from the user-facing Flutter app, as they are not requested in the v1.0 PDF.
