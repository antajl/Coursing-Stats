import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.resolve(ROOT, '../data/v1');
const TARGET_DIR = path.resolve(ROOT, 'public/data/v1');

/**
 * Must stay in sync with PUBLISH_EXCLUDE_PATTERNS in
 * backend/scripts/publish/verify-publish-gates.ts
 */
const EXCLUDE_PATTERNS = [
  'shows/indexes/dog-ranking.json', // all-time — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-01.json', // 20.8 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-02.json', // 20.6 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-03.json', // 20.4 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-04.json', // 20.3 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-05.json', // 20.6 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-06.json', // 20.4 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-07.json', // 20.3 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-08.json', // 20.3 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-09.json', // 20.3 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-10.json', // 20.3 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-11.json', // 20.2 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-12.json', // 20.2 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-13.json', // 20.4 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-14.json', // 20.3 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-15.json', // 20.5 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-16.json', // 20.7 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-17.json', // 20.0 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-18.json', // 20.4 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-19.json', // 20.5 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-20.json', // 20.6 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-21.json', // 20.7 MB — exceeds Cloudflare Pages 25 MiB
  'shows/indexes/dog-ranking-unknown.json', // 7.7 MB — backend-only
  'shows/indexes/show-dog-lookup.json', // old single file (replaced by sharded show-dog-lookup/)
  'shows/indexes/year-data', // year-data files exceed Cloudflare Pages 25 MiB
  'shows/exhibitions-rkf', // RAW data (44k+ files), should be in data/local/shows/
  'dogs/registry.json', // 126 MB, backend-only canonical registry
  'judges/registry.json', // backend-only canonical registry
  'pc-db.sqlite',
  'pc-db.sqlite.gz',
  'README.md',
  'publish-manifest.json',
  'audit', // build diagnostics are tracked but never shipped to the public CDN
];

function shouldExclude(relativePath) {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  const hit = EXCLUDE_PATTERNS.some(
    (pattern) =>
      normalizedPath === pattern ||
      normalizedPath.endsWith('/' + pattern) ||
      normalizedPath.includes(pattern),
  );
  if (hit) {
    console.log(`  Excluding: ${normalizedPath}`);
  }
  return hit;
}

function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDirectory(src, dest, relativePath = '') {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);

    if (shouldExclude(entryRelativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, entryRelativePath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying data/v1 to public/data (clean sync)…');
rmrf(TARGET_DIR);
copyDirectory(SOURCE_DIR, TARGET_DIR);
console.log('Data copied successfully!');
