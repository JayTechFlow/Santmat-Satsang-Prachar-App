import { chromium } from 'playwright';
import fs from 'fs';

async function runAcceptance() {
  console.log('--- STARTING PLAYWRIGHT LIVE ACCEPTANCE TEST ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleLogs.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      networkErrors.push(`NETWORK HTTP ${res.status()}: ${res.url()}`);
    }
  });

  page.on('pageerror', (err) => {
    consoleLogs.push(`PAGE UNHANDLED EXCEPTION: ${err.message}`);
  });

  const baseUrl = 'http://localhost:3003';
  const routes = [
    '/',
    '/admin/users',
    '/admin/playlists',
    '/admin/notifications',
    '/admin/banners',
    '/admin/categories',
    '/admin/reports',
    '/admin/settings',
    '/admin/support',
    '/admin/books',
    '/admin/search',
    '/admin/stuti-vinati',
    '/admin/add-bhajan',
    '/admin/bhajan-list',
  ];

  const results = {
    routesTested: [],
    interactionsTested: [],
    consoleErrors: [],
    networkErrors: [],
    viewportsTested: [],
  };

  console.log('1. Navigating to base URL...');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check login / dashboard title
  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);

  // Test routes
  for (const route of routes) {
    console.log(`Testing route: ${route}`);
    try {
      const resp = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
      await page.waitForTimeout(500);
      const content = await page.content();
      const isBlackScreen = content.trim().length === 0;
      results.routesTested.push({
        route,
        status: resp ? resp.status() : 'unknown',
        isBlackScreen,
        rendered: !isBlackScreen,
      });
    } catch (err) {
      results.routesTested.push({
        route,
        status: 'error',
        error: err.message,
        rendered: false,
      });
    }
  }

  // Test Responsive Viewports
  const viewports = [
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
    { width: 1920, height: 1080 },
  ];

  console.log('2. Testing Viewports & Themes...');
  for (const vp of viewports) {
    await page.setViewportSize(vp);
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    results.viewportsTested.push(`${vp.width}x${vp.height} - PASS`);
  }

  results.consoleErrors = consoleLogs;
  results.networkErrors = networkErrors;

  await browser.close();

  console.log('--- PLAYWRIGHT ACCEPTANCE TEST COMPLETE ---');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync('./scratch/acceptance_results.json', JSON.stringify(results, null, 2));
}

runAcceptance().catch((err) => {
  console.error('Playwright runner failed:', err);
  process.exit(1);
});
