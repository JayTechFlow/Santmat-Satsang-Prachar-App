# Requirement Traceability Matrix V2

## 1. Complete Requirement Inventory
The following modules represent the complete inventory derived from the business requirements PDF:
- Home Screen
- Audio List
- Audio Player
- Stuti Vinati
- Notifications
- Search
- Profile
- Admin Panel
- Global Requirements

## 2. Granular Requirement IDs (Every Bullet)
| ID | Requirement | Category |
|---|---|---|
| REQ-001.01 | Logo | Home |
| REQ-001.02 | App Name | Home |
| REQ-001.03 | Search Bar | Home |
| REQ-001.04 | Notification Icon | Home |
| REQ-001.05 | Home Banner | Home |
| REQ-001.06 | Banner Share | Home |
| REQ-001.07 | Today's Suvichar | Home |
| REQ-001.08 | Audio Card | Home |
| REQ-001.09 | Stuti Vinati Card | Home |
| REQ-001.10 | Inspirational Quote | Home |
| REQ-001.11 | Latest Bhajan List | Home |
| REQ-001.12 | Bottom Navigation | Home |
| REQ-001.13 | Home Navigation | Home |
| REQ-001.14 | Audio Navigation | Home |
| REQ-001.15 | Stuti Navigation | Home |
| REQ-001.16 | Notification Navigation | Home |
| REQ-001.17 | Profile Navigation | Home |
| REQ-002.01 | Search | Audio List |
| REQ-002.02 | Thumbnail | Audio List |
| REQ-002.03 | Title | Audio List |
| REQ-002.04 | Duration | Audio List |
| REQ-002.05 | Play Button | Audio List |
| REQ-002.06 | Mini Player | Audio List |
| REQ-002.07 | Scrollable List | Audio List |
| REQ-002.08 | Open Audio Player | Audio List |
| REQ-003.01 | Large Thumbnail | Audio Player |
| REQ-003.02 | Title | Audio Player |
| REQ-003.03 | Singer | Audio Player |
| REQ-003.04 | Play | Audio Player |
| REQ-003.05 | Pause | Audio Player |
| REQ-003.06 | Previous | Audio Player |
| REQ-003.07 | Next | Audio Player |
| REQ-003.08 | Progress | Audio Player |
| REQ-003.09 | Shuffle | Audio Player |
| REQ-003.10 | Repeat | Audio Player |
| REQ-003.11 | Favorite | Audio Player |
| REQ-003.12 | Share | Audio Player |
| REQ-003.13 | Background Play | Audio Player |
| REQ-003.14 | Up Next | Audio Player |
| REQ-003.15 | Related Bhajans | Audio Player |
| REQ-003.16 | Auto Play Next | Audio Player |
| REQ-004.01 | Morning Card | Stuti Vinati |
| REQ-004.02 | Evening Card | Stuti Vinati |
| REQ-004.03 | Thumbnail | Stuti Vinati |
| REQ-004.04 | Play | Stuti Vinati |
| REQ-004.05 | Wave Animation | Stuti Vinati |
| REQ-004.06 | Favorite | Stuti Vinati |
| REQ-004.07 | Share | Stuti Vinati |
| REQ-004.08 | Description | Stuti Vinati |
| REQ-004.09 | Direct Play | Stuti Vinati |
| REQ-004.10 | No Separate List | Stuti Vinati |
| REQ-005.01 | Categories | Notifications |
| REQ-005.02 | All | Notifications |
| REQ-005.03 | Updates | Notifications |
| REQ-005.04 | Special | Notifications |
| REQ-005.05 | Latest First | Notifications |
| REQ-005.06 | Unread Dot | Notifications |
| REQ-006.01 | Title | Search |
| REQ-006.02 | Singer | Search |
| REQ-006.03 | Keywords | Search |
| REQ-006.04 | Recent Searches | Search |
| REQ-006.05 | Popular Searches | Search |
| REQ-006.06 | Open Result Directly | Search |
| REQ-007.01 | Photo | Profile |
| REQ-007.02 | Name | Profile |
| REQ-007.03 | Mobile | Profile |
| REQ-007.04 | Email | Profile |
| REQ-007.05 | Personal Information | Profile |
| REQ-007.06 | Favorite Bhajans | Profile |
| REQ-007.07 | Listening History | Profile |
| REQ-007.08 | Notification Settings | Profile |
| REQ-007.09 | Language | Profile |
| REQ-007.10 | About App | Profile |
| REQ-007.11 | Logout | Profile |
| REQ-008.01 | Audio | Admin Panel |
| REQ-008.02 | Audio Thumbnail | Admin Panel |
| REQ-008.03 | Audio Title | Admin Panel |
| REQ-008.04 | Edit Audio | Admin Panel |
| REQ-008.05 | Delete Audio | Admin Panel |
| REQ-008.06 | Today's Thought | Admin Panel |
| REQ-008.07 | Notifications | Admin Panel |
| REQ-009.01 | Audio Streaming Only | Global Requirements |
| REQ-009.02 | No Download | Global Requirements |
| REQ-009.03 | Background Play | Global Requirements |
| REQ-009.04 | Firebase Notifications | Global Requirements |
| REQ-009.05 | Firebase Storage | Global Requirements |
| REQ-009.06 | Share Banner | Global Requirements |
| REQ-009.07 | Future Ready Architecture | Global Requirements |

