import { test, expect } from '@playwright/test';

test('Verify Firebase config values', async ({ page }) => {
  const consoleMessages: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log(`CONSOLE [${msg.type()}]: ${text}`);
  });

  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Check for our Firebase config log
  const firebaseConfigLogs = consoleMessages.filter(m => m.includes('Firebase config loaded'));
  console.log('Firebase config logs:', firebaseConfigLogs);
  
  // Check for auth/invalid-api-key
  const authErrors = consoleMessages.filter(m => m.includes('auth/invalid-api-key') || m.includes('Invalid API key'));
  console.log('Auth errors:', authErrors);
  
  // Check for any Firebase error
  const firebaseErrors = consoleMessages.filter(m => m.includes('Error') && (m.includes('Firebase') || m.includes('firebase')));
  console.log('Firebase errors:', firebaseErrors);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/fireverification.png', fullPage: true });
});
