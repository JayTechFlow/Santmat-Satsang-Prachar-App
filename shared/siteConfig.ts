/**
 * ============================================================================
 * SANTMAT SATSANG PARCHAR — Official Business Configuration (Single Source of Truth)
 * ============================================================================
 *
 * SOLE PROPRIETORSHIP BUSINESS:
 *   Legal Entity Name   : SANTMAT SATSANG PARCHAR
 *   Business Structure  : Sole Proprietorship
 *   Proprietor Name     : Pravin kumar
 *   GSTIN               : 10ITEPK2336G1Z2
 *   Udyam Registration  : UDYAM-BR-30-0067864
 *
 * CANONICAL ORIGIN:
 *   PUBLIC BUSINESS WEBSITE : https://santmatsatsangparchar.in        (apps/website)
 *   ADMIN DASHBOARD         : https://santmatsatsangparchar.in/admin  (apps/web)
 *
 * This module is the central source of truth for business identity,
 * registration details, routes, and canonical URLs.
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

/**
 * Firebase default hosting domains.
 * Root visits ('/') on these domains redirect to the Admin Dashboard (/admin/).
 */
export const FIREBASE_DEFAULT_DOMAINS = [
  'santmat-satsang-prachar.web.app',
  'santmat-satsang-prachar.firebaseapp.com',
] as const;

/**
 * Checks whether a given hostname matches one of the Firebase default hosting domains.
 */
export function isFirebaseDefaultDomain(hostname?: string): boolean {
  if (!hostname && typeof window === 'undefined') return false;
  const host = (
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')
  ).toLowerCase();
  return (
    host === 'santmat-satsang-prachar.web.app' ||
    host === 'santmat-satsang-prachar.firebaseapp.com'
  );
}

/**
 * Evaluates whether a request should redirect to the Admin Dashboard (/admin/).
 * Only root URLs ('/' or '') on Firebase default domains are redirected.
 *
 * Query parameters and URL fragments are preserved.
 * Non-root paths (including /about, /services, /admin/*, and auth handlers) are NOT redirected.
 */
export function getFirebaseRootAdminRedirect(
  hostname?: string,
  pathname?: string,
  search: string = '',
  hash: string = ''
): string | null {
  const host = (
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')
  ).toLowerCase();
  const path =
    pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  const isDefaultDomain =
    host === 'santmat-satsang-prachar.web.app' ||
    host === 'santmat-satsang-prachar.firebaseapp.com';
  const isRoot = path === '/' || path === '' || path === '/index.html';

  if (isDefaultDomain && isRoot) {
    const s = search || (typeof window !== 'undefined' ? window.location.search : '');
    const h = hash || (typeof window !== 'undefined' ? window.location.hash : '');
    return `${ADMIN_PATH}/${s}${h}`;
  }
  return null;
}

export const SITE_CONFIG = {
  // Primary public business domain (single source of truth)
  siteUrl: PUBLIC_SITE_URL,

  // Firebase default hosting domains that redirect root to Admin
  firebaseDefaultDomains: FIREBASE_DEFAULT_DOMAINS,

  // Canonical admin URL on the SAME origin
  adminUrl: ADMIN_PUBLIC_URL,
  adminPath: ADMIN_PATH,

  // Firebase project id (backend/infrastructure only)
  firebaseProjectId: 'santmat-satsang-prachar',

  // Official Business Identity (Authoritative Source of Truth)
  legalEntityName: 'SANTMAT SATSANG PARCHAR',
  businessStructure: 'Sole Proprietorship',
  proprietorName: 'Pravin kumar',
  gstin: '10ITEPK2336G1Z2',
  udyamRegistrationNumber: 'UDYAM-BR-30-0067864',
  businessNature:
    'Digital Marketing & sound recording and music publishing activities in studio or elsewhere.',

  // Common aliases for backwards compatibility
  orgName: 'SANTMAT SATSANG PARCHAR',
  orgNameHindi: 'संतमत सत्संग प्रचार',
  orgTagline: 'Digital Content, Sound Recording & Music Publishing',
  taglineHindi: 'डिजिटल कंटेंट, साउंड रिकॉर्डिंग एवं म्यूजिक पब्लिशिंग',

  // Registered Office Address
  registeredAddress: {
    buildingNo: 'WORD NO 14',
    roadStreet: 'DHARAMPUR',
    landmark: 'Pack House',
    city: 'Dharampur',
    district: 'Samastipur',
    state: 'Bihar',
    pincode: '848216',
    country: 'India',
    full: 'WORD NO 14, DHARAMPUR, Near Pack House, Dharampur, Samastipur, Bihar 848216, India',
    compact: 'Dharampur, Samastipur, Bihar 848216, India',
  },

  // Official Contact Details
  officialEmail: 'helpsantmatbhajan@gmail.com',
  contactEmail: 'helpsantmatbhajan@gmail.com',
  officialPhone: '7050448278',
  officialPhoneFormatted: '+91 7050448278',

  // Business Activities (Services)
  businessActivities: [
    {
      id: 'digital-content',
      title: 'Digital Content Production',
      titleHindi: 'डिजिटल कंटेंट निर्माण',
      description:
        'Creation and preparation of digital media content for online publication and distribution.',
      shortDesc:
        'High-quality digital audio, text, and media content creation for modern platforms.',
    },
    {
      id: 'digital-marketing',
      title: 'Digital Marketing',
      titleHindi: 'डिजिटल मार्केटिंग',
      description:
        'Digital content and marketing-oriented media activities.',
      shortDesc:
        'Strategic digital media promotion and audience reach across digital channels.',
    },
    {
      id: 'sound-recording',
      title: 'Sound Recording',
      titleHindi: 'साउंड रिकॉर्डिंग',
      description:
        'Audio recording and production activities conducted in studio or other appropriate environments.',
      shortDesc:
        'Professional studio-grade audio capture, voice recording, and acoustic mastering.',
    },
    {
      id: 'music-publishing',
      title: 'Music Publishing',
      titleHindi: 'म्यूजिक पब्लिशिंग',
      description:
        'Publishing and distributing original recorded music and audio content.',
      shortDesc:
        'Catalog management, copyright management, and digital publication of recorded audio.',
    },
    {
      id: 'digital-media-publishing',
      title: 'Digital Media Publishing',
      titleHindi: 'डिजिटल मीडिया पब्लिशिंग',
      description:
        'Preparing and publishing digital audio and related media content.',
      shortDesc:
        'End-to-end publishing workflows for web, streaming, and mobile applications.',
    },
    {
      id: 'audio-distribution',
      title: 'Audio Content Distribution',
      titleHindi: 'ऑडियो कंटेंट वितरण',
      description:
        'Digital distribution of published audio content through supported platforms and applications.',
      shortDesc:
        'Seamless distribution infrastructure powering apps and digital listening channels.',
    },
  ],

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
    features: [
      'Recorded devotional audio catalog',
      'Category-wise audio content organization',
      'High-quality audio streaming',
      'Background playback with lock-screen controls',
      'Sleep timer functionality',
      'Comprehensive search capabilities',
      'Favorites and personalized playlists',
      'Notification alerts for new releases',
      'In-app audio player with rich seek controls',
    ],
  },

  // Canonical route paths
  routes: {
    home: '/',
    about: '/about',
    services: '/services',
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
