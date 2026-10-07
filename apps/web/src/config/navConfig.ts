import {
  LayoutDashboard,
  Music,
  PlusCircle,
  List,
  BookOpen,
  BookMarked,
  FolderTree,
  Image,
  ListMusic,
  Bell,
  HardDrive,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Search,
  type LucideIcon,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  /** Permission id from PermissionContext.PERMISSION_REGISTRY */
  permission?: string;
  /** Feature flag id from PermissionContext.FEATURE_FLAGS */
  featureFlag?: string;
  /** Optional nested children (e.g. Bhajans group) */
  children?: NavItem[];
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

// ── Navigation Structure ───────────────────────────────────────────────────

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'dashboard',
    label: '',
    items: [
      {
        id: 'dashboard',
        label: 'डैशबोर्ड',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'content',
    label: 'सामग्री प्रबंधन',
    items: [
      {
        id: 'bhajans',
        label: 'भजन प्रबंधन',
        path: '/admin/bhajan-list',
        icon: Music,
        permission: 'audio.manage',
        featureFlag: 'feature.audio',
        children: [
          {
            id: 'add-bhajan',
            label: 'नया भजन जोड़ें',
            path: '/admin/add-bhajan',
            icon: PlusCircle,
            permission: 'audio.upload',
            featureFlag: 'feature.audio',
          },
          {
            id: 'bhajan-list',
            label: 'भजन सूची',
            path: '/admin/bhajan-list',
            icon: List,
            permission: 'audio.manage',
            featureFlag: 'feature.audio',
          },
        ],
      },
      {
        id: 'stuti',
        label: 'स्तुति-विनती',
        path: '/admin/stuti-vinati',
        icon: BookOpen,
        permission: 'stuti.manage',
      },
      {
        id: 'books',
        label: 'पुस्तकें',
        path: '/admin/books',
        icon: BookMarked,
        permission: 'books.manage',
        featureFlag: 'feature.books',
      },
      {
        id: 'categories',
        label: 'श्रेणियाँ',
        path: '/admin/categories',
        icon: FolderTree,
        permission: 'categories.manage',
      },
      {
        id: 'banners',
        label: 'बैनर प्रबंधन',
        path: '/admin/banners',
        icon: Image,
        permission: 'banners.manage',
        featureFlag: 'feature.banners',
      },
    ],
  },
  {
    id: 'engagement',
    label: 'संलग्नता',
    items: [
      {
        id: 'playlists',
        label: 'प्लेलिस्ट्स',
        path: '/admin/playlists',
        icon: ListMusic,
        permission: 'playlists.manage',
        featureFlag: 'feature.playlists',
      },
      {
        id: 'notifications',
        label: 'सूचनाएँ',
        path: '/admin/notifications',
        icon: Bell,
        permission: 'notifications.manage',
        featureFlag: 'feature.notifications',
      },
      {
        id: 'media',
        label: 'मीडिया नियंत्रण केंद्र',
        path: '/admin/media',
        icon: HardDrive,
        permission: 'media.manage',
        featureFlag: 'feature.media',
      },
    ],
  },
  {
    id: 'admin',
    label: 'प्रशासन',
    items: [
      {
        id: 'users',
        label: 'उपयोगकर्ता प्रबंधन',
        path: '/admin/users',
        icon: Users,
        permission: 'users.view',
      },
      {
        id: 'reports',
        label: 'रिपोर्ट और एनालिटिक्स',
        path: '/admin/reports',
        icon: BarChart3,
        permission: 'reports.view',
        featureFlag: 'feature.analytics',
      },
      {
        id: 'settings',
        label: 'ऐप सेटिंग्स',
        path: '/admin/settings',
        icon: Settings,
        permission: 'settings.manage',
      },
      {
        id: 'support',
        label: 'समर्थन',
        path: '/admin/support',
        icon: MessageSquare,
        permission: 'support.view',
      },
    ],
  },
  {
    id: 'tools',
    label: 'उपकरण',
    items: [
      {
        id: 'search',
        label: 'वैश्विक खोज',
        path: '/admin/search',
        icon: Search,
        permission: 'search.execute',
      },
    ],
  },
];

// ── Route → Title Lookup ───────────────────────────────────────────────────

const ROUTE_TITLES: Record<string, string> = {
  '/admin': 'डैशबोर्ड एवं सांख्यिकी',
  '/admin/dashboard': 'डैशबोर्ड एवं सांख्यिकी',
  '/admin/users': 'सत्संगी भक्त समुदाय',
  '/admin/playlists': 'भजन प्लेलिस्ट्स',
  '/admin/notifications': 'सूचनाएँ',
  '/admin/banners': 'बैनर प्रबंधन',
  '/admin/categories': 'श्रेणियाँ',
  '/admin/reports': 'रिपोर्ट',
  '/admin/settings': 'सेटिंग्स',
  '/admin/support': 'समर्थन',
  '/admin/books': 'पुस्तकें',
  '/admin/search': 'खोज',
  '/admin/stuti-vinati': 'स्तुति-बिनती',
  '/admin/add-bhajan': 'भजन प्रबंधन',
  '/admin/bhajan-list': 'भजन प्रबंधन',
  '/admin/media': 'मीडिया नियंत्रण केंद्र',
};

export function getRouteTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  // Prefix matching for sub-routes
  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(route + '/') || pathname === route) return title;
  }
  return 'संतमत एडमिन पोर्टल';
}
