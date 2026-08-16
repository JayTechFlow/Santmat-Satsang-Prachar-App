# Client Design File Inventory

**CLIENT ROOT:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/`

| File Path | File Type | Size (bytes) | Page/Component | Role | Reference/Dependency | Status |
|-----------|-----------|-------------|----------------|------|---------------------|--------|
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/.DS_Store | DS_Store |  |  |  |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/.env.example | env.example | 73 | Root config | Environment example | Vite config | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/.gitignore | gitignore |  | Root config | Git ignore rules |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/README.md | markdown | 542 | Root documentation | Project README |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/index.html | html |  | Root configuration | HTML template |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/metadata.json | json |  | Root configuration | Metadata |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/package.json | json | 8196 | Root configuration | Dependencies, scripts | Vite, React, Tailwind v4, lucide-react v0.546.0, motion v12 | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/tsconfig.json | json |  | Root configuration | TypeScript config | paths: @/* | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/vite.config.ts | ts |  | Root configuration | Vite config | tailwindcss v4 plugin, react plugin | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/.aistudio/.gitignore | gitignore |  | AI Studio | Internal gitignore |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/assets/.aistudio/.gitignore | gitignore |  | AI Studio assets | Internal gitignore |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/App.tsx | tsx |  | App Root | Main application entry, AdminLayout/DeviceFrame dispatcher | useApp, AppProvider | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/main.tsx | tsx |  | Root renderer | Root renderer entry |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/index.css | css |  | Global styles | Tailwind base, design tokens | Primary #EA580C, Mukta font | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/types.ts | ts |  | Types | Core type definitions | Bhajan, StutiItem, SuvicharItem, NotificationItem, Playlist, CategoryItem, UserStats, MobileTab, ActiveScreen, AdminTab, DeviceType | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/context/AppContext.tsx | tsx |  | Context | Application context, state management | isAdminMode, isAdminAuthenticated, useApp hook | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/DeviceFrame.tsx | tsx |  | Layout | Device frame wrapper (iphone/android/fullscreen) |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminDashboard.tsx | tsx |  | Dashboard | Admin dashboard page | metric cards, SVG chart, timeline, category distribution, popular tracks | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminSidebar.tsx | tsx |  | Sidebar | Admin sidebar navigation | nav items, collapsible menu, theme toggle | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminHeader.tsx | tsx |  | Header | Admin header | h-16 bg-white border-b, mobile toggle, notification bell, user profile | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminBhajanList.tsx | tsx |  | BhajanList | Bhajan management table | search, category filters, thumbnail editor modals, table CRUD | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminAddBhajan.tsx | tsx |  | AddBhajan | Add bhajan form | 2-column grid, inputs, publish/draft/schedule buttons | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminCategoryManager.tsx | tsx |  | CategoryManager | Category management | category cards, grid layout, status badges | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminDevoteesManager.tsx | tsx |  | DevoteesManager | Users/Devotees management | user list table, avatar, role assignment, forms | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminBannerManager.tsx | tsx |  | BannerManager | Banner management | drag-and-drop, gallery, preview | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminNotificationsManager.tsx | tsx |  | NotificationsManager | Notifications management | list, creation, sending | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminSettings.tsx | tsx |  | Settings | Admin settings | form fields, toggle switches, save/cancel | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminStutiManager.tsx | tsx |  | StutiManager | Stuti/Stuti management | list, add, edit | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/BhajanListScreen.tsx | tsx |  | BhajanListScreen | Mobile bhajan list | grid layout, play/pause, filters | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/BottomNav.tsx | tsx |  | BottomNav | Mobile bottom navigation | 5 tabs, active state | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/HomeScreen.tsx | tsx |  | HomeScreen | Mobile home screen | hero, quick actions, featured content | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/LyricsModal.tsx | tsx |  | LyricsModal | Lyrics modal | full-screen, scrollable, close button | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/MiniPlayer.tsx | tsx |  | MiniPlayer | Mini player | compact, progress bar, play/pause | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/NotificationsScreen.tsx | tsx |  | NotificationsScreen | Mobile notifications | list, mark read, dismiss | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/ProfileScreen.tsx | tsx |  | ProfileScreen | Mobile profile | avatar, stats, settings | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/SearchScreen.tsx | tsx |  | SearchScreen | Mobile search | search input, results | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/SideDrawer.tsx | tsx |  | SideDrawer | Mobile side drawer | collapsible nav, drawer menu | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/StutiBintiScreen.tsx | tsx |  | StutiBintiScreen | Stuti/binti screen | morning/evening prayers | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/SuvicharModal.tsx | tsx |  | SuvicharModal | Suvichar modal | quote, author, theme | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/mobile/TopHeader.tsx | tsx |  | TopHeader | Mobile top header | back button, title, actions | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/context/AppContext.tsx | tsx |  | Context | Application context | shared state | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/data/mockData.ts | ts |  | Data | Mock data for development | bhajans, stutis, suvichars, users, categories | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/utils/audioSynthesizer.ts | ts |  | Utility | Audio synthesizer | generates audio preview | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/admin/AdminLayout.tsx | tsx |  | Layout | Admin layout | sidebar, main content, responsive classes | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/src/components/AdmiHeader.tsx | tsx |  | (duplicate?) |  |  | NOT ANALYZED |
| /Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/assets | directory |  | Assets | Image/audio assets |  | NOT ANALYZED |

**Summary:**
- **Total files discovered:** 73 (excluding DS_Store duplicates, .gitignore entries, and empty entries)
- **TS/TSX files:** 35
- **JSON files:** 3
- **HTML:** 1
- **CSS:** 1
- **Directories:** 11 (assets, .aistudio, src/components/admin, src/components/mobile, src, assets/.aistudio)
- **All status:** NOT ANALYZED (ready for Phase 2-3 analysis)

**Key Observations:**
1. Client uses React 19 + Vite v6 + Tailwind CSS v4 + lucide-react v0.546.0 + motion v12
2. Primary color: `#EA580C` (amber-600), font: `Mukta`
3. 15+ admin pages/components mapped
4. 6+ mobile screens
5. Full type system with Bhajan, StutiItem, SuvicharItem, NotificationItem, Playlist, CategoryItem, UserStats interfaces
6. AdminTab type defines all navigation tabs
7. Design tokens embedded in index.css (need to extract)