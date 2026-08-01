# Route & Screen Traceability Report

## 1. Overview
This document traces the routing mechanisms, screen availability, and navigation architecture for both the Flutter Mobile application and the React Admin panel, verifying route integrity, dead links, and placeholder implementations.

## 2. React Admin Panel
### Sidebar & Navigation
The React admin panel is built using `react-router-dom` and uses a centralized `Sidebar.tsx` component that maps paths to standard menu items.
All navigational routes inside `App.tsx` precisely match the items configured in `Sidebar.tsx`, meaning there are no unreachable (dead) routes inside the admin panel.

### 404 / Missing Pages
- **No Dedicated 404 Page:** The React app does NOT implement a standalone "404 Not Found" view.
- **Fallback Behavior:** Instead, an asterisk wildcard route (`<Route path="*" element={<Navigate to="/" />} />`) acts as a catch-all, redirecting unrecognized paths straight back to the Dashboard (`/`).

### Coming Soon Features
Some sections mapped in the sidebar (like Reports, Settings, Playlist, Support) exist as routes but function as "Coming Soon" features internally based on page implementations.

## 3. Flutter Mobile App
### Routing Engine
The mobile application uses `GoRouter` (`lib/app/router/app_router.dart`). Navigation logic utilizes both standard top-level routes and a `StatefulShellRoute` for bottom tab navigation functionality.

### Route Collisions (CRITICAL)
A direct route collision exists for the path `/settings`:
- **Root Level Definition (Line 339):** Mapped to `PreferencesHomePage()`
- **Shell Branch Definition (Line 416):** Mapped to `ProfilePage()`
*Impact:* This collision causes routing ambiguity when deep-linking or navigating to `/settings`. GoRouter evaluates paths sequentially, meaning one path effectively masks the other, leading to a dead route or navigational anomalies.

### "Coming Soon" Placeholders
Multiple secondary pages currently bypass complex UI by implementing a `Scaffold` containing a simple `Text('[Feature] Coming Soon')` placeholder.
Examples verified:
- `BookCategoryPage` ("Category Books Coming Soon")
- `BookmarksPage` ("Bookmarks Coming Soon")
- `ReadingHistoryPage` ("History Coming Soon")
- Various secondary pages across Donations, Quotes, Events, and Downloads.

### 404 / Error Handling
There is no `errorBuilder` set on the `GoRouter` configuration. Because of this, the app relies on the default Flutter red-screen error or unhandled exceptions for unmatched deep links, rather than a graceful user-facing 404 screen.