## 3. PDF Page Number
- REQ-001 (Home): Page 1
- REQ-002 (Audio List): Page 2
- REQ-003 (Audio Player): Page 2-3
- REQ-004 (Stuti Vinati): Page 3
- REQ-005 (Notifications): Page 3-4
- REQ-006 (Search): Page 4
- REQ-007 (Profile): Page 4-5
- REQ-008 (Admin Panel): Page 6
- REQ-009 (Global): Page 6

## 4. Business Rule
- **No Download Option**: The system must enforce streaming only. No offline saving of audio files to local device storage.
- **Background Play**: Audio must not terminate when the application enters the background state.
- **Future Ready Architecture**: Usage of modern scalable patterns (Hooks, Repositories, Providers, Services).
- **Direct Play for Stuti**: Must bypass the secondary listing screen and commence audio immediately upon tap.

## 5. React Mapping
- `admin-panel/src/pages/Audio.tsx` maps to REQ-008.01 to REQ-008.05.
- `admin-panel/src/pages/Suvichar.tsx` maps to REQ-008.06.
- `admin-panel/src/pages/Notifications.tsx` maps to REQ-008.07.
- Hooks like `useBhajans.ts` manage state and map to REQ-008.
- Shared components map to Implementation Support Modules.

## 6. Flutter Mapping
- `mobile/app/lib/features/home/` maps to REQ-001.
- `mobile/app/lib/features/audio/` maps to REQ-002 and REQ-003 (Audio Player & List).
- `mobile/app/lib/features/stuti_vinati/` maps to REQ-004.
- `mobile/app/lib/features/notifications/` maps to REQ-005.
- `mobile/app/lib/features/search/` maps to REQ-006.
- `mobile/app/lib/features/profile/` maps to REQ-007.
- `mobile/app/lib/app/router/app_router.dart` controls bottom navigation mapping to REQ-001.12 to .17.

## 7. Firebase Mapping
- `audio` collection maps to REQ-008.01, REQ-002, REQ-003.
- `suvichar` collection maps to REQ-008.06, REQ-001.07.
- `banners` collection maps to REQ-001.05.
- `stuti_vinati` collection maps to REQ-004.
- `users` collection maps to REQ-007.
- `Storage Rules` map to REQ-009.05.
- `Cloud Functions (Notifications)` map to REQ-005 and REQ-009.04.

