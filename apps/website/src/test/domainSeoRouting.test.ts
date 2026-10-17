import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  SITE_CONFIG,
  getCanonicalUrl,
  getAdminUrl,
  isAdminPath,
  ADMIN_PATH,
  ADMIN_PUBLIC_URL,
  FIREBASE_DEFAULT_DOMAINS,
  isFirebaseDefaultDomain,
  getFirebaseRootAdminRedirect,
} from '../config/siteConfig';

describe('Official Business Domain, Identity & SEO Architecture Tests', () => {
  describe('SITE_CONFIG Single Source of Truth — Authoritative Business Details', () => {
    it('enforces the exact primary business domain', () => {
      expect(SITE_CONFIG.siteUrl).toBe('https://santmatsatsangparchar.in');
    });

    it('asserts the authoritative Sole Proprietorship legal identity', () => {
      expect(SITE_CONFIG.legalEntityName).toBe('SANTMAT SATSANG PARCHAR');
      expect(SITE_CONFIG.businessStructure).toBe('Sole Proprietorship');
      expect(SITE_CONFIG.proprietorName).toBe('Pravin kumar');
      expect(SITE_CONFIG.gstin).toBe('10ITEPK2336G1Z2');
      expect(SITE_CONFIG.udyamRegistrationNumber).toBe('UDYAM-BR-30-0067864');
    });

    it('asserts official contact and registered office address details', () => {
      expect(SITE_CONFIG.officialEmail).toBe('helpsantmatbhajan@gmail.com');
      expect(SITE_CONFIG.contactEmail).toBe('helpsantmatbhajan@gmail.com');
      expect(SITE_CONFIG.officialPhone).toBe('7050448278');
      expect(SITE_CONFIG.registeredAddress.buildingNo).toBe('WORD NO 14');
      expect(SITE_CONFIG.registeredAddress.roadStreet).toBe('DHARAMPUR');
      expect(SITE_CONFIG.registeredAddress.landmark).toBe('Pack House');
      expect(SITE_CONFIG.registeredAddress.city).toBe('Dharampur');
      expect(SITE_CONFIG.registeredAddress.district).toBe('Samastipur');
      expect(SITE_CONFIG.registeredAddress.state).toBe('Bihar');
      expect(SITE_CONFIG.registeredAddress.pincode).toBe('848216');
      expect(SITE_CONFIG.registeredAddress.country).toBe('India');
    });

    it('never contains old institutional, trust, or ashram claims in business identity', () => {
      const configStr = JSON.stringify(SITE_CONFIG).toLowerCase();
      expect(configStr).not.toContain('seva trust');
      expect(configStr).not.toContain('कुप्पाघाट');
      expect(configStr).not.toContain('ashramheadquarters');
    });

    it('contains all 6 verified business activities', () => {
      expect(SITE_CONFIG.businessActivities).toHaveLength(6);
      const activityIds = SITE_CONFIG.businessActivities.map((a) => a.id);
      expect(activityIds).toContain('digital-content');
      expect(activityIds).toContain('digital-marketing');
      expect(activityIds).toContain('sound-recording');
      expect(activityIds).toContain('music-publishing');
      expect(activityIds).toContain('digital-media-publishing');
      expect(activityIds).toContain('audio-distribution');
    });

    it('places the admin dashboard on the SAME public origin under /admin', () => {
      expect(ADMIN_PATH).toBe('/admin');
      expect(ADMIN_PUBLIC_URL).toBe('https://santmatsatsangparchar.in/admin');
      expect(SITE_CONFIG.adminUrl).toBe('https://santmatsatsangparchar.in/admin');
      expect(SITE_CONFIG.adminPath).toBe('/admin');
      expect(SITE_CONFIG.firebaseProjectId).toBe('santmat-satsang-prachar');
    });

    it('never exposes a firebase web.app URL as the canonical admin URL', () => {
      expect(ADMIN_PUBLIC_URL).not.toContain('web.app');
      expect(ADMIN_PUBLIC_URL).not.toContain('firebaseapp.com');
      expect(ADMIN_PUBLIC_URL).not.toContain('admin.santmatsatsangparchar.in');
    });

    it('defines canonical admin login and dashboard paths', () => {
      expect(SITE_CONFIG.routes.adminLogin).toBe('/admin/login');
      expect(SITE_CONFIG.routes.adminDashboard).toBe('/admin/dashboard');
      expect(SITE_CONFIG.routes.admin).toBe('/admin');
    });

    it('defines all canonical public routes including services', () => {
      expect(SITE_CONFIG.routes.home).toBe('/');
      expect(SITE_CONFIG.routes.about).toBe('/about');
      expect(SITE_CONFIG.routes.services).toBe('/services');
      expect(SITE_CONFIG.routes.mobileApp).toBe('/mobile-app');
      expect(SITE_CONFIG.routes.contact).toBe('/contact');
      expect(SITE_CONFIG.routes.privacyPolicy).toBe('/privacy-policy');
      expect(SITE_CONFIG.routes.terms).toBe('/terms');
      expect(SITE_CONFIG.routes.deleteAccount).toBe('/delete-account');
    });

    it('prohibits placeholder or fake Play Store URLs before official release', () => {
      expect(SITE_CONFIG.mobileApp.playStoreStatus).toBe('coming_soon');
      expect(SITE_CONFIG.mobileApp.playStoreUrl).toBeNull();
    });
  });

  describe('Canonical Admin URL helpers', () => {
    it('builds canonical admin URLs under the public origin', () => {
      expect(getAdminUrl('/login')).toBe('https://santmatsatsangparchar.in/admin/login');
      expect(getAdminUrl('/dashboard')).toBe('https://santmatsatsangparchar.in/admin/dashboard');
      expect(getAdminUrl('/users')).toBe('https://santmatsatsangparchar.in/admin/users');
      expect(getAdminUrl('/reports')).toBe('https://santmatsatsangparchar.in/admin/reports');
      expect(getAdminUrl('/media')).toBe('https://santmatsatsangparchar.in/admin/media');
      expect(getAdminUrl('/banners')).toBe('https://santmatsatsangparchar.in/admin/banners');
      expect(getAdminUrl('/admin/users')).toBe('https://santmatsatsangparchar.in/admin/users');
      expect(getAdminUrl()).toBe('https://santmatsatsangparchar.in/admin');
    });

    it('detects admin paths on public-origin URLs', () => {
      expect(isAdminPath('/admin')).toBe(true);
      expect(isAdminPath('/admin/')).toBe(true);
      expect(isAdminPath('/admin/login')).toBe(true);
      expect(isAdminPath('/admin/users')).toBe(true);
      expect(isAdminPath('/')).toBe(false);
      expect(isAdminPath('/about')).toBe(false);
      expect(isAdminPath('/services')).toBe(false);
    });
  });

  describe('Canonical URL Generator (getCanonicalUrl)', () => {
    it('generates canonical homepage URL with trailing slash', () => {
      expect(getCanonicalUrl('/')).toBe('https://santmatsatsangparchar.in/');
      expect(getCanonicalUrl('')).toBe('https://santmatsatsangparchar.in/');
    });

    it('generates canonical subpage URLs without mixed domains or trailing slash', () => {
      expect(getCanonicalUrl('/about')).toBe('https://santmatsatsangparchar.in/about');
      expect(getCanonicalUrl('about')).toBe('https://santmatsatsangparchar.in/about');
      expect(getCanonicalUrl('/about/')).toBe('https://santmatsatsangparchar.in/about');
      expect(getCanonicalUrl('/services')).toBe('https://santmatsatsangparchar.in/services');
      expect(getCanonicalUrl('/mobile-app')).toBe('https://santmatsatsangparchar.in/mobile-app');
      expect(getCanonicalUrl('/contact')).toBe('https://santmatsatsangparchar.in/contact');
      expect(getCanonicalUrl('/privacy-policy')).toBe('https://santmatsatsangparchar.in/privacy-policy');
      expect(getCanonicalUrl('/terms')).toBe('https://santmatsatsangparchar.in/terms');
      expect(getCanonicalUrl('/delete-account')).toBe('https://santmatsatsangparchar.in/delete-account');
    });

    it('never contains the admin web.app domain or subdomain in canonical URLs', () => {
      const publicRoutes = [
        '/',
        '/about',
        '/services',
        '/mobile-app',
        '/contact',
        '/privacy-policy',
        '/terms',
        '/delete-account',
      ];
      publicRoutes.forEach((route) => {
        const canonical = getCanonicalUrl(route);
        expect(canonical).toContain('https://santmatsatsangparchar.in');
        expect(canonical).not.toContain('web.app');
        expect(canonical).not.toContain('firebaseapp.com');
        expect(canonical).not.toContain('admin.santmatsatsangparchar.in');
      });
    });
  });

  describe('Static SEO & Infrastructure Verification', () => {
    const publicDir = path.resolve(__dirname, '../../public');
    const rootDir = path.resolve(__dirname, '../..');

    it('verifies robots.txt contains sitemap and disallows admin routes', () => {
      const robotsPath = path.join(publicDir, 'robots.txt');
      expect(fs.existsSync(robotsPath)).toBe(true);
      const content = fs.readFileSync(robotsPath, 'utf8');

      expect(content).toContain('Sitemap: https://santmatsatsangparchar.in/sitemap.xml');
      expect(content).toContain('Allow: /services');
      expect(content).toContain('Disallow: /admin');
      expect(content).toContain('Disallow: /admin/');
      expect(content).toContain('Disallow: /login');
    });

    it('verifies sitemap.xml specifies all canonical routes under the official domain', () => {
      const sitemapPath = path.join(publicDir, 'sitemap.xml');
      expect(fs.existsSync(sitemapPath)).toBe(true);
      const content = fs.readFileSync(sitemapPath, 'utf8');

      expect(content).toContain('<loc>https://santmatsatsangparchar.in/</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/about</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/services</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/mobile-app</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/contact</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/privacy-policy</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/terms</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/delete-account</loc>');

      // No mixed web.app domain or admin subdomain inside sitemap
      expect(content).not.toContain('web.app');
      expect(content).not.toContain('firebaseapp.com');
      expect(content).not.toContain('/admin');
    });

    it('verifies static privacy-policy.html canonical link and domain reference', () => {
      const privacyPath = path.join(publicDir, 'privacy-policy.html');
      expect(fs.existsSync(privacyPath)).toBe(true);
      const content = fs.readFileSync(privacyPath, 'utf8');

      expect(content).toContain('<link rel="canonical" href="https://santmatsatsangparchar.in/privacy-policy">');
      expect(content).toContain('https://santmatsatsangparchar.in');
      expect(content).toContain('Sole Proprietorship');
      expect(content).toContain('helpsantmatbhajan@gmail.com');
      expect(content).not.toContain('santmat-satsang-prachar.web.app');
      expect(content).not.toContain('admin.santmatsatsangparchar.in');
    });

    it('verifies static delete-account.html canonical link and domain reference', () => {
      const deletePath = path.join(publicDir, 'delete-account.html');
      expect(fs.existsSync(deletePath)).toBe(true);
      const content = fs.readFileSync(deletePath, 'utf8');

      expect(content).toContain('<link rel="canonical" href="https://santmatsatsangparchar.in/delete-account">');
      expect(content).toContain('https://santmatsatsangparchar.in');
      expect(content).toContain('Sole Proprietorship');
      expect(content).toContain('helpsantmatbhajan@gmail.com');
    });

    it('verifies index.html has canonical tag, Open Graph, and JSON-LD schema', () => {
      const indexPath = path.join(rootDir, 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);
      const content = fs.readFileSync(indexPath, 'utf8');

      expect(content).toContain('<link rel="canonical" href="https://santmatsatsangparchar.in/" />');
      expect(content).toContain('<meta property="og:url" content="https://santmatsatsangparchar.in/" />');
      expect(content).toContain('"@type": "LocalBusiness"');
      expect(content).toContain('"url": "https://santmatsatsangparchar.in/"');
      expect(content).toContain('SANTMAT SATSANG PARCHAR');
      expect(content).toContain('helpsantmatbhajan@gmail.com');
    });
  });

  describe('Zero Exposure of Admin URLs in Public Source', () => {
    const srcDir = path.resolve(__dirname, '..');

    it('rejects hardcoded full admin URLs in website components except shared config', () => {
      const files = fs
        .readdirSync(srcDir, { recursive: true })
        .filter((f) => /\.(ts|tsx)$/.test(String(f)) && !String(f).includes('test'))
        .map((f) => path.join(srcDir, String(f)));

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        expect(content).not.toMatch(/https:\/\/admin\.santmatsatsangparchar\.in/);
        expect(content).not.toMatch(/https:\/\/santmat-satsang-prachar\.web\.app\/admin/);
      }
    });
  });

  describe('Firebase Default-Domain Root Redirect to Admin Architecture', () => {
    const websiteHtmlPath = path.resolve(__dirname, '../../index.html');
    const adminHtmlPath = path.resolve(__dirname, '../../../web/index.html');

    it('defines exact Firebase default hosting domains in siteConfig', () => {
      expect(FIREBASE_DEFAULT_DOMAINS).toEqual([
        'santmat-satsang-prachar.web.app',
        'santmat-satsang-prachar.firebaseapp.com',
      ]);
      expect(SITE_CONFIG.firebaseDefaultDomains).toEqual(FIREBASE_DEFAULT_DOMAINS);
    });

    it('correctly identifies Firebase default domains (case-insensitive)', () => {
      expect(isFirebaseDefaultDomain('santmat-satsang-prachar.web.app')).toBe(true);
      expect(isFirebaseDefaultDomain('SANTMAT-SATSANG-PRACHAR.WEB.APP')).toBe(true);
      expect(isFirebaseDefaultDomain('santmat-satsang-prachar.firebaseapp.com')).toBe(true);
      expect(isFirebaseDefaultDomain('SANTMAT-SATSANG-PRACHAR.FIREBASEAPP.COM')).toBe(true);

      // Other domains must NOT match
      expect(isFirebaseDefaultDomain('santmatsatsangparchar.in')).toBe(false);
      expect(isFirebaseDefaultDomain('admin.santmatsatsangparchar.in')).toBe(false);
      expect(isFirebaseDefaultDomain('localhost')).toBe(false);
      expect(isFirebaseDefaultDomain('example.com')).toBe(false);
    });

    it('redirects root URL on Firebase default domains to /admin/', () => {
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/')).toBe('/admin/');
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '')).toBe('/admin/');
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/index.html')).toBe('/admin/');

      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.firebaseapp.com', '/')).toBe('/admin/');
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.firebaseapp.com', '')).toBe('/admin/');
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.firebaseapp.com', '/index.html')).toBe('/admin/');
    });

    it('preserves query parameters and URL fragments during redirect', () => {
      expect(
        getFirebaseRootAdminRedirect(
          'santmat-satsang-prachar.web.app',
          '/',
          '?tab=settings&view=active',
          '#section'
        )
      ).toBe('/admin/?tab=settings&view=active#section');

      expect(
        getFirebaseRootAdminRedirect(
          'santmat-satsang-prachar.firebaseapp.com',
          '',
          '?authMode=google',
          '#token'
        )
      ).toBe('/admin/?authMode=google#token');
    });

    it('strictly preserves the Public Business Website root on the custom domain', () => {
      expect(getFirebaseRootAdminRedirect('santmatsatsangparchar.in', '/')).toBeNull();
      expect(getFirebaseRootAdminRedirect('santmatsatsangparchar.in', '')).toBeNull();
      expect(getFirebaseRootAdminRedirect('santmatsatsangparchar.in', '/index.html')).toBeNull();
      expect(getFirebaseRootAdminRedirect('www.santmatsatsangparchar.in', '/')).toBeNull();
    });

    it('does NOT redirect non-root application routes or auth callback URLs', () => {
      // Public pages
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/about')).toBeNull();
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/services')).toBeNull();
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/contact')).toBeNull();
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/mobile-app')).toBeNull();

      // Firebase auth handler URLs
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.firebaseapp.com', '/__/auth/handler')).toBeNull();
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.firebaseapp.com', '/__/auth/experiments')).toBeNull();
    });

    it('is loop-safe: does NOT redirect /admin or /admin/* paths', () => {
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/admin')).toBeNull();
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/admin/')).toBeNull();
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/admin/dashboard')).toBeNull();
      expect(getFirebaseRootAdminRedirect('santmat-satsang-prachar.web.app', '/admin/login')).toBeNull();
    });

    it('verifies apps/website/index.html includes host-specific root redirect in head', () => {
      expect(fs.existsSync(websiteHtmlPath)).toBe(true);
      const content = fs.readFileSync(websiteHtmlPath, 'utf8');

      expect(content).toContain('santmat-satsang-prachar.web.app');
      expect(content).toContain('santmat-satsang-prachar.firebaseapp.com');
      expect(content).toContain('/admin/');
      expect(content).toContain('window.location.replace');
      expect(content).toContain('window.location.search');
      expect(content).toContain('window.location.hash');
    });

    it('verifies apps/web/index.html does NOT contain root redirect (loop-safety)', () => {
      expect(fs.existsSync(adminHtmlPath)).toBe(true);
      const content = fs.readFileSync(adminHtmlPath, 'utf8');

      expect(content).not.toContain('santmat-satsang-prachar.web.app');
      expect(content).not.toContain('window.location.replace');
    });
  });
});