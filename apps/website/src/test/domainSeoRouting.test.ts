import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { SITE_CONFIG, getCanonicalUrl, getAdminUrl, isAdminPath, ADMIN_PATH, ADMIN_PUBLIC_URL } from '../config/siteConfig';

describe('Official Organization Domain & SEO Architecture Tests', () => {
  describe('SITE_CONFIG Single Source of Truth', () => {
    it('enforces the exact primary organization domain', () => {
      expect(SITE_CONFIG.siteUrl).toBe('https://santmatsatsangparchar.in');
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

    it('specifies the correct official organization identity', () => {
      expect(SITE_CONFIG.orgName).toBe('SANTMAT SATSANG PARCHAR');
      expect(SITE_CONFIG.orgNameHindi).toBe('संतमत सत्संग प्रचार');
      expect(SITE_CONFIG.contactEmail).toBe('santmatsatsangprachar@gmail.com');
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
      expect(getCanonicalUrl('/mobile-app')).toBe('https://santmatsatsangparchar.in/mobile-app');
      expect(getCanonicalUrl('/contact')).toBe('https://santmatsatsangparchar.in/contact');
      expect(getCanonicalUrl('/privacy-policy')).toBe('https://santmatsatsangparchar.in/privacy-policy');
      expect(getCanonicalUrl('/terms')).toBe('https://santmatsatsangparchar.in/terms');
      expect(getCanonicalUrl('/delete-account')).toBe('https://santmatsatsangparchar.in/delete-account');
    });

    it('never contains the admin web.app domain or subdomain in canonical URLs', () => {
      const publicRoutes = ['/', '/about', '/mobile-app', '/contact', '/privacy-policy', '/terms', '/delete-account'];
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
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/mobile-app</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/contact</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/privacy-policy</loc>');
      expect(content).toContain('<loc>https://santmatsatsangparchar.in/terms</loc>');

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
      expect(content).not.toContain('santmat-satsang-prachar.web.app');
      expect(content).not.toContain('admin.santmatsatsangparchar.in');
    });

    it('verifies index.html has canonical tag, Open Graph, and JSON-LD schema', () => {
      const indexPath = path.join(rootDir, 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);
      const content = fs.readFileSync(indexPath, 'utf8');

      expect(content).toContain('<link rel="canonical" href="https://santmatsatsangparchar.in/" />');
      expect(content).toContain('<meta property="og:url" content="https://santmatsatsangparchar.in/" />');
      expect(content).toContain('"@type": "Organization"');
      expect(content).toContain('"url": "https://santmatsatsangparchar.in/"');
      expect(content).toContain('SANTMAT SATSANG PARCHAR');
    });
  });

  describe('Use of centralized admin path (no full admin URLs in components)', () => {
    const srcDir = path.resolve(__dirname, '..');

    it('rejects hardcoded full admin URLs in website components except the shared config', () => {
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
});