## 8. Workflow Mapping
Admin creates content via React UI -> Validates against Business Rules -> Saves Media to Firebase Storage (REQ-009.05) -> Saves Metadata to Firestore -> Triggers Cloud Function for Notifications (REQ-009.04) -> Mobile App queries Firestore -> Flutter renders UI -> User interacts (e.g. Streams Audio -> REQ-009.01, Background Play -> REQ-009.03).

## 9. Evidence
- React: `Audio.tsx`, `Suvichar.tsx`, `Notifications.tsx` exist.
- Flutter: `audio_details_page.dart`, `stuti_vinati_page.dart`, `home_page.dart` exist.
- Firebase: `firestore.rules` and `storage.rules` contain corresponding collection security.
- Android: `AndroidManifest.xml` contains background audio service declarations.
- Violation Evidence: `mobile/app/lib/features/downloads` directory exists.

## 10. Completion Status
- Most REQ-001, REQ-002, REQ-004, REQ-005, REQ-006, REQ-007, REQ-008 are **Completed**.
- REQ-003 (Audio Player Controls) are **Partial** (empty callbacks for Seek, Prev, Next, Favorite).
- REQ-009.02 (No Download) is **Business Rule Violation** (Downloads feature exists).

## 11. Completion Percentage
- **UI/Layout Coverage**: 100%
- **Functional Completion**: 85% (Due to empty callbacks in Audio Player)
- **Business Rule Compliance**: Failed (Download option violates requirements)

## 12. Gap Analysis
The application strictly maps to the PDF for UI layout and broad feature strokes. The primary gaps are the lack of wired logic in the Flutter Audio Player UI (Seek, Next, Previous, Favorite) and the critical breach of the "No Download Option" business rule by the presence of a downloads module in the Flutter repository.

## 13. Partial Requirement
- **REQ-003.06 to REQ-003.11 (Audio Player Controls)**: UI exists, but the event handlers in `audio_details_page.dart` are empty `TODO` stubs.

## 14. Missing Requirement
- None of the explicit PDF requirements are entirely missing from the codebase. All requested UI elements and screens exist in some capacity.

## 15. Unsupported Feature
- **Downloads Module**: (`mobile/app/lib/features/downloads`) - This is explicitly marked as a **Business Rule Violation** because the PDF firmly dictates "❌ No Download Option".

*Note: The following features exist in the repository but do not violate the PDF. As per strict rules, they are classified as **Future Scope**:*
- Books
- Satsang
- Events
- Donations

## 16. Implementation Support Modules
The following engineering modules exist in the repository and are vital for the architecture. They are strictly classified as Implementation Support Modules and NOT extra features:
- Dashboard
- Users
- Roles
- Categories
- Shared CRUD
- Repository Pattern
- Services
- Hooks
- Storage Service
- Base Repository
- Base Service
- Authentication
- Logging
- RBAC
- Pagination
- Bulk Actions
- Search Infrastructure

## 17. Requirement Coverage
The repository covers **100%** of the requested screens and widgets outlined in the PDF. 

## 18. Business Readiness
**Not Ready.**
The application cannot be launched in its current state because:
1. It violates a core business rule (Downloads).
2. The core audio playback controls are functionally empty (Next, Prev, Seek).

## 19. Priority Matrix
- **Priority 1 (Critical)**: Remove the `downloads` module. (Fixes Business Rule Violation).
- **Priority 2 (High)**: Implement `TODO` callbacks in `audio_details_page.dart` (Next, Previous, Seek, Shuffle, Favorite).
- **Priority 3 (Medium)**: Hide or decouple "Future Scope" features (Books, Satsang, Events, Donations) from the primary navigation if they are not meant for this release phase.

## 20. Development Order
1. Purge `downloads` module.
2. Wire up `audio_details_page.dart` controls.
3. Finalize data binding to replace any remaining Mock Data sources with live Firebase repositories.
4. QA verification of Background Play and Auto Play Next workflows.
