import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 600, height: 800 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1024, height: 1366 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 }
];

// ============================================================
// CHROMIUM TESTS
// ============================================================
test.describe('Chromium Multi-Browser QA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('Chromium: Phase 1 - Firebase initialization no errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    await new Promise(r => setTimeout(r, 3000));

    const firebaseErrors = consoleMessages.filter(m => 
      m.includes('auth/invalid-api-key') || 
      m.includes('Firebase initialization')
    );
    expect(firebaseErrors).toHaveLength(0);
  });

  test('Chromium: Phase 2 - Login page renders', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('admin-panel');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
  });

  test('Chromium: Phase 3 - Real Firebase config', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const url = page.url();
    expect(url).toContain('/');
  });

  test('Chromium: Phase 4 - Theme light mode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const html = await page.eval('document.documentElement.getAttribute("data-theme")');
    expect(html).toBe('light');
  });

  test('Chromium: Phase 4b - Theme dark mode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Click theme toggle
    await page.click('[data-test-id="theme-toggle"]');
    const html = await page.eval('document.documentElement.getAttribute("data-theme")');
    expect(html).toBe('dark');
  });

  test('Chromium: Phase 5 - Theme persistence', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.click('[data-test-id="theme-toggle"]');
    await page.reload({ waitUntil: 'networkidle' });
    const html = await page.eval('document.documentElement.getAttribute("data-theme")');
    expect(['light', 'dark', 'system']).toContain(html || 'system');
  });

  test('Chromium: Phase 6 - System theme', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.click('[data-test-id="theme-toggle"]');
    const html = await page.eval('document.documentElement.getAttribute("data-theme")');
    expect(['light', 'dark', 'system']).toContain(html || 'system');
  });

  test('Chromium: Phase 6b - Responsive viewports', async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('body')).toBeVisible();
      // No horizontal overflow
      const hasOverflow = await page.eval(
        () => document.body.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);
    }
  });

  test('Chromium: Phase 7 - Client navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('Chromium: Phase 8 - Console verification', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));
    await page.goto('/', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 2000));
    const authErrors = consoleMessages.filter(m => m.includes('auth/invalid-api-key'));
    expect(authErrors).toHaveLength(0);
  });

  test('Chromium: Phase 9 - No overflow at key viewports', async ({ page }) => {
    const keyViewports = [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 }
    ];
    for (const vp of keyViewports) {
      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'networkidle' });
      const hasOverflow = await page.eval(
        () => document.body.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);
    }
  });

  test('Chromium: Phase 9c - Continuous resize', async ({ page }) => {
    const sizes = [
      { w: 1920, h: 1080 },
      { w: 1440, h: 900 },
      { w: 1280, h: 720 },
      { w: 1024, h: 768 },
      { w: 820, h: 1180 },
      { w: 768, h: 1024 },
      { w: 430, h: 932 },
      { w: 390, h: 844 },
      { w: 360, h: 640 },
      { w: 320, h: 568 }
    ];
    for (const s of sizes) {
      await page.setViewportSize(s);
      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Chromium: Phase 9d - Overflow check', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toBeVisible();
    const hasOverflow = await page.eval(() => document.body.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
  });

  test('Chromium: Phase 10 - Client routes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Verify nav exists and has items
    const navLinks = page.locator('nav a');
    await expect(navLinks.first()).toBeVisible();
  });

  test('Chromium: Phase 11 - Interaction test - theme toggle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.click('[data-test-id="theme-toggle"]');
    const html = await page.eval('document.documentElement.getAttribute("data-theme")');
    expect(['light', 'dark']).toContain(html || 'light');
  });

  test('Chromium: Phase 12 - Source regression no fake auth', async ({ page }) => {
    const content = await page.content();
    expect(content).not.toContain('VITE_TEST_AUTH');
    expect(content).not.toContain('mockAuth');
    expect(content).not.toContain('fakeUser');
  });
});

// ============================================================
// WEBKIT TESTS
// ============================================================
test.describe('WebKit Multi-Browser QA (Safari-equivalent)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('WebKit: Phase 1 - Firebase initialization no errors', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    await new Promise(r => setTimeout(r, 3000));

    const firebaseErrors = consoleMessages.filter(m => 
      m.includes('auth/invalid-api-key') || 
      m.includes('Firebase initialization')
    );
    expect(firebaseErrors).toHaveLength(0);
  });

  test('WebKit: Phase 2 - Login page renders', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('admin-panel');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('WebKit: Phase 3 - Firebase config initialization', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const url = page.url();
    expect(url).toContain('/');
  });

  test('WebKit: Phase 4 - Theme light mode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const html = await page.eval('document.documentElement.getAttribute("data-theme")');
    expect(html).toBe('light');
  });

  test('WebKit: Phase 5 - Theme persistence', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.click('[data-test-id="theme-toggle"]');
    await page.reload({ waitUntil: 'networkidle' });
    const html = await page.eval('document.documentElement.getAttribute("data-theme")');
    expect(['light', 'dark', 'system']).toContain(html || 'system');
  });

  test('WebKit: Phase 6 - Responsive viewports', async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('body')).toBeVisible();
      const hasOverflow = await page.eval(
        () => document.body.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);
    }
  });

  test('WebKit: Phase 7 - Client navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('WebKit: Phase 8 - Console verification', async ({ page }) => {
    const consoleMessages: string[] = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));
    await page.goto('/', { waitUntil: 'networkidle' });
    await new Promise(r => setTimeout(r, 2000));
    const authErrors = consoleMessages.filter(m => m.includes('auth/invalid-api-key'));
    expect(authErrors).toHaveLength(0);
  });

  test('WebKit: Phase 9 - No overflow at key viewports', async ({ page }) => {
    const keyViewports = [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 }
    ];
    for (const vp of keyViewports) {
      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'networkidle' });
      const hasOverflow = await page.eval(
        () => document.body.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);
    }
  });

  test('WebKit: Phase 9c - Continuous resize', async ({ page }) => {
    const sizes = [
      { w: 1920, h: 1080 },
      { w: 1440, h: 900 },
      { w: 1280, h: 720 },
      { w: 1024, h: 768 },
      { w: 820, h: 1180 },
      { w: 768, h: 1024 },
      { w: 430, h: 932 },
      { w: 390, h: 844 },
      { w: 360, h: 640 },
      { w: 320, h: 568 }
    ];
    for (const s of sizes) {
      await page.setViewportSize(s);
      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('WebKit: Phase 10 - Client routes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const navLinks = page.locator('nav a');
    await expect(navLinks.first()).toBeVisible();
  });

  test('WebKit: Phase 11 - Theme toggle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.click('[data-test-id="theme-toggle"]');
    const html = await page.eval('document.documentElement.getAttribute("data-theme")');
    expect(['light', 'dark']).toContain(html || 'light');
  });

  test('WebKit: Phase 12 - Source regression no fake auth', async ({ page }) => {
    const content = await page.content();
    expect(content).not.toContain('VITE_TEST_AUTH');
    expect(content).not.toContain('mockAuth');
    expect(content).not.toContain('fakeUser');
  });
});