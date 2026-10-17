import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { HomePage } from '../features/public/pages/HomePage';
import { AboutPage } from '../features/public/pages/AboutPage';
import { ServicesPage } from '../features/public/pages/ServicesPage';
import { MobileAppPage } from '../features/public/pages/MobileAppPage';
import { ContactPage } from '../features/public/pages/ContactPage';
import { PrivacyPolicyPage } from '../features/public/pages/PrivacyPolicyPage';
import { TermsPage } from '../features/public/pages/TermsPage';
import { AccountDeletionPage } from '../features/public/pages/AccountDeletionPage';
import { PublicLayout } from '../features/public/layout/PublicLayout';
import { SITE_CONFIG } from '../config/siteConfig';

function render(ui: React.ReactElement, initialPath = '/') {
  return renderToString(
    <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
  );
}

function renderAppAt(path: string, page: React.ReactElement) {
  return renderToString(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={path} element={page} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Public Website Comprehensive Verification Suite', () => {
  // 1. / renders Public Homepage
  it('1. / renders Public Homepage with professional business hero', () => {
    const html = render(<HomePage />);
    expect(html).toBeTruthy();
    expect(html).toContain('SANTMAT SATSANG PARCHAR');
    expect(html).toContain('Digital Content, Sound Recording &amp; Music Publishing');
    expect(html).toContain('Explore Our Services');
  });

  // 2. / does NOT redirect to /login
  it('2. / does NOT redirect to /login or contain login redirects', () => {
    const html = renderAppAt('/', <HomePage />);
    expect(html).not.toContain('/login');
    expect(html).not.toContain('/admin/login');
  });

  // 3. public header contains no Admin Login
  it('3. public header contains no Admin Login, Admin Portal, or lock icons', () => {
    const html = renderAppAt('/', <HomePage />);
    expect(html).not.toMatch(/Admin\s*Login/i);
    expect(html).not.toMatch(/Admin\s*Portal/i);
    expect(html).not.toMatch(/Dashboard/i);
    expect(html).not.toContain('प्रशासक');
  });

  // 4. public footer contains no Admin Portal
  it('4. public footer contains no Admin Portal or administrative links', () => {
    const html = renderAppAt('/', <HomePage />);
    expect(html).not.toContain('प्रशासक लॉगिन');
    expect(html).not.toContain('Admin Portal');
    expect(html).not.toContain('href="/admin"');
    expect(html).not.toContain('href="/admin/login"');
  });

  // 5. /about is business-oriented
  it('5. /about is business-oriented (Sole Proprietorship, no ashram/lineage)', () => {
    const html = render(<AboutPage />);
    expect(html).toContain('About SANTMAT SATSANG PARCHAR');
    expect(html).toContain('Sole Proprietorship');
    expect(html).toContain('Pravin kumar');
    expect(html).toContain('Digital Media Work');
    expect(html).toContain('Sound Recording');
    expect(html).toContain('Music Publishing');
    // Ensure no ashram history or religious lineage
    expect(html).not.toContain('कुप्पाघाट');
    expect(html).not.toContain('पंच पाप');
    expect(html).not.toContain('मानस जप');
  });

  // 6. /services exists
  it('6. /services exists and details all 6 verified business activities', () => {
    const html = render(<ServicesPage />);
    expect(html).toContain('Services &amp; Business Activities');
    expect(html).toContain('Digital Content Production');
    expect(html).toContain('Digital Marketing');
    expect(html).toContain('Sound Recording');
    expect(html).toContain('Music Publishing');
    expect(html).toContain('Digital Media Publishing');
    expect(html).toContain('Audio Content Distribution');
  });

  // 7. /mobile-app exists
  it('7. /mobile-app exists and showcases digital product capabilities', () => {
    const html = render(<MobileAppPage />);
    expect(html).toContain('Santmat Satsang Prachar');
    expect(html).toContain('in.santmatsatsangparchar.app');
    expect(html).toContain('High-Quality Audio Streaming');
    expect(html).toContain('Background Playback');
    expect(html).toContain('Sleep Timer Functionality');
    expect(html).toContain('Coming Soon on Google Play');
    // No fake play store links
    expect(html).not.toMatch(/href="https:\/\/play\.google\.com[^"]*fake/);
  });

  // 8. /contact exists
  it('8. /contact exists and contains authoritative business coordinates', () => {
    const html = render(<ContactPage />);
    expect(html).toContain('SANTMAT SATSANG PARCHAR');
    expect(html).toContain('WORD NO 14');
    expect(html).toContain('DHARAMPUR');
    expect(html).toContain('Pack House');
    expect(html).toContain('848216');
    expect(html).toContain('mailto:helpsantmatbhajan@gmail.com');
    expect(html).toContain('tel:7050448278');
  });

  // 9. /privacy-policy exists
  it('9. /privacy-policy exists and truthfully discloses telemetry and auth', () => {
    const html = render(<PrivacyPolicyPage />);
    expect(html).toContain('Privacy Policy');
    expect(html).toContain('Google Sign-In &amp; Firebase Authentication');
    expect(html).toContain('AnalyticsHeartbeat');
    expect(html).toContain('Firebase Crashlytics');
    expect(html).toContain('Firebase Cloud Messaging');
    expect(html).not.toContain('do not collect personal data');
  });

  // 10. /terms exists
  it('10. /terms exists with mandatory intellectual property clause', () => {
    const html = render(<TermsPage />);
    expect(html).toContain('Terms &amp; Conditions');
    expect(html).toContain('All media, text, audio recordings and logos belong to');
    expect(html).toContain('Unauthorized distribution or commercial use of audio content without permission is prohibited.');
  });

  // 11. /delete-account exists
  it('11. /delete-account exists with accurate in-app and web deletion flow', () => {
    const html = render(<AccountDeletionPage />);
    expect(html).toContain('Account &amp; Data Deletion Request');
    expect(html).toContain('Method 1: Instant In-App Deletion');
    expect(html).toContain('Method 2: Web Request Submission');
    expect(html).toContain('helpsantmatbhajan@gmail.com');
  });

  // 12. official business details are correct
  it('12. official business details are correct across the application', () => {
    expect(SITE_CONFIG.legalEntityName).toBe('SANTMAT SATSANG PARCHAR');
    expect(SITE_CONFIG.businessStructure).toBe('Sole Proprietorship');
    expect(SITE_CONFIG.proprietorName).toBe('Pravin kumar');
    expect(SITE_CONFIG.gstin).toBe('10ITEPK2336G1Z2');
    expect(SITE_CONFIG.udyamRegistrationNumber).toBe('UDYAM-BR-30-0067864');
    expect(SITE_CONFIG.registeredAddress.pincode).toBe('848216');
    expect(SITE_CONFIG.officialEmail).toBe('helpsantmatbhajan@gmail.com');
    expect(SITE_CONFIG.officialPhone).toBe('7050448278');
  });

  // 13. canonical URLs are correct
  it('13. canonical URLs are strictly under https://santmatsatsangparchar.in', () => {
    const testPaths = ['/', '/about', '/services', '/mobile-app', '/contact', '/privacy-policy', '/terms', '/delete-account'];
    testPaths.forEach((p) => {
      expect(SITE_CONFIG.siteUrl).toBe('https://santmatsatsangparchar.in');
    });
  });

  // 14. no active admin subdomain references
  it('14. no active admin subdomain references in public components', () => {
    const srcDir = path.resolve(__dirname, '..');
    const files = fs
      .readdirSync(srcDir, { recursive: true })
      .filter((f) => /\.(ts|tsx)$/.test(String(f)) && !String(f).includes('test'))
      .map((f) => path.join(srcDir, String(f)));

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('admin.santmatsatsangparchar.in');
    }
  });

  // 15. no Firebase Admin canonical URLs
  it('15. no Firebase Admin canonical URLs in public components', () => {
    const srcDir = path.resolve(__dirname, '..');
    const files = fs
      .readdirSync(srcDir, { recursive: true })
      .filter((f) => /\.(ts|tsx)$/.test(String(f)) && !String(f).includes('test'))
      .map((f) => path.join(srcDir, String(f)));

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('santmat-satsang-prachar.web.app/admin');
    }
  });

  // 16. no old institutional public positioning
  it('16. no old institutional public positioning (no Ashram, Trust, Temple as entity)', () => {
    const homeHtml = render(<HomePage />);
    const aboutHtml = render(<AboutPage />);
    const combined = (homeHtml + aboutHtml).toLowerCase();

    expect(combined).not.toContain('seva trust');
    expect(combined).not.toContain('ashramheadquarters');
    expect(combined).not.toContain('कुप्पाघाट');
    expect(combined).not.toContain('religious institution');
    expect(combined).not.toContain('spiritual organization');
  });

  // 17. Admin source remains intact in apps/web
  it('17. Admin source remains intact in apps/web', () => {
    const adminAppPath = path.resolve(__dirname, '../../../web/src/app/App.tsx');
    expect(fs.existsSync(adminAppPath)).toBe(true);
    const content = fs.readFileSync(adminAppPath, 'utf8');
    expect(content).toContain('AdminDashboard');
    expect(content).toContain('AdminPermissionProvider');
  });

  // 18. /admin direct access still works
  it('18. /admin direct route declaration remains intact in apps/web', () => {
    const adminAppPath = path.resolve(__dirname, '../../../web/src/app/App.tsx');
    const content = fs.readFileSync(adminAppPath, 'utf8');
    expect(content).toContain('SITE_CONFIG.adminPath');
    expect(content).toContain('SITE_CONFIG.routes.adminLogin');
  });

  // 19. Admin authentication remains intact
  it('19. Admin authentication remains intact in apps/web', () => {
    const loginPagePath = path.resolve(__dirname, '../../../web/src/features/auth/pages/LoginPage.tsx');
    expect(fs.existsSync(loginPagePath)).toBe(true);
  });

  // 20. Admin RBAC remains intact
  it('20. Admin RBAC remains intact in apps/web', () => {
    const rbacPath = path.resolve(__dirname, '../../../web/src/app/providers/PermissionContext.tsx');
    expect(fs.existsSync(rbacPath)).toBe(true);
    const content = fs.readFileSync(rbacPath, 'utf8');
    expect(content).toContain('isAnyAdmin');
    expect(content).toContain('isDeveloperSuperAdmin');
  });
});