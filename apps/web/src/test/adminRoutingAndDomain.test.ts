import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_CONFIG, ADMIN_PATH, ADMIN_LOGIN_PATH, isAdminPath, getAdminUrl } from '../config/siteConfig';

describe('Admin Dashboard: Same-Origin /admin Architecture', () => {
  it('places every admin entry point under /admin on the public origin', () => {
    expect(ADMIN_PATH).toBe('/admin');
    expect(ADMIN_LOGIN_PATH).toBe('/admin/login');
    expect(SITE_CONFIG.adminUrl).toBe('https://santmatsatsangparchar.in/admin');
    expect(SITE_CONFIG.routes.adminLogin).toBe('/admin/login');
    expect(SITE_CONFIG.routes.adminDashboard).toBe('/admin/dashboard');
  });

  it('detects admin paths via isAdminPath', () => {
    expect(isAdminPath('/admin')).toBe(true);
    expect(isAdminPath('/admin/login')).toBe(true);
    expect(isAdminPath('/admin/users')).toBe(true);
    expect(isAdminPath('/')).toBe(false);
    expect(isAdminPath('/adminish')).toBe(false);
  });

  it('builds canonical admin absolute URLs on the same origin', () => {
    expect(getAdminUrl('/login')).toBe('https://santmatsatsangparchar.in/admin/login');
    expect(getAdminUrl('/dashboard')).toBe('https://santmatsatsangparchar.in/admin/dashboard');
    expect(getAdminUrl('/admin/users')).toBe('https://santmatsatsangparchar.in/admin/users');
    expect(getAdminUrl()).toBe('https://santmatsatsangparchar.in/admin');
  });

  it('never points the admin application at a subdomain or Firebase domain', () => {
    expect(SITE_CONFIG.adminUrl).not.toContain('web.app');
    expect(SITE_CONFIG.adminUrl).not.toContain('firebaseapp.com');
    expect(SITE_CONFIG.adminUrl).not.toContain('admin.santmatsatsangparchar.in');
  });

  it('own index.html is a non-indexed admin shell referencing /admin assets in the source build', () => {
    const root = path.resolve(__dirname, '../..');
    const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    expect(indexHtml).toContain('noindex');
  });
});

describe('Admin Dashboard: Router Source Contract (apps/web/src/app/App.tsx)', () => {
  const appPath = path.resolve(__dirname, '../app/App.tsx');
  const appSource = fs.readFileSync(appPath, 'utf8');
  const guardPath = path.resolve(__dirname, '../app/guards/ProtectedRoute.tsx');
  const guardSource = fs.readFileSync(guardPath, 'utf8');

  it('declares the canonical /admin/login authentication route', () => {
    expect(appSource).toContain(`SITE_CONFIG.routes.adminLogin`);
    expect(appSource).toContain('element={<LoginRoute />}');
  });

  it('legacy /login is redirected to the canonical admin login', () => {
    expect(appSource).toMatch(/path="\/login"/);
    expect(appSource).toContain(`<Navigate to={SITE_CONFIG.routes.adminLogin} replace />`);
  });

  it('protected /admin/* shell gates every module route', () => {
    expect(appSource).toContain(`path={\`\${SITE_CONFIG.adminPath}/*\`}`);
    expect(appSource).toContain('<ProtectedRoute>');
    expect(appSource).toContain('<AdminLayout />');
  });

  it('declares every required admin module route as a relative child of /admin', () => {
    for (const mod of [
      'dashboard', 'users', 'playlists', 'notifications', 'banners', 'categories',
      'reports', 'settings', 'support', 'books', 'search', 'stuti-vinati',
      'add-bhajan', 'bhajan-list', 'media', 'devotees', 'stuti',
    ]) {
      expect(appSource).toContain(`path="${mod}"`);
    }
  });

  it('unknown absolute paths resolve to the secure admin entry', () => {
    expect(appSource).toContain('<Route path="*" element={<AdminRootRedirect />} />');
  });

  it('ProtectedRoute redirects to the canonical admin login when unauthenticated', () => {
    expect(guardSource).toContain('SITE_CONFIG.routes.adminLogin');
    expect(guardSource).toContain('state={{ from: location }}');
  });

  it('admin feature modules are lazy-loaded (no full admin bundle on login)', () => {
    expect(appSource).toContain('lazy(');
    expect(appSource).toContain('<Suspense');
  });

  it('admin source never hardcodes the retired subdomain or a Firebase admin URL', () => {
    const srcDir = path.resolve(__dirname, '..');
    const files = fs.readdirSync(srcDir, { recursive: true }).filter(
      (f): f is string => /\.(tsx|ts)$/.test(String(f)) && !String(f).includes('test')
    );
    for (const f of files) {
      const content = fs.readFileSync(path.join(srcDir, f), 'utf8');
      expect(content).not.toMatch(/https:\/\/admin\.santmatsatsangparchar\.in/);
      expect(content).not.toMatch(/https:\/\/santmat-satsang-prachar\.web\.app\/admin/);
    }
  });
});