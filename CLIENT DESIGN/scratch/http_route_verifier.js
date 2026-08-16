import http from 'http';
import fs from 'fs';

const baseUrl = 'http://127.0.0.1:3003';
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

async function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const hasRoot = body.includes('id="root"');
        const hasScript = body.includes('src="/src/main.tsx"');
        resolve({
          path,
          statusCode: res.statusCode,
          contentLength: body.length,
          hasRoot,
          hasScript,
          status: res.statusCode === 200 && hasRoot && hasScript ? 'PASS' : 'FAIL',
        });
      });
    }).on('error', (err) => {
      console.error(`Err on ${path}:`, err);
      resolve({ path, statusCode: 'ERROR', error: err.message, status: 'FAIL' });
    });
  });
}

async function run() {
  console.log('--- STARTING ROUTE VERIFICATION ON LOCALHOST:3003 ---');
  const results = [];
  for (const route of routes) {
    const res = await checkRoute(route);
    console.log(`Route ${route}: ${res.status} (${res.statusCode}, ${res.contentLength} bytes)`);
    results.push(res);
  }
  fs.writeFileSync('./scratch/route_verification_results.json', JSON.stringify(results, null, 2));
}

run();
