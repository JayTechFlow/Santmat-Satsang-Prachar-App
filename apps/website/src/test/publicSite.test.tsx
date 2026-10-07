import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../features/public/pages/HomePage';
import { AboutPage } from '../features/public/pages/AboutPage';
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

// Renders a public page through its Routes/PublicLayout (Outlet) parentage,
// matching the real App.tsx structure.
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

describe('Public Website Pages (renderToString)', () => {
  const pages: Array<[string, React.ReactElement, RegExp]> = [
    ['/', <HomePage />, /SANTMAT SATSANG PARCHAR|संतमत सत्संग प्रचार/],
    ['/about', <AboutPage />, /संस्था|संतमत|Satsang/i],
    ['/mobile-app', <MobileAppPage />, /मोबाइल|App/i],
    ['/contact', <ContactPage />, /संपर्क|Contact/i],
    ['/privacy-policy', <PrivacyPolicyPage />, /Privacy|गोपनीयता/i],
    ['/terms', <TermsPage />, /Terms|नियम/i],
    ['/delete-account', <AccountDeletionPage />, /Delete|Account|डिलीट/i],
  ];

  it.each(pages)('renders %s without crashing', (_route, element, expected) => {
    const html = render(element);
    expect(html).toBeTruthy();
    expect(html).toMatch(expected);
  });
});

describe('Public Layout Corporate Contract', () => {
  it('renders the full public layout around a child page', () => {
    const html = renderAppAt('/', <HomePage />);
    expect(html).toContain('Official Organization Website');
    expect(html).toContain('संतमत सत्संग प्रचार');
    expect(html).toContain('मुख्यालय');
  });

  it('links the footer Admin Portal to the canonical /admin/login on the same origin', () => {
    const html = renderAppAt('/', <HomePage />);
    expect(html).toContain(`href="${SITE_CONFIG.routes.adminLogin}"`);
    expect(html).toContain('Admin Portal');
  });

  it('never uses the legacy /login admin route in the public layout', () => {
    const html = renderAppAt('/', <HomePage />);
    expect(html).not.toContain('href="/login"');
  });

  it('never references the retired admin subdomain or firebase web.app admin URLs', () => {
    const html = renderAppAt('/', <HomePage />);
    expect(html).not.toContain('admin.santmatsatsangparchar.in');
    expect(html).not.toContain('santmat-satsang-prachar.web.app');
  });
});

describe('Home Page Admin Login CTA', () => {
  it('renders an ADMIN LOGIN call-to-action pointing to /admin/login', () => {
    const html = render(<HomePage />);
    expect(html).toContain('ADMIN LOGIN');
    expect(html).toContain(`href="${SITE_CONFIG.routes.adminLogin}"`);
  });

  it('keeps the mobile-app CTA anchored to the official route', () => {
    const html = render(<HomePage />);
    expect(html).toContain(`href="/mobile-app"`);
  });
});