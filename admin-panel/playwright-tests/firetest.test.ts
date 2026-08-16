import { test, expect } from '@playwright/test';

test('Check Firebase config', async ({ page }) => {
  const consoleMessages: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log(`CONSOLE [${msg.type()}]: ${text}`);
  });

  await page.goto('/', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Check for auth/invalid-api-key
  const authErrors = consoleMessages.filter(m => m.includes('auth/invalid-api-key') || m.includes('Invalid API key'));
  console.log('Auth errors:', authErrors);
  
  // Check for any Firebase initialization
  const firebaseMsgs = consoleMessages.filter(m => m.includes('Firebase') || m.includes('firebase'));
  console.log('Firebase messages:', firebaseMsgs);
  
  // Check import.meta.env values
  const envMsgs = consoleMessages.filter(m => m.includes('import.meta.env') || m.includes('VITE_FIREBASE'));
  console.log('Env messages:', envMsgs);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/firetest.png', fullPage: true });
  
  console.log('\n--- ALL CONSOLE MESSAGES ---');
  consoleMessages.forEach(m => console.log(m));
});
