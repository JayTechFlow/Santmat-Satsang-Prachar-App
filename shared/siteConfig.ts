/**
 * ============================================================================
 * संतमत सत्संग प्रचार — Official Domain Configuration (Single Source of Truth)
 * ============================================================================
 *
 * ONE PUBLIC ORIGIN, TWO SOURCE APPLICATIONS:
 *
 *   PUBLIC ORGANIZATION WEBSITE : https://santmatsatsangparchar.in        (apps/website)
 *   ADMIN DASHBOARD             : https://santmatsatsangparchar.in/admin  (apps/web)
 *
 * Firebase remains backend/infrastructure only. The user-facing Admin
 * experience never leaves the canonical origin above.
 *
 * This module is the ONLY place where absolute administration URLs are
 * defined. Components must consume SITE_CONFIG / ADMIN_PATH instead of
 * hardcoding full admin URLs.
 */

/** Canonical public origin (no trailing slash). */
export const PUBLIC_SITE_URL = 'https://santmatsatsangparchar.in';

/**
 * Canonical admin path served by the same origin.
 * Firebase Hosting rewrites /admin/** to the Admin application bundle.
 */
export const ADMIN_PATH = '/admin';

/** Canonical absolute admin URL. Never a subdomain, never a Firebase domain. */
export const ADMIN_PUBLIC_URL = `${PUBLIC_SITE_URL}${ADMIN_PATH}`;

/** Canonical admin entry points. */
export const ADMIN_LOGIN_PATH = `${ADMIN_PATH}/login`;
export const ADMIN_DASHBOARD_PATH = `${ADMIN_PATH}/dashboard`;

/** Retired admin subdomain — must never be reintroduced in active code. */
export const RETIRED_ADMIN_SUBDOMAIN = 'admin.santmatsatsangparchar.in';

export const SITE_CONFIG = {
  // Primary public organization domain (single source of truth)
  siteUrl: PUBLIC_SITE_URL,

  // Canonical admin URL on the SAME origin
  adminUrl: ADMIN_PUBLIC_URL,
  adminPath: ADMIN_PATH,

  // Firebase project id (backend/infrastructure only)
  firebaseProjectId: 'santmat-satsang-prachar',

  // Organization identity
  orgName: 'SANTMAT SATSANG PARCHAR',
  orgNameHindi: 'संतमत सत्संग प्रचार',
  orgLegalName: 'Santmat Satsang Parchar Seva Trust',
  orgTagline:
    'महर्षि मँही परमहंस जी महाराज के विचारों, स्तुति-विनती, सत्संग प्रवचन एवं भजनों का आधिकारिक मंच',

  // Contact details
  contactEmail: 'santmatsatsangprachar@gmail.com',
  ashramHeadquarters: 'महर्षि मँही आश्रम, कुप्पाघाट, भागलपुर, बिहार — 812003',

  // Official mobile application settings
  mobileApp: {
    name: 'संतमत सत्संग प्रचार',
    englishName: 'Santmat Satsang Prachar',
    packageId: 'in.santmatsatsangparchar.app',
    /**
     * CRITICAL: Do NOT use fake or placeholder Play Store URLs.
     * Before Play Store publication: show "Coming Soon".
     * After publication: replace with the real Google Play Store URL only.
     */
    playStoreStatus: 'coming_soon' as const,
    playStoreUrl: null as string | null, // null until published
  },

  // Canonical route paths
  routes: {
    home: '/',
    about: '/about',
    mobileApp: '/mobile-app',
    contact: '/contact',
    privacyPolicy: '/privacy-policy',
    terms: '/terms',
    deleteAccount: '/delete-account',
    admin: ADMIN_PATH,
    adminLogin: ADMIN_LOGIN_PATH,
    adminDashboard: ADMIN_DASHBOARD_PATH,
  },
} as const;

/**
 * Returns the absolute canonical URL for a given route path on the official
 * domain. Strictly guarantees no mixed domains or trailing-slash discrepancies.
 */
export function getCanonicalUrl(path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') {
    return `${PUBLIC_SITE_URL}/`;
  }
  const normalized = cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;
  return `${PUBLIC_SITE_URL}${normalized}`;
}

/**
 * Returns the absolute canonical admin URL for a path relative to /admin.
 * Example: getAdminUrl('/login') -> https://santmatsatsangparchar.in/admin/login
 */
export function getAdminUrl(path: string = ''): string {
  if (!path || path === '/') return ADMIN_PUBLIC_URL;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === ADMIN_PATH || normalized.startsWith(`${ADMIN_PATH}/`)) {
    return `${PUBLIC_SITE_URL}${normalized}`;
  }
  return `${ADMIN_PUBLIC_URL}${normalized}`;
}

/**
 * True when the supplied pathname belongs to the administration application.
 * Defaults to the current browser location when no pathname is provided.
 */
export function isAdminPath(pathname?: string): boolean {
  const path =
    pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');
  return path === ADMIN_PATH || path.startsWith(`${ADMIN_PATH}/`);
}
