/**
 * ============================================================================
 * Santmat Satsang Prachar - Domain & API Type System
 * ============================================================================
 * Defines core backend entities, RBAC roles, permission scopes, and request/response models.
 */

// Strictly 3 roles supported by the Permission Engine
export type UserRole = 'developer_super_admin' | 'client_super_admin' | 'mobile_user';

export type UserAccountStatus = 'active' | 'suspended' | 'pending';

export interface UserCustomClaims {
  role?: UserRole;
  organizationId?: string;
  accountStatus?: UserAccountStatus;
  permissions?: string[];
  [key: string]: unknown;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  organizationId?: string;
  accountStatus: UserAccountStatus;
  status?: string;
  phone?: string;
  city?: string;
  spiritualMotto?: string;
  guruDiksha?: string;
  dikshaGuru?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string;
  lastLogin?: string;
  themeMode?: string;
  languageCode?: string;
}

// Domain Entity Models
export interface BhajanEntity {
  id: string;
  title: string;
  artist: string;
  category: string;
  subCategory?: string;
  duration: string;
  durationSeconds: number;
  audioUrl?: string;
  storagePath?: string;
  imageUrl: string;
  plays: number;
  addedDate: string;
  lyrics?: string;
  isFavorite?: boolean;
  type?: 'भजन' | 'सत्संग' | 'कीर्तन' | 'प्रार्थना';
  language?: string;
  status?: 'प्रकाशित' | 'ड्राफ्ट' | 'शेड्यूल किया गया';
  scheduledDate?: string;
  scheduledTime?: string;
  organizationId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Canonical Stuti-Vinati slot. Exactly two fixed product slots exist:
 * 'morning' (प्रातःकालीन स्तुति) and 'evening' (संध्याकालीन स्तुति).
 */
export type StutiSlot = 'morning' | 'evening';

export interface StutiEntity {
  id: string;
  type: StutiSlot;
  title: string;
  subtitle: string;
  artist: string;
  duration: string;
  durationSeconds: number;
  bannerImage: string;
  quote: string;
  lyrics: string;
  audioUrl?: string;
  storagePath?: string;
  isFavorite?: boolean;
  organizationId?: string;
}


export interface BookEntity {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl?: string;
  pdfUrl?: string;
  storagePath?: string;
  pagesCount?: number;
  publishDate?: string;
  status?: 'published' | 'draft';
  organizationId?: string;
  language?: string;
  description?: string;
}


export interface CategoryEntity {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  subCategories: string[];
  isFeatured?: boolean;
  order?: number;
  active?: boolean;
  organizationId?: string;
  isSystemCategory?: boolean;
  isAllSentinel?: boolean;
  canonicalDataValues?: string[];
  matchTokens?: string[];
}

export type BannerSlotNumber = 1 | 2 | 3 | 4;

export interface BannerEntity {
  id: string;
  title: string;
  imageUrl: string;
  storagePath?: string;
  thumbnailUrl?: string;
  thumbnailStoragePath?: string;
  targetScreen?: string;
  active: boolean;
  order?: number;
  slot?: BannerSlotNumber;
  width?: number;
  height?: number;
  format?: string;
  sizeBytes?: number;
  updatedAt?: string;
  createdAt?: string;
  updatedBy?: string;
  organizationId?: string;
}

export interface NotificationEntity {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'bhajan' | 'stuti' | 'special' | 'event';
  isRead: boolean;
  targetRole?: UserRole | 'all';
  organizationId?: string;
}

export interface PlaylistEntity {
  id: string;
  name: string;
  bhajanIds: string[];
  ownerId?: string;
  createdBy?: string;
  createdAt?: string;
  isPublic?: boolean;
  visibility?: 'public' | 'private';
  organizationId?: string;
}

export interface SystemSettings {
  siteTitle: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  organizationName: string;
  maxUploadSizeBytes: number;
  updatedAt?: string;
}

export interface AnalyticsReport {
  totalBhajans: number;
  totalUsers: number;
  totalPlays: number;
  totalStutis: number;
  totalNotificationsSent: number;
  activeBanners: number;
  deviceBreakdown?: { iphone: number; android: number; web: number };
  dailyPlaysHistory?: Array<{ date: string; plays: number }>;
}

// Service Response Wrapper
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * ============================================================================
 * UI / Presentation Types (Legacy Client Design Models)
 * ============================================================================
 * These types drive the mobile + admin UI. Domain entities are separate and
 * are mapped from backend contracts into these presentation models.
 */

/**
 * Bhajan Track Model
 * Stores track title, artist, devotional category, lyrics, duration, and metadata.
 */
export interface Bhajan {
  id: string;
  title: string;
  artist: string;
  category: string;
  subCategory?: string;
  duration: string;
  durationSeconds: number;
  imageUrl: string;
  audioUrl?: string;
  storagePath?: string;
  plays: number;
  addedDate: string;
  lyrics?: string;
  isFavorite?: boolean;
  type?: 'भजन' | 'सत्संग' | 'कीर्तन' | 'प्रार्थना';
  language?: string;
  status?: 'प्रकाशित' | 'ड्राफ्ट' | 'शेड्यूल किया गया';
  scheduledDate?: string;
  scheduledTime?: string;
}

/**
 * Daily Stuti & Binti Model
 * Data structure for morning and evening prayers, saint quotes, and lyrics.
 */
export interface StutiItem {
  id: string;
  type: StutiSlot;
  title: string;
  subtitle: string;
  artist: string;
  duration: string;
  durationSeconds: number;
  bannerImage: string;
  quote: string;
  lyrics: string;
  audioUrl?: string;
  storagePath?: string;
  isFavorite?: boolean;
}

/**
 * Notification Item Model
 * Satsang announcements, new bhajan alerts, and daily reminders.
 */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'bhajan' | 'stuti' | 'special' | 'event';
  isRead: boolean;
}

/**
 * Custom Playlist Model
 */
export interface Playlist {
  id: string;
  name: string;
  bhajanIds: string[];
  createdAt?: string;
}

/**
 * Category & Sub-Category Model
 */
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  subCategories: string[];
  isFeatured?: boolean;
  order?: number;
  active?: boolean;
  isSystemCategory?: boolean;
  isAllSentinel?: boolean;
  canonicalDataValues?: string[];
  matchTokens?: string[];
}

/**
 * Devotee Sadhana & Profile Statistics Model
 * Tracks sadhana streak, completed stutis, favorite count, and playlists.
 */
export interface UserStats {
  streakDays: number;
  stutiCompleted: number;
  favoriteCount: number;
  playlistsCount: number;
}

/**
 * Mobile Bottom Navigation Tabs
 */
export type MobileTab = 'home' | 'audio' | 'stuti' | 'notifications' | 'profile';

/**
 * Active Mobile Screen State
 */
export type ActiveScreen = 'home' | 'bhajan_list' | 'now_playing' | 'stuti' | 'notifications' | 'search' | 'profile';

/**
 * Admin Panel Navigation Tabs
 */
export type AdminTab = 'dashboard' | 'add_bhajan' | 'bhajan_list' | 'stuti_management' | 'categories' | 'users' | 'playlists' | 'notifications' | 'banners' | 'analytics' | 'settings' | 'support' | 'books' | 'search';

/**
 * Preview Device Display Mode
 */
export type DeviceType = 'iphone' | 'android' | 'fullscreen';
