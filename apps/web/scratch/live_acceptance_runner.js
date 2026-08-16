import { chromium } from 'playwright';
import fs from 'fs';

async function runAuthAcceptance() {
  console.log('--- STARTING PLAYWRIGHT AUTH & PROTECTED ROUTING TEST ---');
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

  const baseUrl = 'http://127.0.0.1:3003';
  const testResults = {
    rootRedirectToLogin: false,
    adminProtectedRedirectToLogin: false,
    specificRouteRedirectToLogin: false,
    loginElementsVerified: {
      emailInput: false,
      passwordInput: false,
      loginButton: false,
      googleButton: false,
    },
    directProtectedUrlResults: [],
    consoleErrorsCount: 0,
    blackScreensCount: 0,
  };

  // Test 1: Open / -> should redirect to /login
  console.log('1. Testing Root / route redirection...');
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(500);
  const currentUrlRoot = page.url();
  console.log(`Root / redirected to: ${currentUrlRoot}`);
  if (currentUrlRoot.includes('/login')) {
    testResults.rootRedirectToLogin = true;
  }

  // Verify Login Page DOM elements
  console.log('2. Verifying Login Page elements...');
  const hasEmail = await page.locator('input[type="email"]').isVisible().catch(() => false);
  const hasPassword = await page.locator('input[type="password"]').isVisible().catch(() => false);
  const hasLoginBtn = await page.locator('button[type="submit"]').isVisible().catch(() => false);
  const hasGoogleBtn = await page.getByText('गूगल से प्रवेश करें').isVisible().catch(() => false);

  testResults.loginElementsVerified = {
    emailInput: hasEmail,
    passwordInput: hasPassword,
    loginButton: hasLoginBtn,
    googleButton: hasGoogleBtn,
  };

  // Test 3: Attempt direct navigation to protected routes while unauthenticated
  const protectedRoutes = [
    '/admin',
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

  console.log('3. Testing direct protected route access when unauthenticated...');
  for (const route of protectedRoutes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(300);
    const landingUrl = page.url();
    const isRedirectedToLogin = landingUrl.includes('/login');
    const bodyText = await page.innerText('body').catch(() => '');
    const isBlackScreen = bodyText.trim().length === 0;

    if (isBlackScreen) testResults.blackScreensCount++;

    testResults.directProtectedUrlResults.push({
      attemptedRoute: route,
      landingUrl,
      redirectedToLogin: isRedirectedToLogin,
      isBlackScreen,
      status: isRedirectedToLogin && !isBlackScreen ? 'PASS' : 'FAIL',
    });
  }

  testResults.consoleErrorsCount = consoleLogs.length;
  testResults.consoleErrors = consoleLogs;

  await browser.close();

  console.log('--- TEST COMPLETE ---');
  console.log(JSON.stringify(testResults, null, 2));

  fs.writeFileSync('./scratch/auth_routing_acceptance.json', JSON.stringify(testResults, null, 2));
}

runAuthAcceptance().catch((err) => {
  console.error('Playwright auth test failed:', err);
  process.exit(1);
});
