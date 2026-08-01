# Requirement Traceability Matrix (RTM)

| Req ID / Feature | Description | Flutter Screen (App) | React Screen (Admin) | Components (Flutter / React) | Firestore Collection | Repository | Service | Hook (React) |
|---|---|---|---|---|---|---|---|---|
| **Auth** (Implicit) | Login, Profile Management | `LoginScreen`, `ProfileScreen` | `AdminLoginScreen` | `AuthForm`, `ProfileHeader` | `users`, `admins` | `AuthRepository`, `UserRepository` | `AuthService`, `UserService` | `useAuth`, `useUser` |
| **FR-001, FR-002, FR-007, FR-008, FR-009** | Audio Streaming, Player, Background Play, List | `AudioScreen`, `AudioPlayerScreen` | `AudioManagementScreen` | `AudioListItem`, `MiniPlayer`, `PlayerControls`, `ProgressBar` | `audios` | `AudioRepository` | `AudioService`, `AudioPlayerService` | `useAudios` |
| **FR-005, FR-006** | Home Screen, Banner, Quotes | `HomeScreen` | `HomeDashboard` | `HomeBanner`, `QuoteCard`, `AudioCard` | `banners`, `quotes` | `BannerRepository`, `QuoteRepository` | `BannerService`, `QuoteService` | `useBanners`, `useQuotes` |
| **FR-010** | स्तुति-विनती (Stuti-Vinti) immediately play | `StutiVintiScreen` | `StutiManagementScreen` | `StutiCard`, `WaveAnimation` | `stuti_vinti` | `StutiRepository` | `StutiService` | `useStuti` |
| **FR-003, FR-011** | Firebase Notifications, Unread Dot | `NotificationsScreen` | `NotificationManagementScreen` | `NotificationListItem`, `CategoryFilter` | `notifications` | `NotificationRepository` | `NotificationService` | `useNotifications` |
| **FR-012** | Search content directly | `SearchScreen` | N/A | `SearchBar`, `SearchResultItem` | N/A (Index on `audios`) | `SearchRepository` | `SearchService` | `useSearch` |
| **FR-013** | Admin Audio Upload, Edit, Delete | N/A | `AudioManagementScreen` | `AudioForm`, `AudioDataTable` | `audios` | `AudioRepository` | `AudioService` | `useAudios` |
| **FR-014** | Admin Today's Thought & Notifications | N/A | `QuoteManagementScreen`, `NotificationManagementScreen` | `QuoteForm`, `NotificationForm` | `quotes`, `notifications` | `QuoteRepository`, `NotificationRepository` | `QuoteService`, `NotificationService` | `useQuotes`, `useNotifications` |
| **Cached Knowledge** | Satsang Management | `SatsangScreen` | `SatsangManagementScreen` | `SatsangCard`, `SatsangList` | `satsangs` | `SatsangRepository` | `SatsangService` | `useSatsangs` |
| **Cached Knowledge** | Events Management | `EventsScreen` | `EventManagementScreen` | `EventCard`, `EventDetails` | `events` | `EventRepository` | `EventService` | `useEvents` |
| **Cached Knowledge** | Donations Management | `DonationScreen` | `DonationManagementScreen` | `DonationForm`, `TransactionHistory` | `donations` | `DonationRepository` | `DonationService` | `useDonations` |

## Mapping Details

### 1. Firestore Database Design
- **`users`**: Stores user profiles, roles, favorite items, listening history.
- **`audios`**: Stores Bhajan metadata (Title, Singer, Duration, Audio URL, Thumbnail URL, Timestamps).
- **`stuti_vinti`**: Stores Morning & Evening Stuti data.
- **`banners`**: Home screen promotional/informational banners.
- **`quotes`**: "आज का सुविचार" and inspirational quotes.
- **`notifications`**: User push notifications data.
- **`satsangs`**: Scheduled Satsangs, locations, speakers.
- **`events`**: Upcoming events, celebrations, and schedules.
- **`donations`**: Contribution records, user links, receipts.

### 2. Implementation Notes
- **Missing Admin Features (Cached Knowledge)**: While the Client Requirement Document (CRD) emphasizes Audio, Home, Stuti, Search, Notifications, and Profile, the *Satsang*, *Events*, and *Donations* modules have been identified as missing in the Admin specs. They have been proactively mapped in this Traceability Matrix.
- **Storage**: **FR-004** requires Firebase Storage, which will be integrated in `AudioService`, `BannerService`, and `QuoteService` via a shared `StorageService`.
- **Restrictions**: 
  - No Download feature will be enforced in Flutter by omitting local file-saving mechanisms and only playing streaming URLs via `AudioPlayerService`.
