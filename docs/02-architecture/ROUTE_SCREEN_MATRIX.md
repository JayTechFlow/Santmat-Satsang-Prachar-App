# Route & Screen Matrix

This document outlines the routing architecture for both the Admin Panel (React) and the Mobile App (Flutter), highlighting route protection, redirects, dead routes, 404 handling, and placeholders (Coming Soon pages).

## 1. Admin Panel (React Router)

The admin panel utilizes `react-router-dom` for navigation, structured around a central `<App>` component with a layout and sidebar.

### Overview
- **Router Type:** `BrowserRouter`
- **Protected Routes:** All paths under `/` are protected by a layout check: `user ? <Layout /> : <Navigate to="/login" />`.
- **Navigation:** Controlled primarily via the `Sidebar.tsx` component.

### Route Matrix
| Path | Component | Protected | Sidebar Link | Status |
|------|-----------|-----------|--------------|--------|
| `/login` | `Login` | No | No | Active (Redirects to `/` if logged in) |
| `/` | `Dashboard` | Yes | Yes | Active |
| `/suvichar` | `Suvichar` | Yes | Yes | Active |
| `/banners` | `Banners` | Yes | Yes | Active |
| `/audio` | `Audio` | Yes | Yes | Active |
| `/stuti-vinati` | `StutiVinati` | Yes | Yes | Active |
| `/books` | `Books` | Yes | Yes | Active |
| `/notifications` | `Notifications` | Yes | Yes | Active |
| `/categories` | `Categories` | Yes | Yes | Active |
| `/users` | `Users` | Yes | Yes | Active |
| `/reports` | `Reports` | Yes | Yes | **Coming Soon** |
| `/settings` | `Settings` | Yes | Yes | **Coming Soon** |
| `/playlist` | `Playlist` | Yes | Yes | **Coming Soon** |
| `/support` | `Support` | Yes | Yes | **Coming Soon** |

### Special Routes & Behaviors
- **404 Handling:** There is no dedicated `404 Not Found` page. Unmatched routes hit a catch-all route (`<Route path="*" element={<Navigate to="/" />} />`) which redirects users back to the dashboard (`/`).
- **Dead Routes / Unreachable Pages:** None detected. Every route mapped in `App.tsx` corresponds to a sidebar link.

---

## 2. Mobile App (Flutter GoRouter)

The mobile app employs `GoRouter` for deep-linking, shell routes (Bottom Navigation), and declarative routing.

### Overview
- **Router Type:** `GoRouter`
- **Protected Routes:** Governed by a global redirect interceptor listening to `authStateProvider`. If a user is not authenticated, they are redirected to `/login` (or `/onboarding` for first launch).
- **Navigation Shell:** Uses `StatefulShellRoute.indexedStack` for Bottom Navigation (Home, Audio, Satsang, Notifications, Profile).

### Notable Route Groups & Status
| Feature Area | Paths | Status |
|-------------|-------|--------|
| **Auth & Onboarding** | `/splash`, `/onboarding`, `/login` | Active |
| **Home (Shell)** | `/` | Active |
| **Profile** | `/profile/edit`, `/profile/account` | Active |
| **Satsang** | `/satsang`, `/satsang/details/:id` | Active |
| **Audio** | `/audio`, `/audio/details/:id` | Active |
| **Books** | `/books/details/:id` | Active |
| **Library** | `/library`, `/library/bookmarks`, `/library/favorites`, `/library/history`, `/library/recent` | Active |
| **Settings (Prefs)**| `/settings/appearance`, `/settings/accessibility`, `/settings/notifications`, etc. | Active |

### Coming Soon Pages
Numerous secondary pages display a temporary placeholder (`Text('... Coming Soon')`):
- **Satsang:** Category Page (`/satsang/category/:id`)
- **Audio:** Audio Category Page (`/audio/category/:id`)
- **Books:** Book Category, Bookmarks, Reading History (`/books/category/:id`, `/books/bookmarks`, `/books/history`)
- **Quotes:** Quote Details, Favorites, History (`/quotes/details/:id`, `/quotes/favorites`, `/quotes/history`)
- **Events:** Event Details, My Events, Registration (`/events/details/:id`, `/events/my-events`, `/events/register/:id`)
- **Donations:** Campaign Details, Checkout, History, Receipt (`/donations/details/:id`, `/donations/checkout/:id`, `/donations/history`, `/donations/receipt/:id`)
- **Downloads:** Download Details (`/downloads/details/:id`)

### Special Routes & Architectural Issues
- **404 Handling:** No explicit `errorBuilder` is configured in `GoRouter`. Invalid paths will trigger the default Flutter error screen rather than a custom 404 fallback page.
- **Route Collision / Dead Routes (CRITICAL):**
  There is a path collision defined for `/settings`.
  - In the root routes list: `GoRoute(path: '/settings', builder: (context, state) => const PreferencesHomePage())`
  - In the `StatefulShellBranch`: `GoRoute(path: '/settings', builder: (context, state) => const ProfilePage())`
  Because GoRouter evaluates routes in the order they are registered (or gives precedence to standalone paths), this causes a routing conflict that needs resolution. One of these will be unreachable or cause navigation anomalies depending on how they are accessed.
