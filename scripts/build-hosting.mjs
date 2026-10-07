/**
 * ============================================================================
 * Unified Firebase Hosting build
 * ============================================================================
 * Combines the two source applications into ONE deploy directory served by a
 * single Firebase Hosting site / public origin.
 *
 *   apps/website  -> dist/            (public website at the origin root)
 *   apps/web      -> dist/admin/      (admin dashboard at /admin/*)
 *
 * Website assets  -> /assets/*
 * Admin assets    -> /admin/assets/*  (no collision, thanks to base '/admin/')
 *
 * Guarantees:
 *   - dist/index.html        exists (website entry)
 *   - dist/admin/index.html  exists (admin entry)
 *   - admin index.html references absolute /admin/assets/* (not /assets/*)
 *   - no asset path collision between the two applications
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'dist');
const websiteDist = path.join(root, 'apps/website/dist');
const adminDist = path.join(root, 'apps/web/dist');
const adminOut = path.join(outDir, 'admin');

function run(cmd, cwd) {
  process.stdout.write(`\n▶ ${cmd}  (${path.relative(root, cwd) || '.'})\n`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

// Clean
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// Build both source applications
run('npm run build', path.join(root, 'apps/website'));
run('npm run build', path.join(root, 'apps/web'));

// Assemble unified deploy directory
copyDir(websiteDist, outDir);
copyDir(adminDist, adminOut);

// ---- Assertions ----
const fail = (msg) => {
  process.stderr.write(`\n✖ Build integrity check failed: ${msg}\n`);
  process.exit(1);
};

const websiteEntry = path.join(outDir, 'index.html');
const adminEntry = path.join(adminOut, 'index.html');
if (!fs.existsSync(websiteEntry)) fail('dist/index.html missing (website entry)');
if (!fs.existsSync(adminEntry)) fail('dist/admin/index.html missing (admin entry)');

const websiteHtml = fs.readFileSync(websiteEntry, 'utf8');
const adminHtml = fs.readFileSync(adminEntry, 'utf8');

// Admin assets must live under /admin/assets/* so they can never collide.
if (!adminHtml.includes('/admin/assets/')) {
  fail('admin index.html does not reference /admin/assets/* assets');
}

// Website assets must stay on the origin root (/assets/*) and never point at /admin.
const websiteAssetRefs = [...websiteHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
if (websiteAssetRefs.length === 0) fail('website index.html references no /assets/* bundles');
for (const ref of websiteAssetRefs) {
  const assetPath = path.join(outDir, ref.replace(/^\//, ''));
  if (!fs.existsSync(assetPath)) fail(`website asset missing: ${ref}`);
}

// Website must not contain admin-only static files that shadow the admin app.
if (fs.existsSync(path.join(outDir, 'robots.txt')) !== true) {
  fail('robots.txt missing from unified output');
}

// Summary
const size = (p) => fs.statSync(p).size;
process.stdout.write('\n────────────────────────────────────────────────────────\n');
process.stdout.write('Unified Hosting Build Complete\n');
process.stdout.write('────────────────────────────────────────────────────────\n');
process.stdout.write(`  dist/index.html                  ${size(websiteEntry).toLocaleString()} B\n`);
process.stdout.write(`  dist/admin/index.html            ${size(adminEntry).toLocaleString()} B\n`);
process.stdout.write(`  dist (total files)               ${countFiles(outDir)}\n`);
process.stdout.write('\n  Deploy with:  firebase deploy --only hosting\n');
process.stdout.write('────────────────────────────────────────────────────────\n');

function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) n += countFiles(path.join(dir, e.name));
    else n += 1;
  }
  return n;
}