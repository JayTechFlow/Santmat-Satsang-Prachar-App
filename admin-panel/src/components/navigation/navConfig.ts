import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Image as ImageIcon, Tags, BookOpen, Music, ListVideo, Bell, Users, BarChart, Settings, HelpCircle } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  feature?: string;
  adminOnly?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  { id: 'main', title: 'Main', items: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { id: 'content', title: 'Content', items: [
    { path: '/banners', label: 'Banners', icon: ImageIcon, permission: 'banners.manage', feature: 'feature.banners' },
    { path: '/categories', label: 'Categories', icon: Tags, permission: 'categories.manage' },
    { path: '/suvichar', label: 'Suvichar', icon: BookOpen, permission: 'stuti.manage', feature: 'feature.suvichar' },
    { path: '/books', label: 'Books', icon: BookOpen, permission: 'books.manage', feature: 'feature.books' },
    { path: '/audio', label: 'Audio / Bhajans', icon: Music, permission: 'audio.manage', feature: 'feature.audio' },
    { path: '/stuti-vinati', label: 'Stuti & Vinati', icon: BookOpen, permission: 'stuti.manage', feature: 'feature.suvichar' },
    { path: '/playlist', label: 'Playlists', icon: ListVideo, permission: 'playlists.manage', feature: 'feature.playlists' },
  ]},
  { id: 'operations', title: 'Operations', items: [
    { path: '/notifications', label: 'Notifications', icon: Bell, permission: 'notifications.manage', feature: 'feature.notifications' },
    { path: '/users', label: 'Users', icon: Users, permission: 'users.view', adminOnly: true },
    { path: '/reports', label: 'Reports', icon: BarChart, permission: 'reports.view', feature: 'feature.analytics', adminOnly: true },
  ]},
  { id: 'system', title: 'System', items: [
    { path: '/settings', label: 'App Settings', icon: Settings, permission: 'settings.manage' },
    { path: '/support', label: 'Support', icon: HelpCircle, permission: 'support.view', adminOnly: true },
  ]},
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(s => s.items);

export function isPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/') return pathname === '/';
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  const item = NAV_ITEMS.find(i => isPathActive(pathname, i.path));
  return item?.label ?? 'Dashboard';
}

export function getBreadcrumbTrail(pathname: string): { label: string; path?: string }[] {
  const trail: { label: string; path?: string }[] = [{ label: 'Home', path: '/' }];
  const item = NAV_ITEMS.find(i => isPathActive(pathname, i.path));
  if (!item || item.path === '/') return trail;
  const section = NAV_SECTIONS.find(s => s.items.includes(item));
  if (section && section.title !== 'Main') trail.push({ label: section.title, path: undefined });
  trail.push({ label: item.label, path: item.path });
  return trail;
}